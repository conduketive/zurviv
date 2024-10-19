import { randomBytes } from "crypto";
import { platform } from "os";
import { Worker } from "worker_threads";
import { type MapDef, MapDefs } from "../../../shared/defs/mapDefs";
import type { TeamMode } from "../../../shared/gameConfig";
import { assert } from "../../../shared/utils/util";
import { Config } from "../config";
import type { FindGameBody, GameServer } from "../gameServer";
import { Logger } from "../utils/logger";
import type {
    FindGameResponse,
    GameData,
    GameManager,
    ServerGameConfig,
} from "./gameManager";

let path: string;
let args: string[];
if (process.env.NODE_ENV === "production") {
    path = "./dist/server/src/game/gameThread.js";
    args = ["--enable-source-maps"];
} else {
    path = "./src/game/gameThread.ts";
    args = [];
}

export enum ThreadMsgType {
    Create,
    Created,
    KeepAlive,
    UpdateData,
    AddJoinToken,
    AddAppDescriptor,
}

export interface CreateGameMsg {
    type: ThreadMsgType.Create;
    config: ServerGameConfig;
    id: string;
}

export interface GameCreatedMsg {
    type: ThreadMsgType.Created;
}

export interface KeepAliveMsg {
    type: ThreadMsgType.KeepAlive;
}

export interface UpdateDataMsg extends GameData {
    type: ThreadMsgType.UpdateData;
}

export interface AddJoinTokenMsg {
    type: ThreadMsgType.AddJoinToken;
    token: string;
    autoFill: boolean;
    playerCount: number;
}

export interface AddAppDescriptorMsg {
    type: ThreadMsgType.AddAppDescriptor;
    descriptor: unknown;
}

export type ThreadMsg =
    | CreateGameMsg
    | GameCreatedMsg
    | KeepAliveMsg
    | UpdateDataMsg
    | AddJoinTokenMsg
    | AddAppDescriptorMsg;

class GameThread implements GameData {
    threadId: string;
    threadPort: number;

    worker: Worker;

    killed = false;

    canJoin = true;
    teamMode: TeamMode = 1;
    mapName = "";
    id = "";
    aliveCount = 0;
    startedTime = 0;
    stopped = true;

    manager: GameThreadManager;

    onCreatedCbs: Array<(_proc: typeof this) => void> = [];

    lastMsgTime = Date.now();

    stoppedTime = Date.now();

    avaliableSlots = 0;

    constructor(
        manager: GameThreadManager,
        id: string,
        config: ServerGameConfig,
        port: number,
    ) {
        this.manager = manager;

        this.threadId = randomBytes(8).toString("hex");
        this.threadPort = port;
        this.worker = new Worker(path, {
            argv: args,
            workerData: {
                port,
                threadId: this.threadId,
            },
        });

        this.worker.on("message", (msg: ThreadMsg) => {
            if (msg.type) {
                this.lastMsgTime = Date.now();
            }

            switch (msg.type) {
                case ThreadMsgType.Created:
                    for (const cb of this.onCreatedCbs) {
                        cb(this);
                    }
                    this.stopped = false;
                    this.onCreatedCbs.length = 0;
                    break;
                case ThreadMsgType.UpdateData:
                    this.canJoin = msg.canJoin;
                    this.teamMode = msg.teamMode;
                    this.mapName = msg.mapName;
                    if (this.id !== msg.id) {
                        this.manager.threadsById.delete(this.id);
                        this.id = msg.id;
                        this.manager.threadsById.set(this.id, this);
                    }
                    this.aliveCount = msg.aliveCount;
                    this.startedTime = msg.startedTime;
                    this.stopped = msg.stopped;
                    if (this.stopped) {
                        this.stoppedTime = Date.now();
                    }
                    break;
                case ThreadMsgType.AddAppDescriptor: {
                    // @ts-expect-error no typing for addChildAppDescriptor
                    this.manager.server.app.addChildAppDescriptor(msg.descriptor);
                    break;
                }
            }
        });

        this.worker.on("error", () => {
            this.killed = true;
        });
        this.worker.on("exit", () => {
            this.killed = true;
        });

        this.create(id, config);
    }

    send(msg: ThreadMsg) {
        if (this.killed) return;
        this.worker.postMessage(msg);
    }

