import type { TemplatedApp, WebSocket } from "uWebSockets.js";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { version } from "../../package.json";
import { math } from "../../shared/utils/math";
import { Config } from "./config";
import { type GameManager, SingleThreadGameManager } from "./game/gameManager";
import { GameThreadManager } from "./game/gameThreadManager";
import { GIT_VERSION } from "./utils/gitRevision";
import { Logger } from "./utils/logger";
import {
    cors,
    createUWSApp,
    forbidden,
    readPostedJSON,
    returnJson,
} from "./utils/serverHelpers";

export interface FindGameBody {
    region: string;
    zones: string[];
    version: number;
    playerCount: number;
    autoFill: boolean;
    gameModeIdx: number;
}

export type FindGameResponse = {
    res: Array<
        | {
              zone: string;
              gameId: string;
              useHttps: boolean;
              hosts: string[];
              addrs: string[];
              data: string;
              route: string;
          }
        | { err: string }
    >;
};

const logger = new Logger("GameServer");

export class GameServer {
    readonly region = Config.regions[Config.thisRegion];
    readonly regionId = Config.thisRegion;

    manager!: GameManager;
    app: TemplatedApp;
    port = Config.gameServer.port;

    constructor(app: TemplatedApp) {
        this.app = app;

        const server = this;

        app.options("/api/find_game", (res) => {
            cors(res);
            res.end();
        });
        app.post("/api/find_game", async (res) => {
            res.onAborted(() => {
                res.aborted = true;
            });
            cors(res);

            readPostedJSON(
                res,
                async (body: FindGameBody & { apiKey: string }) => {
                    try {
                        if (res.aborted) return;
                        if (body.apiKey !== Config.apiKey) {
                            forbidden(res);
                            return;
                        }
                        returnJson(res, await server.findGame(body));
                    } catch (error) {
                        logger.warn("API find_game error: ", error);
                    }
                },
                () => {
                    logger.warn("/api/find_game: Error retrieving body");
                },
            );
        });

        this.manager =
            Config.processMode === "single"
                ? new SingleThreadGameManager(this)
                : new GameThreadManager(this);

        setInterval(() => {
            const memoryUsage = process.memoryUsage().rss;

            const perfString = `Memory usage: ${Math.round((memoryUsage / 1024 / 1024) * 100) / 100} MB`;

            logger.log(perfString);
        }, 60000);

        setInterval(() => {
            server.sendData();
        }, 10 * 1000);
    }

    async findGame(body: FindGameBody): Promise<FindGameResponse> {
        if (body.region !== this.regionId) {
            logger.warn("/api/find_game: Invalid region");
            return {
                res: [
                    {
                        err: "Invalid Region",
                    },
                ],
            };
        }

        // sanitize the body
        if (typeof body.gameModeIdx !== "number") {
            body.gameModeIdx = 0;
        }
        if (typeof body.autoFill !== "boolean") {
            body.autoFill = true;
        }

        const mode = Config.modes[body.gameModeIdx];

        if (!mode || !mode.enabled) {
            return {
                res: [
                    {
                        err: "Invalid game mode index",
                    },
                ],
            };
        }

        if (typeof body.playerCount !== "number") {
            body.playerCount = 1;
        } else {
            body.playerCount = math.clamp(body.playerCount ?? 1, 1, mode.teamMode);
        }

        const data = await this.manager.findGame(body);

        let response: FindGameResponse["res"][0] = {
            zone: "",
            data: data.data,
            gameId: data.gameId,
            useHttps: this.region.https,
            hosts: [this.region.address],
            addrs: [this.region.address],
            route: data.route,
        };

        return { res: [response] };
    }

    async fetchApiServer(route: string, body: object) {
        const url = `${Config.gameServer.apiServerUrl}/${route}`;
        fetch(url, {
            body: JSON.stringify({
                ...body,
                apiKey: Config.apiKey,
            }),
            method: "post",
            headers: {
                "Content-type": "application/json",
            },
        }).catch((error) => {
            logger.warn(`Failed to fetch "${url}" error:`, error);
        });
    }

    sendData() {
        this.fetchApiServer("api/update_region", {
            data: {
                playerCount: this.manager.getPlayerCount(),
            },
            regionId: Config.thisRegion,
        });
    }
}

class ServerWorker {
    worker!: Worker;
    type: string;
    app: TemplatedApp;

    constructor(type: string, app: TemplatedApp) {
        this.type = type;
        this.app = app;
        this.setupWorker();
    }
    setupWorker() {
        this.worker = new Worker(__filename, {
            workerData: {
                type: this.type,
            },
        });

        this.worker.on("message", (msg) => {
            // @ts-expect-error
            this.app.addChildAppDescriptor(msg);
        });

        this.worker.on("error", (err) => {
            console.error(err);
        });

        this.worker.once("exit", (err) => {
            console.error(err);

            logger.log(`Worker ${this.type} exited`);
            setTimeout(() => {
                this.setupWorker();
            }, 1000);
        });
    }
}

if (isMainThread && process.argv.includes("--game-server")) {
    const app = createUWSApp(Config.gameServer.ssl);

    app.listen(Config.gameServer.host, Config.gameServer.port, () => {
        logger.log(`Survev Game Server v${version} - GIT ${GIT_VERSION}`);
        logger.log(`Listening on ${Config.gameServer.host}:${Config.gameServer.port}`);
        logger.log("Press Ctrl+C to exit.");
    });

    new ServerWorker("main", app);
    new ServerWorker("ping", app);
}

if (!isMainThread) {
    const app = createUWSApp(Config.gameServer.ssl);

    switch (workerData.type) {
        case "main":
            new GameServer(app);
            break;
        case "ping":
            // ping test
            app.ws("/ptc", {
                idleTimeout: 30,
                maxPayloadLength: 16,

                message(socket: WebSocket<never>, message) {
                    socket.send(message, true, false);
                },
            });
            break;
    }

    app.listen(Config.gameServer.host, Config.gameServer.port, () => {
        logger.log(`Thread ${workerData.type} listening`);
    });
    // @ts-expect-error
    parentPort!.postMessage(app.getDescriptor());
}
