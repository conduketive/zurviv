import { Config } from "../../../../config";

const GUILD_ID = "1385955477912948806";
const ROLE_ID = "1385963373564399616";

export async function getUserRolesInServer(
    userId: string,
    guildId = GUILD_ID,
): Promise<string[] | null> {
    try {
        const response = await fetch(
            `https://discord.com/api/guilds/${guildId}/members/${userId}`,
            {
                headers: {
                    Authorization: `Bot ${Config.secrets.DISCORD_BOT_TOKEN}`,
                    "Content-Type": "application/json",
                },
            },
        );

        console.log({ response });
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Discord API error: ${response.status}`);
        }

        const memberData = (await response.json()) as {
            roles: string[];
            user: {
                id: string;
                username: string;
            };
        };

        return memberData.roles;
    } catch (error) {
        console.error("Error fetching user roles:", error);
        return null;
    }
}

export async function userHasRole(
    userId: string,
    guildId = GUILD_ID,
    roleId = ROLE_ID,
): Promise<boolean> {
    const roles = await getUserRolesInServer(userId, guildId);
    return roles ? roles.includes(roleId) : false;
}
