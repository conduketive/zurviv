import { App, type HttpResponse, SSLApp, type TemplatedApp } from "uWebSockets.js";
import type { WebSocket } from "uWebSockets.js";
import type { GameSocket, GameSocketData } from "../game/game";
/**
 * Apply CORS headers to a response.
 * @param res The response sent by the server.
 */
export function cors(res: HttpResponse): void {
    if (res.aborted) return;
    res.writeHeader("Access-Control-Allow-Origin", "*")
        .writeHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        .writeHeader(
            "Access-Control-Allow-Headers",
            "origin, content-type, accept, x-requested-with",
        )
        .writeHeader("Access-Control-Max-Age", "3600");
}

export function forbidden(res: HttpResponse): void {
    res.writeStatus("403").end("403 Forbidden");
}

export function InternalError(res: HttpResponse): void {
    res.writeStatus("500").end("500 Internal Server Error");
}

export function returnJson(res: HttpResponse, data: Record<string, unknown>): void {
    res.cork(() => {
        if (res.aborted) return;
        res.writeHeader("Content-Type", "application/json").end(JSON.stringify(data));
    });
}

/**
 * Read the body of a POST request.
 * @link https://github.com/uNetworking/uWebSockets.js/blob/master/examples/JsonPost.js
 * @param res The response from the client.
 * @param cb A callback containing the request body.
 * @param err A callback invoked whenever the request cannot be retrieved.
 */
export function readPostedJSON<T>(
    res: HttpResponse,
    cb: (json: T) => void,
    err: () => void,
): void {
    let buffer: Buffer | Uint8Array;
    /* Register data cb */
    res.onData((ab, isLast) => {
        const chunk = Buffer.from(ab);
        if (isLast) {
            let json: T;
            if (buffer) {
                try {
                    // @ts-expect-error JSON.parse can accept a Buffer as an argument
                    json = JSON.parse(Buffer.concat([buffer, chunk]));
                } catch (_e) {
                    /* res.close calls onAborted */
                    res.close();
                    return;
                }
                cb(json);
            } else {
                try {
                    // @ts-expect-error JSON.parse can accept a Buffer as an argument
                    json = JSON.parse(chunk);
                } catch (_e) {
                    /* res.close calls onAborted */
                    res.close();
                    return;
                }
                cb(json);
            }
        } else {
            if (buffer) {
                buffer = Buffer.concat([buffer, chunk]);
            } else {
                buffer = Buffer.concat([chunk]);
            }
        }
    });

    /* Register error cb */
    res.onAborted(err);
}

// credits: https://github.com/Blank-Cheque/Slurs
const badWordsFilter = [
    /(s[a4]nd)?n[ila4o10íĩî|!][gq]{1,2}(l[e3]t|[e3]r|[a4]|n[o0]g)?s?/,
    /f[a@4](g{1,2}|qq)([e3i1líĩî|!o0]t{1,2}(ry|r[i1líĩî|!]e)?)?/,
    /k[il1y]k[e3](ry|rie)?s?/,
    /tr[a4]n{1,2}([i1líĩî|!][e3]|y|[e3]r)s?/,
    /c[o0]{2}ns?/,
    /ch[i1líĩî|!]nks?/,
];

export function checkForBadWords(name: string) {
    name = name.toLowerCase();
    for (const regex of badWordsFilter) {
        if (name.match(regex)) return true;
    }
    return false;
}

export function createUWSApp(config?: {
    keyFile: string;
    certFile: string;
}): TemplatedApp {
    return config
        ? SSLApp({
              key_file_name: config.keyFile,
              cert_file_name: config.certFile,
              passphrase: "123",
          })
        : App();
}

export function setupGamePlayRoute(
    app: TemplatedApp,
    route: string,
    gameExists: (id: string) => boolean,
    onMessage: (socket: GameSocket, message: ArrayBuffer) => void,
    onClose: (socket: GameSocket) => void,
) {
    app.ws<GameSocketData>(route, {
        idleTimeout: 30,
        /**
         * Upgrade the connection to WebSocket.
         */
        upgrade(res, req, context) {
            res.onAborted((): void => {});

            const searchParams = new URLSearchParams(req.getQuery());
            const gameId = searchParams.get("gameId");

            if (!gameId || !gameExists(gameId)) {
                forbidden(res);
                return;
            }

            res.upgrade(
                {
                    gameId,
                    closed: false,
                    playerId: "",
                },
                req.getHeader("sec-websocket-key"),
                req.getHeader("sec-websocket-protocol"),
                req.getHeader("sec-websocket-extensions"),
                context,
            );
        },

        /**
         * Handle opening of the socket.
         * @param socket The socket being opened.
         */
        open(socket: WebSocket<GameSocketData>) {
            if (!gameExists(socket.getUserData().gameId)) {
                socket.close();
            }
        },

        /**
         * Handle messages coming from the socket.
         * @param socket The socket in question.
         * @param message The message to handle.
         */
        message(socket: WebSocket<GameSocketData>, message) {
            onMessage(socket, message);
        },

        /**
         * Handle closing of the socket.
         * @param socket The socket being closed.
         */
        close(socket: WebSocket<GameSocketData>) {
            socket.getUserData().closed = true;
            onClose(socket);
        },
    });
}
