import { bannedIPs } from "./bannedIps";
import { encodeIP } from "./ipLogging";

export function isBanned(ip: string): boolean {
    const encodedIP = encodeIP(ip);
    console.log({
        ip,
        encodedIP
    })
    return bannedIPs.includes(encodedIP);
};