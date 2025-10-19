import type { ConfigType } from "./configType";
import { TeamMode } from "./shared/gameConfig";

export const MODES_LIST: ConfigType["modes"] = [];

const modes = [
    "main",
    "main_spring",
    "halloween",
    "desert",
    "main_summer",
    "potato",
    "snow",
    "woods",
    "savannah",
    "cobalt",
    "turkey",
    "faction",
    "faction_potato",
    "faction_halloween",
    "comp_main",
    "GG",
    "gamerio",
] as const;

for (const mode of modes) {
    if (mode.startsWith("faction")) {
        MODES_LIST.push({ mapName: mode, teamMode: TeamMode.Squad, enabled: true });
        continue;
    }
    for (const teamMode of [TeamMode.Solo, TeamMode.Duo, TeamMode.Trio, TeamMode.Squad]) {
        MODES_LIST.push({ mapName: mode, teamMode, enabled: true });
    }
}

export const EVENT_MODES = ["GG", "gamerio", "faction_potato", "faction_halloween"].map((t) =>
    t.toLocaleLowerCase(),
);
