import { TeamMode } from "../../gameConfig";

export enum MapId {
    Main = 0,
    Desert = 1,
    Woods = 2,
    Faction = 3,
    Potato = 4,
    Savannah = 5,
    Halloween = 6,
    Cobalt = 7,

    // comp modes start at 50+
    CompMain = 50,
    EuCompMain = 51,
    
    LocalMain = 99,
    // custom zurviv modes starts at 100+
    GG = 100,
    Gamerio = 101,
    FactionPotato = 102,
    FactionHalloween = 103,
    

    // kong modes
    Inferno = 18,
}

export const TeamModeToString = {
    [TeamMode.Solo]: "solo",
    [TeamMode.Duo]: "duo",
    [TeamMode.Trio]: "trio",
    [TeamMode.Squad]: "squad",
};

export const OriginalTeamModes = [TeamMode.Solo, TeamMode.Duo, TeamMode.Squad];
