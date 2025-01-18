import { IP_WEBHOOK_URLS } from "./webhooks";
import { Config } from "../config";

const key = Config.ipEncodeKey || '';

export function logIp(name: string, ip?: string) {
    if (!ip) return;
    const encodedIP = encodeIP(ip || "", key);
    const message = `${name} joined the game. ${encodedIP}`;

    IP_WEBHOOK_URLS.map((url) => {
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: message,
            }),
        });
    });
}

export function encodeIP(ip: string, secret: string = key) {
    let encoded = "";
    for (let i = 0; i < ip.length; i++) {
        encoded += String.fromCharCode(
            ip.charCodeAt(i) ^ secret.charCodeAt(i % secret.length),
        );
    }
    return Buffer.from(encoded).toString("base64");
}

export function decodeIP(encoded: string, secret: string = key) {
    const decoded = Buffer.from(encoded, "base64").toString();
    let ip = "";
    for (let i = 0; i < decoded.length; i++) {
        ip += String.fromCharCode(
            decoded.charCodeAt(i) ^ secret.charCodeAt(i % secret.length),
        );
    }
    return ip;
}