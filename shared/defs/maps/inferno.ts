import { GameConfig } from "../../gameConfig";
import { util } from "../../utils/util";
import { v2 } from "../../utils/v2";
import type { MapDef } from "../mapDefs";
import { MapId } from "../types/misc";
import { Main, type PartialMapDef } from "./baseDefs";

const mapDef: PartialMapDef = {
    mapId: MapId.Inferno,
    desc: {
        name: "Inferno",
        icon: "img/gui/inferno.svg",
        buttonCss: "btn-mode-inferno",
    },
    assets: {
        audio: [
            { name: "vault_change_02", channel: "sfx" },
            { name: "footstep_08", channel: "sfx" },
            { name: "footstep_09", channel: "sfx" },
        ],
        atlases: ["gradient", "loadout", "shared", "desert", "main", "inferno"],
    },
    biome: {
        colors: {
            background: 0x20536e,
            water: 0xfe8438,
            waterRipple: 0xfe8438,
            beach: 0x534d45,
            riverbank: 0x252525,
            grass: 0x3c3c3c,
            underground: 0x1b0d03,
            playerSubmerge: 0xffffff,
            playerGhillie: 0x83af50,
        },
    },
    gameMode: { maxPlayers: 80 },
    gameConfig: {
        /* STRIP_FROM_PROD_CLIENT:START */
        planes: {
            timings: [
                {
                    circleIdx: 1,
                    wait: 10,
                    options: { type: GameConfig.Plane.Airdrop },
                },
                {
                    circleIdx: 3,
                    wait: 2,
                    options: { type: GameConfig.Plane.Airdrop },
                },
            ],
            crates: [
                { name: "airdrop_crate_01", weight: 10 },
                { name: "airdrop_crate_02", weight: 1 },
            ],
        },
        /* STRIP_FROM_PROD_CLIENT:END */
        bagSizes: {
            frag: [6, 12, 15, 18],
            smoke: [6, 12, 15, 18],
        },
    },
    /* STRIP_FROM_PROD_CLIENT:START */

    mapGen: {
        map: {
            baseWidth: 512,
            baseHeight: 512,
            scale: { small: 1.1875, large: 1.21875 },
            shoreInset: 8,
            grassInset: 12,
            rivers: {
                lakes: [
                    {
                        odds: 1,
                        innerRad: 32,
                        outerRad: 86,
                        spawnBound: {
                            pos: v2.create(0.5, 0.5),
                            rad: 100,
                        },
                    },
                ],
                weights: [
                    { weight: 0.1, widths: [4] },
                    { weight: 0.15, widths: [8] },
                    { weight: 0.25, widths: [8, 4] },
                    { weight: 0.21, widths: [8] },
                    { weight: 0.09, widths: [8, 8] },
                    { weight: 0.2, widths: [8, 8, 4] },
                    {
                        weight: 1e-4,
                        widths: [8, 8, 8, 6, 4],
                    },
                ],
                smoothness: 0.45,
                masks: [],
            },
        },
        densitySpawns: [
            {
                stone_01: 48,
                tree_30: 200,
                barrel_01: 36,
                crate_01: 60,
                crate_03: 12,
                bush_30: 54,
                hedgehog_01: 12,
                container_01: 2,
                container_02: 2,
                container_03: 2,
                container_04: 2,
                shack_01: 2,
                outhouse_01: 1,
                loot_tier_1: 36,
                loot_tier_beach: 8,
            },
        ],
        fixedSpawns: [
            {
                warehouse_01: 2,
                house_red_01: { small: 3, large: 4 },
                house_red_02: { small: 3, large: 4 },
                barn_01: { small: 2, large: 3 },
                barn_02: 1,
                hut_01: 3,
                hut_02: 1, // spas hut
                hut_03: 1, // scout hut
                shack_03a: 2,
                shack_03b: { small: 2, large: 3 },
                greenhouse_02: 1,
                cache_01: 1,
                cache_02: 1, // mosin tree
                cache_07: 1,
                bunker_structure_01: { odds: 0.05 },
                bunker_structure_02: 1,
                bunker_structure_03: 1,
                bunker_structure_04: 1,
                bunker_structure_05: 1,
                warehouse_complex_01: 1,
                chest_01: 1,
                chest_03: { odds: 0.2 },
                mil_crate_02: { odds: 0.25 },
                tree_02: 3,
                teahouse_complex_01su: {
                    small: 1,
                    large: 2,
                },
                stone_04: 1,
                club_complex_01: 1,
            },
        ],
        randomSpawns: [
            {
                spawns: ["mansion_structure_01", "police_01", "bank_01"],
                choose: 2,
            },
        ],
        spawnReplacements: [
            {
                tree_01: "tree_30",
            },
        ],
    },
    /* STRIP_FROM_PROD_CLIENT:END */
};
export const inferno = util.mergeDeep({}, Main, mapDef) as MapDef;
