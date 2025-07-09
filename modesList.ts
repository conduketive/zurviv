import type { ConfigType } from "./configType";
import { TeamMode } from "./shared/gameConfig";

export const MODES_LIST: ConfigType["modes"] = [
    { mapName: "main", teamMode: TeamMode.Solo, enabled: true },
    { mapName: "main", teamMode: TeamMode.Duo, enabled: true },
    { mapName: "main", teamMode: TeamMode.Trio, enabled: true },
    { mapName: "main", teamMode: TeamMode.Squad, enabled: true },

    { mapName: "main_spring", teamMode: TeamMode.Solo, enabled: true },
    { mapName: "main_spring", teamMode: TeamMode.Duo, enabled: true },
    { mapName: "main_spring", teamMode: TeamMode.Trio, enabled: true },
    { mapName: "main_spring", teamMode: TeamMode.Squad, enabled: true },

    { mapName: "halloween", teamMode: TeamMode.Solo, enabled: true },
    { mapName: "halloween", teamMode: TeamMode.Duo, enabled: true },
    { mapName: "halloween", teamMode: TeamMode.Trio, enabled: true },
    { mapName: "halloween", teamMode: TeamMode.Squad, enabled: true },

    { mapName: "desert", teamMode: TeamMode.Solo, enabled: true },
    { mapName: "desert", teamMode: TeamMode.Duo, enabled: true },
    { mapName: "desert", teamMode: TeamMode.Trio, enabled: true },
    { mapName: "desert", teamMode: TeamMode.Squad, enabled: true },

    { mapName: "main_summer", teamMode: TeamMode.Solo, enabled: true },
    { mapName: "main_summer", teamMode: TeamMode.Duo, enabled: true },
    { mapName: "main_summer", teamMode: TeamMode.Trio, enabled: true },
    { mapName: "main_summer", teamMode: TeamMode.Squad, enabled: true },

    { mapName: "potato", teamMode: TeamMode.Solo, enabled: true },
    { mapName: "potato", teamMode: TeamMode.Duo, enabled: true },
    { mapName: "potato", teamMode: TeamMode.Trio, enabled: true },
    { mapName: "potato", teamMode: TeamMode.Squad, enabled: true },

    { mapName: "snow", teamMode: TeamMode.Solo, enabled: true },
    { mapName: "snow", teamMode: TeamMode.Duo, enabled: true },
    { mapName: "snow", teamMode: TeamMode.Trio, enabled: true },
    { mapName: "snow", teamMode: TeamMode.Squad, enabled: true },

    { mapName: "woods", teamMode: TeamMode.Solo, enabled: true },
    { mapName: "woods", teamMode: TeamMode.Duo, enabled: true },
    { mapName: "woods", teamMode: TeamMode.Trio, enabled: true },
    { mapName: "woods", teamMode: TeamMode.Squad, enabled: true },

    { mapName: "savannah", teamMode: TeamMode.Solo, enabled: true },
    { mapName: "savannah", teamMode: TeamMode.Duo, enabled: true },
    { mapName: "savannah", teamMode: TeamMode.Trio, enabled: true },
    { mapName: "savannah", teamMode: TeamMode.Squad, enabled: true },

    { mapName: "cobalt", teamMode: TeamMode.Solo, enabled: true },
    { mapName: "cobalt", teamMode: TeamMode.Duo, enabled: true },
    { mapName: "cobalt", teamMode: TeamMode.Trio, enabled: true },
    { mapName: "cobalt", teamMode: TeamMode.Squad, enabled: true },

    { mapName: "turkey", teamMode: TeamMode.Solo, enabled: true },
    { mapName: "turkey", teamMode: TeamMode.Duo, enabled: true },
    { mapName: "turkey", teamMode: TeamMode.Trio, enabled: true },
    { mapName: "turkey", teamMode: TeamMode.Squad, enabled: true },

    { mapName: "faction", teamMode: TeamMode.Squad, enabled: true },

    // Events
    { mapName: "GG", teamMode: TeamMode.Solo, enabled: true },
    { mapName: "GG", teamMode: TeamMode.Duo, enabled: true },
    { mapName: "GG", teamMode: TeamMode.Trio, enabled: true },
    { mapName: "GG", teamMode: TeamMode.Squad, enabled: true },

    { mapName: "gamerio", teamMode: TeamMode.Solo, enabled: true },
    { mapName: "gamerio", teamMode: TeamMode.Duo, enabled: true },
    { mapName: "gamerio", teamMode: TeamMode.Trio, enabled: true },
    { mapName: "gamerio", teamMode: TeamMode.Squad, enabled: true },
];
