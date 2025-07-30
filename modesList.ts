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
    "comp_main",
    "GG",
    "gamerio",
] as const;

for (const mode of modes) {
    if (mode === "faction" || mode === "faction_potato") {
        MODES_LIST.push({ mapName: mode, teamMode: TeamMode.Squad, enabled: true });
        continue;
    }
    for (const teamMode of [TeamMode.Solo, TeamMode.Duo, TeamMode.Trio, TeamMode.Squad]) {
        MODES_LIST.push({ mapName: mode, teamMode, enabled: true });
    }
}

export const EVENT_MODES = ["GG", "gamerio", "faction_potato"].map((t) =>
    t.toLocaleLowerCase(),
);
