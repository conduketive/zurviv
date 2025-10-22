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
    "local_main",
    "faction_potato",
    "faction_halloween",
    "comp_main",
    "comp_eu_main",
    "GG",
    "gamerio",
    "inferno",
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

export const EVENT_MODES = [
    "GG",
    "gamerio",
    "faction_potato",
    "faction_halloween",
    "local_main",
].map((t) => t.toLocaleLowerCase());
