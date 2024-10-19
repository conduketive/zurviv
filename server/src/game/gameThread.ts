import { platform } from "os";
import NanoTimer from "nanotimer";
import { parentPort, workerData } from "worker_threads";
import { assert } from "../../../shared/utils/util";
import { Config } from "../config";
import { Logger } from "../utils/logger";
import { createUWSApp, setupGamePlayRoute } from "../utils/serverHelpers";
import { Game } from "./game";
import { type ThreadMsg, ThreadMsgType } from "./gameThreadManager";

assert(parentPort);

let game: Game | undefined;

function sendMsg(msg: ThreadMsg) {
    parentPort!.postMessage!(msg);
}

let lastMsgTime = Date.now();

const app = createUWSApp(Config.gameServer.ssl);

app.listen(Config.gameServer.host, workerData.port, () => {
    new Logger(`Thread ${workerData.threadId}`).log(
        `is listening on port ${workerData.port}`,
    );
});

setupGamePlayRoute(
    app,
    `/play_${workerData.threadId}`,
    (id) => {
        return !!game && game.id === id;
    },
    (socket, message) => {
        game?.handleMsg(socket, message);
    },
    (socket) => {
        game?.handleSocketClose(socket);
    },
);

sendMsg({
    type: ThreadMsgType.AddAppDescriptor,
    // @ts-expect-error
    descriptor: app.getDescriptor(),
});

parentPort.on("message", async (msg: ThreadMsg) => {
    if (msg.type) {
        lastMsgTime = Date.now();
    }

    if (msg.type === ThreadMsgType.Create && !game) {
        game = new Game(msg.id, msg.config, (msg) => {
            sendMsg(msg);
            if (msg.stopped) {
                game = undefined;
            }
        });

        await game.init();
        sendMsg({
            type: ThreadMsgType.Created,
        });
    }

    if (!game) return;

    switch (msg.type) {
        case ThreadMsgType.AddJoinToken:
            game.addJoinToken(msg.token, msg.autoFill, msg.playerCount);
            break;
    }
});

setInterval(() => {
    if (Date.now() - lastMsgTime > 10000) {
        console.log("Game process has not received a message in 10 seconds, exiting");
        process.exit();
    }

    if (game) {
        game?.updateData();
    } else {
        sendMsg({
            type: ThreadMsgType.KeepAlive,
        });
    }
}, 5000);

// setInterval on windows sucks
// and doesn't give accurate timings
if (platform() === "win32") {
    new NanoTimer().setInterval(
        () => {
            game?.update();
        },
        "",
        `${1000 / Config.gameTps}m`,
    );

    new NanoTimer().setInterval(
        () => {
            game?.netSync();
        },
        "",
        `${1000 / Config.netSyncTps}m`,
    );
} else {
    setInterval(() => {
        game?.update();
    }, 1000 / Config.gameTps);

    setInterval(() => {
        game?.netSync();
    }, 1000 / Config.netSyncTps);
}
