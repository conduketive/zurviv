import { Config } from "./config";

if (!Config.ipChecker) {
    throw new Error("IP Checker configuration is missing.");
}

const { key, baseUrl } = Config.ipChecker;

export async function checkIp(ip: string): Promise<boolean> {
    const url = `${baseUrl}/${ip}?key=${key}&risk=1&vpn=1`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Failed to fetch ProxyCheck API: ${response.statusText}`);
            return false;
        }

        const data = await response.json();
        const result = data[ip];

        if (result && result.proxy === "yes") {
            return false;
        }

        return true;

    } catch (error) {

        if (error instanceof Error) {
            console.error(`Error checking IP with ProxyCheck: ${error.message}`);
        } else {
            console.error("An unknown error occurred while checking the IP.");
        }
        return true;
    }
}