    create(id: string, config: ServerGameConfig) {
        this.send({
            type: ThreadMsgType.Create,
            id,
            config,
        });
        this.id = id;
        this.teamMode = config.teamMode;
        this.mapName = config.mapName;

        const mapDef = MapDefs[this.mapName as keyof typeof MapDefs] as MapDef;
        this.avaliableSlots = mapDef.gameMode.maxPlayers;
    }

    addJoinToken(token: string, autoFill: boolean, playerCount: number) {
        this.send({
            type: ThreadMsgType.AddJoinToken,
            token,
            autoFill,
            playerCount,
        });
        this.avaliableSlots--;
    }
}

export class GameThreadManager implements GameManager {
    readonly threadsById = new Map<string, GameThread>();
    readonly threads: GameThread[] = [];

    readonly logger = new Logger("Game Thread Manager");

    portPool: number[] = [];

    constructor(readonly server: GameServer) {
        for (let i = 0; i < 512; i++) {
            this.portPool.push(server.port + i);
        }

        setInterval(() => {
            for (const gameProc of this.threads) {
                gameProc.send({
                    type: ThreadMsgType.KeepAlive,
                });

                if (Date.now() - gameProc.lastMsgTime > 10000) {
                    this.logger.log(
                        `Game ${gameProc.id} did not send a message in more 10 seconds, killing`,
                    );
                    this.killThread(gameProc);
                } else if (
                    gameProc.stopped &&
                    Date.now() - gameProc.stoppedTime > 60000
                ) {
                    this.logger.log(
                        `Game ${gameProc.id} stopped more than a minute ago, killing`,
                    );
                    this.killThread(gameProc);
                }
            }
        }, 5000);
    }

    getPlayerCount(): number {
        return this.threads.reduce((a, b) => {
            return a + b.aliveCount;
        }, 0);
    }

    async newGame(config: ServerGameConfig): Promise<GameThread> {
        let gameProc: GameThread | undefined;

        for (let i = 0; i < this.threads.length; i++) {
            const p = this.threads[i];
            if (p.stopped) {
                gameProc = p;
                break;
            }
        }

        const id = randomBytes(20).toString("hex");
        if (!gameProc) {
            const port = platform() === "linux" ? this.server.port : this.portPool.pop();
            assert(port, "Ran out of thread ports");

            gameProc = new GameThread(this, id, config, port);

            this.threads.push(gameProc);

            gameProc.worker.on("exit", () => {
                this.killThread(gameProc!);
            });
            gameProc.worker.on("error", () => {
                this.killThread(gameProc!);
            });
        } else {
            this.threadsById.delete(gameProc.id);
            gameProc.create(id, config);
        }

        this.threadsById.set(id, gameProc);

        return gameProc;
    }

    killThread(gameProc: GameThread): void {
        gameProc.worker.terminate();

        const idx = this.threads.indexOf(gameProc);
        if (idx !== -1) {
            this.threads.splice(idx, 1);
        }
        this.threadsById.delete(gameProc.id);
    }

    getById(id: string): GameData | undefined {
        return this.threadsById.get(id);
    }

    async findGame(body: FindGameBody): Promise<FindGameResponse> {
        const mode = Config.modes[body.gameModeIdx];

        let game = this.threads
            .filter((proc) => {
                return (
                    proc.canJoin &&
                    proc.avaliableSlots > 0 &&
                    proc.teamMode === mode.teamMode &&
                    proc.mapName === mode.mapName
                );
            })
            .sort((a, b) => {
                return a.startedTime - b.startedTime;
            })[0];

        const joinToken = randomBytes(20).toString("hex");

        if (!game) {
            game = await this.newGame({
                teamMode: mode.teamMode,
                mapName: mode.mapName,
            });
        }

        // if the game is not running
        // wait for it to be created to send the find game response
        if (game.stopped) {
            return new Promise((resolve) => {
                game.onCreatedCbs.push((game) => {
                    game.addJoinToken(joinToken, body.autoFill, body.playerCount);
                    resolve({
                        gameId: game.id,
                        data: joinToken,
                        route: `play_${game.threadId}`,
                    });
                });
            });
        }

        game.addJoinToken(joinToken, body.autoFill, body.playerCount);

        return {
            gameId: game.id,
            data: joinToken,
            route: `play_${game.threadId}`,
        };
    }
}
