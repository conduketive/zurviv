import { randomBytes } from "crypto";
import { platform } from "os";
import NanoTimer from "nanotimer";
import type { MapDefs } from "../../../shared/defs/mapDefs";
import type { TeamMode } from "../../../shared/gameConfig";
import { Config } from "../config";
import type { FindGameBody, GameServer } from "../gameServer";
import { setupGamePlayRoute } from "../utils/serverHelpers";
import { Game } from "./game";

export interface ServerGameConfig {
    readonly mapName: keyof typeof MapDefs;
    readonly teamMode: TeamMode;
}

export interface GameData {
    id: string;
    teamMode: TeamMode;
    mapName: string;
    canJoin: boolean;
    aliveCount: number;
    startedTime: number;
    stopped: boolean;
}

export interface FindGameResponse {
    gameId: string;
    data: string;
    route: string;
}

export abstract class GameManager {
    abstract getPlayerCount(): number;

    abstract getById(id: string): GameData | undefined;

    abstract findGame(body: FindGameBody): Promise<FindGameResponse>;
}

/**
 * Game manager that runs all game in the same process
 * Used for dev server
 */
export class SingleThreadGameManager implements GameManager {
    readonly gamesById = new Map<string, Game>();
    readonly games: Game[] = [];

    constructor(server: GameServer) {
        // setInterval on windows sucks
        // and doesn't give accurate timings
        if (platform() === "win32") {
            new NanoTimer().setInterval(
                () => {
                    this.update();
                },
                "",
                `${1000 / Config.gameTps}m`,
            );

            new NanoTimer().setInterval(
                () => {
                    this.netSync();
                },
                "",
                `${1000 / Config.netSyncTps}m`,
            );
        } else {
            setInterval(() => {
                this.update();
            }, 1000 / Config.gameTps);

            setInterval(() => {
                this.netSync();
            }, 1000 / Config.netSyncTps);
        }

        this.newGame(Config.modes[0]);

        setupGamePlayRoute(
            server.app,
            "/play",
            (id) => {
                return this.gamesById.has(id);
            },
            (socket, message) => {
                this.gamesById
                    .get(socket.getUserData().gameId)
                    ?.handleMsg(socket, message);
            },
            (socket) => {
                this.gamesById
                    .get(socket.getUserData().gameId)
                    ?.handleSocketClose(socket);
            },
        );
    }

    update(): void {
        for (let i = 0; i < this.games.length; i++) {
            const game = this.games[i];
            if (game.stopped) {
                this.games.splice(i, 1);
                i--;
                this.gamesById.delete(game.id);
                continue;
            }
            game.update();
        }
    }

    netSync(): void {
        for (let i = 0; i < this.games.length; i++) {
            this.games[i].netSync();
        }
    }

    getPlayerCount(): number {
        return this.games.reduce((a, b) => {
            return (
                a +
                (b ? b.playerBarn.livingPlayers.filter((p) => !p.disconnected).length : 0)
            );
        }, 0);
    }

    async newGame(config: ServerGameConfig): Promise<Game> {
        const id = randomBytes(20).toString("hex");
        const game = new Game(id, config);
        await game.init();
        this.games.push(game);
        this.gamesById.set(id, game);
        return game;
    }

    getById(id: string): GameData | undefined {
        return this.gamesById.get(id);
    }

    async findGame(body: FindGameBody): Promise<FindGameResponse> {
        const config = Config.modes[body.gameModeIdx];

        let game = this.games
            .filter((game) => {
                return (
                    game.canJoin &&
                    game.teamMode === config.teamMode &&
                    game.mapName === config.mapName
                );
            })
            .sort((a, b) => {
                return a.startedTime - b.startedTime;
            })[0];

        const mode = Config.modes[body.gameModeIdx];
        if (!game) {
            game = await this.newGame({
                teamMode: mode.teamMode,
                mapName: mode.mapName,
            });
        }

        const id = randomBytes(20).toString("hex");
        game.addJoinToken(id, body.autoFill, body.playerCount);

        return {
            gameId: game.id,
            data: id,
            route: "play",
        };
    }
}
