import { platform } from "os";
import NanoTimer from "nanotimer";
import { parentPort } from "worker_threads";
import { assert } from "../../../shared/utils/util";
import { Config } from "../config";
import { Game } from "./game";
import { type ProcessMsg, ProcessMsgType } from "./gameProcessManager";

assert(parentPort);

let game: Game | undefined;

function sendMsg(msg: ProcessMsg) {
    parentPort!.postMessage!(msg);
}

// parentPort.on("disconnect", () => {
// process.exit();
// });

const socketMsgs: Array<{
    socketId: string;
    buff: ArrayBuffer;
    length: number;
}> = [];

let lastMsgTime = Date.now();

parentPort.on("message", async (msg: ProcessMsg) => {
    if (msg.type) {
        lastMsgTime = Date.now();
    }

    if (msg.type === ProcessMsgType.Create && !game) {
        game = new Game(
            msg.id,
            msg.config,
            (id, buff, length) => {
                socketMsgs.push({
                    socketId: id,
                    buff,
                    length,
                });
            },
            (id) => {
                sendMsg({
                    type: ProcessMsgType.SocketClose,
                    socketId: id,
                });
            },
            (msg) => {
                sendMsg(msg);
                if (msg.stopped) {
                    game = undefined;
                }
            },
        );

        await game.init();
        sendMsg({
            type: ProcessMsgType.Created,
        });
    }

    if (!game) return;

    switch (msg.type) {
        case ProcessMsgType.AddJoinToken:
            game.addJoinToken(msg.token, msg.autoFill, msg.playerCount);
            break;
        case ProcessMsgType.SocketMsg:
            game.handleMsg(msg.msgs[0].buff, msg.msgs[0].socketId);
            break;
        case ProcessMsgType.SocketClose:
            game.handleSocketClose(msg.socketId);
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
            type: ProcessMsgType.KeepAlive,
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
            sendMsg({
                type: ProcessMsgType.SocketMsg,
                msgs: socketMsgs,
            });
            socketMsgs.length = 0;
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
        sendMsg({
            type: ProcessMsgType.SocketMsg,
            msgs: socketMsgs,
        });
        socketMsgs.length = 0;
    }, 1000 / Config.netSyncTps);
}
