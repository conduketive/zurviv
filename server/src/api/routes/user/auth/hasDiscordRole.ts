import { Config } from "../../../../config";

// unique to zurviv only, so hardcoding them for now
const GUILD_ID = "1007749611122855977";
const ROLE_ID = "1232222683832389642";

export async function getUserRolesInServer(
    userId: string,
    guildId = GUILD_ID,
): Promise<string[]> {
    if (!Config.secrets.DISCORD_BOT_TOKEN) {
        console.error("No discord bot token set, cannot fetch user roles");
        return [];
    }

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

        if (!response.ok) {
            if (response.status === 404) {
                console.error("User not found in server");
                return [];
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
        return [];
    }
}

export async function userHasRole(
    userId: string,
    guildId = GUILD_ID,
    roleId = ROLE_ID,
): Promise<boolean> {
    const roles = await getUserRolesInServer(userId, guildId);
    return roles.includes(roleId);
}
