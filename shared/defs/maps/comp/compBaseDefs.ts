import { GameConfig } from "../../../gameConfig";
import { v2 } from "../../../utils/v2";
import type { MapDef } from "../../mapDefs";
import { MapId } from "../../types/misc";

// @NOTE: Entries defined as single-element arrays, like fixedSpawns: [{ }],
// are done this way so that util.mergeDeep(...) will function as expected
// when used by derivative maps.
//
// Arrays are not mergeable, so the derived map will always redefine all
// elements if that property is set.

export const CompMain: MapDef = {
    mapId: MapId.CompMain,
    desc: { name: "Comp Normal", icon: "", buttonCss: "" },
    assets: {
        audio: [
            { name: "club_music_01", channel: "ambient" },
            { name: "club_music_02", channel: "ambient" },
            { name: "ambient_steam_01", channel: "ambient" },
            { name: "log_11", channel: "sfx" },
            { name: "log_12", channel: "sfx" },
        ],
        atlases: ["gradient", "loadout", "shared", "main"],
    },
    biome: {
        colors: {
            background: 0x20536e,
            water: 0x3282ab,
            waterRipple: 0xb3f0ff,
            beach: 0xcdb35b,
            riverbank: 0x905e24,
            grass: 0x80af49,
            underground: 0x1b0d03,
            playerSubmerge: 0x2b8ca4,
            playerGhillie: 0x83af50,
        },
        valueAdjust: 1,
        sound: { riverShore: "sand" },
        particles: { camera: "" },
        tracerColors: {},
        airdrop: {
            planeImg: "map-plane-01.img",
            planeSound: "plane_01",
            airdropImg: "map-chute-01.img",
        },
    },
    gameMode: {
        maxPlayers: 80,
        killLeaderEnabled: true,
    },
    gameConfig: {
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
                { name: "airdrop_crate_01", weight: 8 },
                { name: "airdrop_crate_02", weight: 2 },
            ],
        },
        bagSizes: {},   
        bleedDamage: 2,
        bleedDamageMult: 1,
    },
    /* STRIP_FROM_PROD_CLIENT:START */
    // NOTE: this loot table is not the original one so its not accurate
    // ? are guesses based on statistics
    // ! are uncertain data based on leak
    lootTable: {
        tier_world: [
            { name: "tier_guns", count: 1, weight: 0.25 }, // TODO get more data on this from original
            { name: "tier_ammo", count: 1, weight: 0.05 }, // ?
            { name: "tier_scopes", count: 1, weight: 0.15 }, // ?
            { name: "tier_armor", count: 1, weight: 0.15 }, // ?
            { name: "tier_medical", count: 1, weight: 0.15 }, // ?
            { name: "tier_throwables", count: 1, weight: 0.05 }, // ?
            { name: "tier_packs", count: 1, weight: 0.10 }, // ?
        ],
        tier_surviv: [
            { name: "tier_guns", count: 1, weight: 0.25 }, // TODO get more data on this from original
            { name: "tier_ammo", count: 1, weight: 0.05 }, // ?
            { name: "tier_scopes", count: 1, weight: 0.15 }, // ?
            { name: "tier_armor", count: 1, weight: 0.15 }, // ?
            { name: "tier_medical", count: 1, weight: 0.15 }, // ?
            { name: "tier_throwables", count: 1, weight: 0.05 }, // ?
            { name: "tier_packs", count: 1, weight: 0.10 }, // ?
        ],
        tier_container: [
            { name: "tier_guns", count: 1, weight: 0.25 }, // TODO get more data on this from original
            { name: "tier_ammo", count: 1, weight: 0.05 }, // ?
            { name: "tier_scopes", count: 1, weight: 0.15 }, // ?
            { name: "tier_armor", count: 1, weight: 0.15 }, // ?
            { name: "tier_medical", count: 1, weight: 0.15 }, // ?
            { name: "tier_throwables", count: 1, weight: 0.05 }, // ?
            { name: "tier_packs", count: 1, weight: 0.10 }, // ?
        ],
        tier_leaf_pile: [
            { name: "tier_ammo", count: 1, weight: 0.2 },
            { name: "tier_scopes", count: 1, weight: 0.2 },
            { name: "tier_armor", count: 1, weight: 0.2 },
            { name: "tier_medical", count: 1, weight: 0.2 },
            { name: "tier_throwables", count: 1, weight: 0.15 },
            { name: "tier_packs", count: 1, weight: 0.05 },
        ],
        tier_soviet: [
            { name: "tier_guns", count: 1, weight: 3 }, // ?
            { name: "tier_armor", count: 1, weight: 2 }, // ?
            { name: "tier_packs", count: 1, weight: 1 }, // ?
        ],
        tier_toilet: [
            { name: "tier_guns", count: 1, weight: 0.25 }, // TODO get more data on this from original
            { name: "tier_ammo", count: 1, weight: 0.05 }, // ?
            { name: "tier_scopes", count: 1, weight: 0.15 }, // ?
            { name: "tier_armor", count: 1, weight: 0.15 }, // ?
            { name: "tier_medical", count: 1, weight: 0.15 }, // ?
            { name: "tier_throwables", count: 1, weight: 0.05 }, // ?
            { name: "tier_packs", count: 1, weight: 0.10 }, // ?
        ],
        tier_scopes: [
            { name: "2xscope", count: 1, weight: 12},
            { name: "4xscope", count: 1, weight: 6 },
            // { name: "8xscope", count: 1, weight: 1 }, // ?
            // { name: "15xscope", count: 1, weight: 0.02 }, // ?
        ],
        tier_armor: [
            { name: "helmet01", count: 1, weight: 12 }, // !
            { name: "helmet02", count: 1, weight: 6 },
            { name: "helmet03", count: 1, weight: 2 },
            { name: "chest01", count: 1, weight: 12 }, // !
            { name: "chest02", count: 1, weight: 6 },
            { name: "chest03", count: 1, weight: 1 },
        ],
        tier_packs: [
            { name: "backpack01", count: 1, weight: 12 }, // !
            { name: "backpack02", count: 1, weight: 6 },
            { name: "backpack03", count: 1, weight: 1 },
        ],
        tier_medical: [
            { name: "bandage", count: 5, weight: 12 },
            { name: "healthkit", count: 1, weight: 6 },
            { name: "soda", count: 1, weight: 12 },
            { name: "painkiller", count: 1, weight: 6 },
        ],
        tier_throwables: [
            { name: "frag", count: 2, weight: 6 }, // !
            { name: "smoke", count: 1, weight: 6 },
            { name: "mirv", count: 2, weight: 1 },
        ],
        tier_ammo: [
            { name: "9mm", count: 60, weight: 3 },
            { name: "762mm", count: 60, weight: 3 },
            { name: "556mm", count: 60, weight: 3 },
            { name: "45acp", count: 60, weight: 3 },
            { name: "12gauge", count: 10, weight: 3 },
        ],
        tier_ammo_crate: [
            { name: "9mm", count: 60, weight: 3 },
            { name: "762mm", count: 60, weight: 3 },
            { name: "556mm", count: 60, weight: 3 },
            { name: "45acp", count: 60, weight: 3 },
            { name: "12gauge", count: 10, weight: 3 },
            { name: "50AE", count: 21, weight: 1 },
            { name: "308sub", count: 5, weight: 1 },
            { name: "flare", count: 1, weight: 1 },
        ],
        tier_vending_soda: [
            { name: "soda", count: 2, weight: 3 }, // ?
            { name: "tier_ammo", count: 1, weight: 1 }, // ?
        ],
        tier_sv98: [{ name: "spas12", count: 1, weight: 1 }],
        tier_scopes_sniper: [
            { name: "4xscope", count: 1, weight: 5 }, // ?
            // { name: "8xscope", count: 1, weight: 1 }, // ?
            // { name: "15xscope", count: 1, weight: 0.02 }, // ?
        ],
        tier_mansion_floor: [{ name: "outfitCasanova", count: 1, weight: 1 },],
        tier_vault_floor: [{ name: "outfitJester", count: 1, weight: 1 }],
        tier_police_floor: [{ name: "outfitPrisoner", count: 1, weight: 1 }],
        tier_chrys_01: [{ name: "outfitImperial", count: 1, weight: 1 }],
        tier_chrys_02: [{ name: "katana", count: 1, weight: 1 }],
        tier_chrys_03: [
            { name: "2xscope", count: 1, weight: 5 }, // ?
            { name: "4xscope", count: 1, weight: 5 }, // ?
            // { name: "8xscope", count: 1, weight: 5 }, // ?
            // { name: "15xscope", count: 1, weight: 0.1 }, // ?
        ],
        tier_chrys_case: [
            { name: "tier_katanas", count: 1, weight: 6 }, // ?
            { name: "naginata", count: 1, weight: 1 }, // ?
        ],
        tier_eye_02: [{ name: "stonehammer", count: 1, weight: 1 }],
        tier_eye_block: [
            { name: "sv98", count: 1, weight: 12 },
            { name: "mosin", count: 1, weight: 10 },
            { name: "scout_elite", count: 1, weight: 8 },
            { name: "blr", count: 1, weight: 6 },
            { name: "model", count: 1, weight: 4 },
            { name: "vector45", count: 1, weight: 1 },
            { name: "flare_gun", count: 1, weight: 1 },
            { name: "healthkit", count: 4, weight: 1 },
            { name: "painkiller", count: 4, weight: 1 },
            { name: "m4a1", count: 1, weight: 1 },
            { name: "pkp", count: 1, weight: 1 },
            { name: "flare_gun_dual", count: 1, weight: 2 }, // !
            { name: "garand", count: 1, weight: 1 },
            { name: "strobe", count: 4, weight: 1 },
            { name: "m249", count: 1, weight: 1 },
            { name: "scorpion", count: 1, weight: 3 },
            { name: "bar", count: 1, weight: 1 }, // ?
            { name: "qbb97", count: 1, weight: 1 }, // ?
        ],
        tier_eye_stone: [
            { name: "sv98", count: 1, weight: 12 },
            { name: "mosin", count: 1, weight: 10 },
            { name: "scout_elite", count: 1, weight: 8 },
            { name: "blr", count: 1, weight: 6 },
            { name: "model", count: 1, weight: 4 },
            { name: "vector45", count: 1, weight: 1 },
            { name: "flare_gun", count: 1, weight: 1 },
            { name: "healthkit", count: 4, weight: 1 },
            { name: "painkiller", count: 4, weight: 1 },
            { name: "m4a1", count: 1, weight: 1 },
            { name: "pkp", count: 1, weight: 1 },
            { name: "flare_gun_dual", count: 1, weight: 2 }, // !
            { name: "garand", count: 1, weight: 1 },
            { name: "strobe", count: 4, weight: 1 },
            { name: "m249", count: 1, weight: 1 },
            { name: "scorpion", count: 1, weight: 3 },
            { name: "bar", count: 1, weight: 1 }, // ?
            { name: "qbb97", count: 1, weight: 1 }, // ?
        ],
        tier_sledgehammer: [{ name: "sledgehammer", count: 1, weight: 1 }],
        tier_chest_04: [
            { name: "p30l", count: 1, weight: 12 }, // ?
            { name: "p30l_dual", count: 1, weight: 3 }, // ?
            { name: "model94", count: 1, weight: 1 },
        ],
        tier_woodaxe: [{ name: "woodaxe", count: 1, weight: 1 }],
        tier_club_melee: [{ name: "machete_taiga", count: 1, weight: 1 }],
        tier_guns: [
            { name: "famas", count: 1, weight: 1 },
            { name: "hk416", count: 1, weight: 4 },
            { name: "mk12", count: 1, weight: 1 },
            // { name: "pkp", count: 1, weight: 0.01 },
            // { name: "m249", count: 1, weight: 0.006 },
            { name: "ak47", count: 1, weight: 4 },
            { name: "m1a1", count: 1, weight: 4 },
            { name: "scar", count: 1, weight: 0.1 },
            { name: "dp28", count: 1, weight: 0.1 },
            // { name: "mosin", count: 1, weight: 0.1 },
            { name: "m39", count: 1, weight: 1 },
            { name: "mp5", count: 1, weight: 6 },
            { name: "mac10", count: 1, weight: 6 },
            { name: "ump9", count: 1, weight: 3 },
            { name: "m870", count: 1, weight: 6 },
            { name: "saiga", count: 1, weight: 2 },
            { name: "mp220", count: 1, weight: 3 },
            { name: "ot38", count: 1, weight: 6 },
            { name: "colt45", count: 1, weight: 6 },
            { name: "m93r", count: 1, weight: 4 },
            { name: "glock", count: 1, weight: 6 },
            // { name: "deagle", count: 1, weight: 0.01 },
            // { name: "vector", count: 1, weight: 0.01 },
            // { name: "scorpion", count: 1, weight: 0.01 },
            { name: "m4a1", count: 1, weight: 0.1 },
            // { name: "sv98", count: 1, weight: 0.01 },
            { name: "spas12", count: 1, weight: 2 },
            // { name: "qbb97", count: 1, weight: 0.01 },
            { name: "flare_gun", count: 1, weight: 0.1 }, // !
            { name: "flare_gun_dual", count: 1, weight: 0.01 }, // !
            { name: "groza", count: 1, weight: 2 },
            // { name: "scout_elite", count: 1, weight: 0.05 },
            { name: "vss", count: 1, weight: 1 }, // !
        ],
        tier_police: [
            { name: "scar", count: 1, weight: 6 },
            { name: "helmet03", count: 1, weight: 3 },
            { name: "chest03", count: 1, weight: 3 },
            { name: "backpack03", count: 1, weight: 1 },
            { name: "bar", count: 1, weight: 1 }, // ?
            { name: "qbb97", count: 1, weight: 1 }, // ?
        ],
        tier_ring_case: [
            { name: "vector45", count: 1, weight: 6 }, // ?
            { name: "grozas", count: 1, weight: 12 }, // ?
            { name: "pkp", count: 1, weight: 1 }, // ?
            { name: "m1a1", count: 1, weight: 6 },
            { name: "m249", count: 1, weight: 1 },
            { name: "scorpion", count: 1, weight: 3 },
            { name: "bar", count: 1, weight: 1 }, // ?
            { name: "qbb97", count: 1, weight: 1 }, // ?
        ],
        tier_chest: [
            { name: "famas", count: 1, weight: 1.15 },
            { name: "hk416", count: 1, weight: 4 },
            { name: "mk12", count: 1, weight: 0.55 },
            { name: "m249", count: 1, weight: 0.07 },
            { name: "ak47", count: 1, weight: 4 },
            { name: "m1a1", count: 1, weight: 4 },
            { name: "scar", count: 1, weight: 0.27 },
            { name: "dp28", count: 1, weight: 0.55 },
            // { name: "mosin", count: 1, weight: 0.55 },
            { name: "m39", count: 1, weight: 0.55 },
            { name: "saiga", count: 1, weight: 0.26 },
            { name: "mp220", count: 1, weight: 1.5 },
            { name: "deagle", count: 1, weight: 0.15 },
            { name: "vector", count: 1, weight: 0.1 },
            { name: "scorpion", count: 1, weight: 0.1 },
            { name: "m4a1", count: 1, weight: 0.1 },
            // { name: "sv98", count: 1, weight: 0.1 },
            { name: "spas12", count: 1, weight: 1 },
            { name: "groza", count: 1, weight: 1.15 },
            { name: "helmet02", count: 1, weight: 1 },
            { name: "helmet03", count: 1, weight: 0.25 },
            { name: "chest02", count: 1, weight: 1 },
            { name: "chest03", count: 1, weight: 0.25 },
            { name: "4xscope", count: 1, weight: 0.5 },
            // { name: "8xscope", count: 1, weight: 0.25 },
        ],
        tier_conch: [
            { name: "outfitAqua", count: 1, weight: 1 },
            { name: "outfitCoral", count: 1, weight: 1 },
        ],
        tier_noir_outfit: [{ name: "outfitNoir", count: 1, weight: 1 }],
        tier_khaki_outfit: [{ name: "outfitKhaki", count: 1, weight: 1 }],
        tier_pirate_melee: [{ name: "hook", count: 1, weight: 1 }],
        tier_hatchet: [
            { name: "vector", count: 1, weight: 12 },
            { name: "model94", count: 1, weight: 4 },
            { name: "pkp", count: 1, weight: 1 },
            { name: "m249", count: 1, weight: 1 },
        ],
        tier_lmgs: [
            { name: "dp28", count: 1, weight: 2 }, // ?
            { name: "bar", count: 1, weight: 1.5 }, // ?
            { name: "qbb97", count: 1, weight: 0.5 }, // ?
            { name: "m249", count: 1, weight: 0.05 }, // ?
            { name: "pkp", count: 1, weight: 0.05 }, // ?
        ],
        tier_shotguns: [
            { name: "spas12", count: 1, weight: 2 }, // ?
            { name: "mp220", count: 1, weight: 1.5 }, // ?
            // { name: "saiga", count: 1, weight: 1 }, // ?
            { name: "m870", count: 1, weight: 1 }, // ?
            { name: "saiga", count: 1, weight: 0.15 }, // ?
            { name: "usas", count: 1, weight: 0.01 }, // ?
        ],
        tier_hatchet_melee: [
            { name: "fireaxe", count: 1, weight: 5 }, // ?
            { name: "tier_katanas", count: 1, weight: 3 }, // ?
            { name: "stonehammer", count: 1, weight: 1 }, // ?
        ],
        tier_pavilion: [
            { name: "naginata", count: 1, weight: 2 }, // ?
            { name: "pkp", count: 1, weight: 2 }, // ?
            { name: "dp28", count: 1, weight: 1 }, // ?
            { name: "bar", count: 1, weight: 1 }, // ?
            { name: "colt45", count: 1, weight: 1 }, // ?
        ],
        tier_forest_helmet: [{ name: "helmet03_forest", count: 1, weight: 1 }],
        tier_outfits: [
            { name: "outfitCobaltShell", count: 1, weight: 0.2 }, // ?
            { name: "outfitKeyLime", count: 1, weight: 0.15 }, // ?
            { name: "outfitWoodland", count: 1, weight: 0.1 }, // ?
            { name: "outfitCamo", count: 1, weight: 0.1 }, // ?
            { name: "outfitGhillie", count: 1, weight: 0.01 }, // ?
        ],
        tier_egg_outfits: [
            { name: "outfitBarrel", count: 1, weight: 1 },
            { name: "outfitWoodBarrel", count: 1, weight: 1 },
            { name: "outfitStone", count: 1, weight: 1 },
            { name: "outfitSpringTree", count: 1, weight: 1 },
            { name: "outfitBush", count: 1, weight: 1 },
            { name: "outfitCrate", count: 1, weight: 1 },
            { name: "outfitTable", count: 1, weight: 1 },
            { name: "outfitSoviet", count: 1, weight: 1 },
            { name: "outfitOven", count: 1, weight: 1 },
            { name: "outfitRefrigerator", count: 1, weight: 1 },
            { name: "outfitVending", count: 1, weight: 1 },
            { name: "outfitToilet", count: 1, weight: 1 },
            { name: "outfitBushRiver", count: 1, weight: 1 },
            { name: "outfitCrab", count: 1, weight: 1 },
        ],
        tier_islander_outfit: [{ name: "outfitIslander", count: 1, weight: 1 }],
        tier_imperial_outfit: [{ name: "outfitImperial", count: 1, weight: 1 }],
        tier_pineapple_outfit: [{ name: "outfitPineapple", count: 1, weight: 1 }],
        tier_tarkhany_outfit: [{ name: "outfitTarkhany", count: 1, weight: 1 }],
        tier_spetsnaz_outfit: [{ name: "outfitSpetsnaz", count: 1, weight: 1 }],
        tier_lumber_outfit: [{ name: "outfitLumber", count: 1, weight: 1 }],
        tier_verde_outfit: [{ name: "outfitVerde", count: 1, weight: 1 }],
        //
        // Cobalt class pods
        //
        tier_guns_common_scout: [
            { name: "glock_dual", count: 1, weight: 1 },
            { name: "ot38_dual", count: 1, weight: 1 },
        ],
        tier_guns_common_sniper: [
            { name: "blr", count: 1, weight: 1 },
            // { name: "mosin", count: 1, weight: 0.1 },
        ],
        tier_guns_common_healer: [
            { name: "mk12", count: 1, weight: 1 },
            { name: "m39", count: 1, weight: 1 },
        ],
        tier_guns_common_demo: [
            { name: "m870", count: 1, weight: 1 },
            { name: "spas12", count: 1, weight: 0.5 },
        ],
        tier_guns_common_assault: [
            { name: "hk416", count: 1, weight: 1 },
            { name: "ak47", count: 1, weight: 1 },
            { name: "m1a1", count: 1, weight: 1 },
            { name: "groza", count: 1, weight: 1 },
            { name: "famas", count: 1, weight: 1 },
        ],
        tier_guns_common_tank: [
            { name: "dp28", count: 1, weight: 1 },
            { name: "qbb97", count: 1, weight: 0.1 },
        ],
        tier_guns_rare_scout: [
            { name: "ots38_dual", count: 1, weight: 1 },
            { name: "p30l_dual", count: 1, weight: 1 },
            { name: "deagle_dual", count: 1, weight: 1 },
        ],
        tier_guns_rare_sniper: [
            // { name: "mosin", count: 1, weight: 1 },
            // { name: "sv98", count: 1, weight: 0.1 },
            // { name: "awc", count: 1, weight: 0.05 },
        ],
        tier_guns_rare_demo: [
            { name: "mp220", count: 1, weight: 1 },
            { name: "saiga", count: 1, weight: 0.5 },
            { name: "usas", count: 1, weight: 0.1 },
        ],
        tier_guns_rare_healer: [
            { name: "svd", count: 1, weight: 1 },
            { name: "l86", count: 1, weight: 1 },
            { name: "garand", count: 1, weight: 0.5 },
        ],
        tier_guns_rare_assault: [
            { name: "scar", count: 1, weight: 1 },
            { name: "vector45", count: 1, weight: 1 },
            { name: "grozas", count: 1, weight: 1 },
            { name: "m4a1", count: 1, weight: 1 },
            { name: "an94", count: 1, weight: 0.5 },
        ],
        tier_guns_rare_tank: [
            { name: "qbb97", count: 1, weight: 1 },
            { name: "pkp", count: 1, weight: 0.1 },
            { name: "m249", count: 1, weight: 0.05 },
        ],
        tier_class_crate_mythic: [
            { name: "scavenger_adv", count: 1, weight: 1 },
            { name: "explosive", count: 1, weight: 1 },
            { name: "splinter", count: 1, weight: 1 },
        ],
        tier_scavenger_adv: [
            { name: "colt45", count: 1, weight: 1 },
            { name: "ots38_dual", count: 1, weight: 1 },
            { name: "p30l_dual", count: 1, weight: 1 },
            { name: "saiga", count: 1, weight: 1 },
            { name: "deagle_dual", count: 1, weight: 1 },
            { name: "vector", count: 1, weight: 1 },
            { name: "scorpion", count: 1, weight: 1 },
            { name: "m4a1", count: 1, weight: 1 },
            { name: "garand", count: 1, weight: 1 },
            { name: "vector45", count: 1, weight: 1 },
            { name: "grozas", count: 1, weight: 1 },
            { name: "flare_gun", count: 1, weight: 1 },
            // { name: "awc", count: 1, weight: 1 },
            { name: "scarssr", count: 1, weight: 1 },
            { name: "pkp", count: 1, weight: 1 },
            { name: "m249", count: 1, weight: 1 },
            { name: "sv98", count: 1, weight: 1 },
            { name: "pan", count: 1, weight: 1 },
            // { name: "8xscope", count: 1, weight: 1 },
            // { name: "15xscope", count: 1, weight: 1 },
            { name: "mirv", count: 4, weight: 1 },
            { name: "outfitGhillie", count: 1, weight: 1 },
            { name: "painkiller", count: 2, weight: 1 },
            { name: "healthkit", count: 1, weight: 1 },
            { name: "helmet03", count: 1, weight: 1 },
            { name: "chest03", count: 1, weight: 1 },
            { name: "backpack03", count: 1, weight: 1 },
        ],
        tier_airdrop_uncommon: [
            { name: "mosin", count: 1, weight: 3 },
            { name: "scout_elite", count: 1, weight: 3 },
            { name: "blr", count: 1, weight: 2 },
            { name: "scar", count: 1, weight: 1 },
            { name: "saiga", count: 1, weight: 1 },
            { name: "vector", count: 1, weight: 1 },
            { name: "vector45", count: 1, weight: 1 },
            // { name: "sv98", count: 1, weight: 0.5 },
            { name: "qbb97", count: 1, weight: 2 },
            { name: "flare_gun", count: 1, weight: 1 },
           ],
        tier_airdrop_rare: [
            { name: "sv98", count: 1, weight: 4 },
            { name: "mosin", count: 1, weight: 6 },
            { name: "scout_elite", count: 1, weight: 6 },
            { name: "blr", count: 1, weight: 1 },
            { name: "model94", count: 1, weight: 1 },
            { name: "pkp", count: 1, weight: 3 },
            { name: "m249", count: 1, weight: 3 },
            { name: "m4a1", count: 1, weight: 1 },
            { name: "scorpion", count: 1, weight: 1 },
            // { name: "awc", count: 1, weight: 3 },
          ],
        tier_airdrop_mythic: [
            { name: "scarssr", count: 1, weight: 1 }, // ?
            { name: "usas", count: 1, weight: 1 }, // ?
            { name: "p30l_dual", count: 1, weight: 1 }, // ?
            // { name: "awc", count: 1, weight: 0.1 }, // ?
            { name: "pkp", count: 1, weight: 1 }, // ?
            { name: "m249", count: 1, weight: 1 }, // ?
        ],
        tier_airdrop_ammo: [
            { name: "9mm", count: 60, weight: 3 },
            { name: "762mm", count: 60, weight: 3 },
            { name: "556mm", count: 60, weight: 3 },
            { name: "45acp", count: 60, weight: 3 },
            { name: "12gauge", count: 10, weight: 3 },
        ],
        tier_airdrop_outfits: [
            { name: "", count: 1, weight: 20 },
            { name: "outfitMeteor", count: 1, weight: 5 }, // !
            { name: "outfitHeaven", count: 1, weight: 1 }, // !
            { name: "outfitGhillie", count: 1, weight: 0.5 },
        ],
        tier_airdrop_throwables: [
            { name: "frag", count: 2, weight: 3 },
            { name: "mirv", count: 2, weight: 1 },
        ],
        tier_airdrop_melee: [
            { name: "", count: 1, weight: 12 },
            { name: "pan", count: 1, weight: 1 },
        ],
        tier_airdrop_armor: [
            { name: "helmet03", count: 1, weight: 3 },
            { name: "chest03", count: 1, weight: 3 },
            { name: "backpack03", count: 1, weight: 1 },
        ],
        tier_airdrop_scopes: [
            { name: "", count: 1, weight: 1 }, // ?
            { name: "4xscope", count: 1, weight: 12 }, // ?
            // { name: "8xscope", count: 1, weight: 1 }, // ?
            // { name: "15xscope", count: 1, weight: 0.02 }, // ?
        ],
        tier_katanas: [
            { name: "katana", count: 1, weight: 1 }, // ?
            { name: "katana_rusted", count: 1, weight: 3 }, // ?
            { name: "katana_orchid", count: 1, weight: 6 }, // ?
        ],
        tier_stonehammer: [{ name: "stonehammer", count: 1, weight: 1 }],
        tier_saloon: [
            { name: "vector45", count: 1, weight: 1 },
            { name: "mkg45", count: 1, weight: 1 },
        ],
        tier_cattle_crate: [
            { name: "m1a1", count: 1, weight: 1 },
            // { name: "model94", count: 1, weight: 1 },
            { name: "colt45", count: 1, weight: 1 },
            { name: "outfitVerde", count: 1, weight: 0.1 },
            { name: "outfitDesertCamo", count: 1, weight: 0.1 },
        ],
        // seems to be unused? so adding this to suppress the warning
        tier_pumpkin_candy: [{ name: "", weight: 1, count: 1 }],
        tier_pumpkin_perks: [{ name: "halloween_mystery", count: 1, weight: 1 }],
        tier_xp_uncommon: [
            { name: "xp_book_tallow", count: 1, weight: 1 },
            { name: "xp_book_greene", count: 1, weight: 1 },
            { name: "xp_book_parma", count: 1, weight: 1 },
            { name: "xp_book_nevelskoy", count: 1, weight: 1 },
            { name: "xp_book_rinzo", count: 1, weight: 1 },
            { name: "xp_book_kuga", count: 1, weight: 1 },
        ],
        tier_xp_rare: [
            { name: "xp_glasses", count: 1, weight: 0.1 },
            { name: "xp_compass", count: 1, weight: 0.1 },
            { name: "xp_stump", count: 1, weight: 0.1 },
            { name: "xp_bone", count: 1, weight: 0.1 },
        ],
        tier_xp_mythic: [{ name: "xp_donut", count: 1, weight: 0.01 }],
        // xp and halloween perks guessed with no base on real data!
        tier_fruit_xp: [
            { name: "", count: 1, weight: 40 },
            /* commented until we have a pass so the xp artifacts do something
            { name: "tier_xp_uncommon", count: 1, weight: 1 },
            { name: "tier_xp_rare", count: 1, weight: 0.1 },
            { name: "tier_xp_mythic", count: 1, weight: 0.001 },
            */
        ],
        tier_airdrop_xp: [
            { name: "", count: 1, weight: 15 },
            /*
            { name: "tier_xp_uncommon", count: 1, weight: 1 },
            { name: "tier_xp_rare", count: 1, weight: 0.1 },
            { name: "tier_xp_mythic", count: 1, weight: 0.001 },
            */
        ],
        tier_halloween_mystery_perks: [
            { name: "trick_nothing", count: 1, weight: 1 },
            { name: "trick_size", count: 1, weight: 1 },
            { name: "trick_m9", count: 1, weight: 1 },
            { name: "trick_chatty", count: 1, weight: 1 },
            { name: "trick_drain", count: 1, weight: 1 },

            { name: "treat_9mm", count: 1, weight: 1 },
            { name: "treat_12g", count: 1, weight: 1 },
            { name: "treat_556", count: 1, weight: 1 },
            { name: "treat_762", count: 1, weight: 1 },
            { name: "treat_super", count: 1, weight: 0.1 },
        ],
        tier_faction_outfits: [
            { name: "outfitVerde", count: 1, weight: 1 },
            { name: "outfitWoodland", count: 1, weight: 1 },
            { name: "outfitKeyLime", count: 1, weight: 1 },
            { name: "outfitCamo", count: 1, weight: 1 },
        ],
        tier_airdrop_faction_outfits: [{ name: "outfitGhillie", count: 1, weight: 1 }],
        tier_airdrop_faction_melee: [{ name: "pan", count: 1, weight: 1 }],
        tier_perks: [
            { name: "firepower", count: 1, weight: 1 },
            { name: "windwalk", count: 1, weight: 1 },
            { name: "endless_ammo", count: 1, weight: 1 },
            { name: "steelskin", count: 1, weight: 1 },
            { name: "splinter", count: 1, weight: 1 },
            { name: "small_arms", count: 1, weight: 1 },
            { name: "takedown", count: 1, weight: 1 },
            { name: "field_medic", count: 1, weight: 1 },
            { name: "tree_climbing", count: 1, weight: 1 },
            { name: "scavenger", count: 1, weight: 1 },
            { name: "chambered", count: 1, weight: 1 },
            { name: "martyrdom", count: 1, weight: 1 },
            { name: "self_revive", count: 1, weight: 1 },
            { name: "bonus_9mm", count: 1, weight: 1 },
        ],
        tier_potato_perks: [
            { name: "", count: 1, weight: 25 },
            { name: "tier_perks", count: 1, weight: 1 },
        ],
        tier_mosin: [
            { name: "", count: 1, weight: 0.9 },
            { name: "mosin", count: 1, weight: 0.1 }
        ],
        tier_blr: [
            { name: "", count: 1, weight: 0.9 },
            { name: "blr", count: 1, weight: 0.1 }
        ],
        tier_model: [
            { name: "", count: 1, weight: 0.95 },
            { name: "model94", count: 1, weight: 0.05 }
        ],
        tier_scout_with_structure_skins: [
            { name: "", count: 1, weight: 0.8 },
            { name: "scout_elite", count: 1, weight: 0.1 },
            { name: "blr", count: 1, weight: 0.1 }
        ]   
    },
    mapGen: {
        map: {
            baseWidth: 512,
            baseHeight: 512,
            scale: { small: 1.1875, large: 1.28125 },
            extension: 112,
            shoreInset: 48,
            grassInset: 18,
            rivers: {
                lakes: [],
                weights: [
                    { weight: 0.1, widths: [4] },
                    { weight: 0.15, widths: [8] },
                    { weight: 0.25, widths: [8, 4] },
                    { weight: 0.21, widths: [16] },
                    { weight: 0.09, widths: [16, 8] },
                    { weight: 0.2, widths: [16, 8, 4] },
                    {
                        weight: 1e-4,
                        widths: [16, 16, 8, 6, 4],
                    },
                ],
                smoothness: 0.45,
                spawnCabins: true,
                masks: [],
            },
        },
        places: [
            {
                name: "The Killpit",
                pos: v2.create(0.53, 0.64),
            },
            {
                name: "Sweatbath",
                pos: v2.create(0.84, 0.18),
            },
            {
                name: "Tarkhany",
                pos: v2.create(0.15, 0.11),
            },
            {
                name: "Ytyk-Kyuyol",
                pos: v2.create(0.25, 0.42),
            },
            {
                name: "Todesfelde",
                pos: v2.create(0.81, 0.85),
            },
            {
                name: "Pineapple",
                pos: v2.create(0.21, 0.79),
            },
            {
                name: "Fowl Forest",
                pos: v2.create(0.73, 0.47),
            },
            {
                name: "Ranchito Pollo",
                pos: v2.create(0.53, 0.25),
            },
        ],
        bridgeTypes: {
            medium: "bridge_md_structure_01",
            large: "bridge_lg_structure_01",
            xlarge: "",
        },
        customSpawnRules: {
            locationSpawns: [
                {
                    type: "club_complex_01",
                    pos: v2.create(0.5, 0.5),
                    rad: 150,
                    retryOnFailure: true,
                },
            ],
            placeSpawns: ["warehouse_01", "house_red_01", "house_red_02", "barn_01"],
        },
        densitySpawns: [
            {
                stone_01: 360,
                barrel_01: 72,
                silo_01: 8,
                crate_01: 72,
                crate_02: 6,
                crate_03: 12,
                bush_01: 72,
                cache_06: 12,
                tree_01: 360,
                hedgehog_01: 24,
                container_01: 6,
                container_02: 6,
                container_03: 6,
                container_04: 6,
                shack_01: 6,
                outhouse_01: 6,
                loot_tier_1: 24,
                loot_tier_beach: 6,
            },
        ],
        fixedSpawns: [
            {
                // small is spawn count for solos and duos, large is spawn count for squads
                warehouse_01: 2,
                house_red_01: { small: 4, large: 4 },
                house_red_02: { small: 4, large: 4 },
                barn_01: { small: 4, large: 4 },
                barn_02: 2,
                hut_01: 4,
                hut_02: 2, // spas hut
                hut_03: 2, // scout hut
                shack_03a: 2,
                shack_03b: { small: 4, large: 4 },
                greenhouse_01: 1,
                cache_01: 1,
                // cache_02: 1, // mosin tree
                cache_07: 1,
                bunker_structure_01: 1,
                bunker_structure_02: 1,
                bunker_structure_03: 1,
                bunker_structure_04: 1,
                bunker_structure_05: 1,
                mansion_structure_01: 1,
                police_01: 1,
                bank_01: 1,
                warehouse_complex_01: 1,
                chest_01: 1,
                chest_03: 1,
                mil_crate_02: 1,
                tree_02: 3,
                teahouse_complex_01su: {
                    small: 4,
                    large: 4,
                },
                stone_04: 1,
                club_complex_01: 1,
            },
        ],
        spawnReplacements: [{}],
        importantSpawns: ["club_complex_01"],
    },
    /* STRIP_FROM_PROD_CLIENT:END */
};

type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

export type PartialMapDef = DeepPartial<MapDef>;
