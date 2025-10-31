import type { ConfigType } from "./configType";
import type { MapDefs } from "./shared/defs/mapDefs";
import { TeamMode } from "./shared/gameConfig";
import type { SiteInfoRes } from "./shared/types/api";

export const MODES_LIST: ConfigType["modes"] = [];

const modes: Array<keyof typeof MapDefs> = [
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
    "birthday",
];

for (const mode of modes) {
    if (mode.startsWith("faction")) {
        MODES_LIST.push({ mapName: mode, teamMode: TeamMode.Squad, enabled: true });
        continue;
    }
    for (const teamMode of [TeamMode.Solo, TeamMode.Duo, TeamMode.Trio, TeamMode.Squad]) {
        MODES_LIST.push({ mapName: mode, teamMode, enabled: true });
    }
}

export type GameMode = "casual" | "competitive" | "event" | "other";

const EVENT_MODES = ["GG", "gamerio", "faction_potato", "faction_halloween"].map((t) =>
    t.toLocaleLowerCase(),
);

const OTHER_MODES = ["local_main"];

export function getMapType(mode: SiteInfoRes["modes"][number]): GameMode {
    const mapName = mode.mapName.toLowerCase();

    if (mapName.startsWith("comp_")) return "competitive";
    if (EVENT_MODES.includes(mapName)) return "event";
    if (OTHER_MODES.includes(mapName)) return "other";

    return "casual";
}
