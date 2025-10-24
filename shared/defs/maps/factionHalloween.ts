import { util } from "../../utils/util";
import type { MapDef } from "../mapDefs";
import { MapId } from "../types/misc";
import type { PartialMapDef } from "./baseDefs";
import { Faction } from "./factionDefs";
import { Halloween } from "./halloweenDefs";

export enum TeamColor {
    // NONE = 0, // can be used ambiguously with code that runs the same regardless of team color
    Red = 1,
    Blue = 2,
}

export const SpecialAirdropConfig = {
    startCircle: 1,
    endCircle: 3,
    aliveCountThreshold: 0.2,
};

const mapDef: PartialMapDef = {
    mapId: MapId.FactionHalloween,
    desc: {
        ...Faction.desc,
        buttonCss: Halloween.desc.buttonCss,
        backgroundImg: Halloween.desc.backgroundImg,
    },
    assets: {
        audio: [...Halloween.assets.audio, ...Faction.assets.audio],
        atlases: ["gradient", "loadout", "shared", "faction", "halloween"],
    },
    biome: { ...Halloween.biome },
    gameMode: {
        killLeaderEnabled: true,
        spookyKillSounds: true,
    },
    /* STRIP_FROM_PROD_CLIENT:START */
    lootTable: {
        ...Halloween.lootTable,
        ...Faction.lootTable,
        tier_container: [
            ...Faction.lootTable["tier_container"],
            { name: "tier_outfits", count: 1, weight: 0.1 },
        ],
        tier_toilet: [
            ...Faction.lootTable["tier_toilet"],
            { name: "tier_outfits", count: 1, weight: 0.1 },
        ],
        tier_outfits: [
            { name: "outfitBarrel", count: 1, weight: 1 },
            { name: "outfitWoodBarrel", count: 1, weight: 1 },
            { name: "outfitStone", count: 1, weight: 1 },
            { name: "outfitHalloweenTree", count: 1, weight: 1 },
            { name: "outfitStump", count: 1, weight: 1 },
            { name: "outfitBush", count: 1, weight: 1 },
            { name: "outfitLeafPile", count: 1, weight: 1 },
            { name: "outfitCrate", count: 1, weight: 1 },
            { name: "outfitTable", count: 1, weight: 1 },
            { name: "outfitSoviet", count: 1, weight: 1 },
            { name: "outfitOven", count: 1, weight: 1 },
            { name: "outfitRefrigerator", count: 1, weight: 1 },
            { name: "outfitVending", count: 1, weight: 1 },
            { name: "outfitPumpkin", count: 1, weight: 1 },
            { name: "outfitWoodpile", count: 1, weight: 1 },
            { name: "outfitToilet", count: 1, weight: 1 },
            { name: "outfitBushRiver", count: 1, weight: 1 },
            { name: "outfitCrab", count: 1, weight: 1 },
            { name: "outfitStumpAxe", count: 1, weight: 1 },
        ],
    },
    mapGen: {
        fixedSpawns: [
            {
                cache_pumpkin_01: 32,
                cache_pumpkin_03: 32,
                junkyard_01: 1,
                warehouse_01h: 4,
                house_red_01h: 7,
                barn_01h: 1,
                cache_03: 36,
                cache_01: 1,
                cache_02h: 1,
                mansion_structure_02: 1,
                bunker_structure_01: 1,
                bunker_structure_03: 1,
                bunker_structure_07: 1,
                mil_crate_02: { odds: 0.25 },
                tree_05: 72,
                tree_07: 700,
                tree_08: 200,
                tree_09: 36,
                barrel_02: 24,
                oven_01: 24,
                refrigerator_01: 24,
                table_01: 24,
                vending_01: 24,
                woodpile_01: 24,
                stone_04: 1,
            },
        ],
        spawnReplacements: [
            {
                tree_01: "tree_07",
                stone_03: "stone_01",
                cabin_01: "cabin_02",
            },
        ],
    },
    /* STRIP_FROM_PROD_CLIENT:END */
};

export const FactionHalloween = util.mergeDeep({}, Faction, mapDef) as MapDef;
