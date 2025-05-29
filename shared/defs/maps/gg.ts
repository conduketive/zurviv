import { util } from "../../utils/util";
import type { MapDef } from "../mapDefs";
import { Main } from "./baseDefs";

const mapDef = {
    mapId: 1221,
    desc: {
        name: "GG",
        icon: "img/gg_logo.png",
        buttonCss: "btn-mode-gg"
    },
    gameConfig: {
            planes: {
                crates: [
                    { name: "airdrop_crate_01", weight: 2 },
                    { name: "airdrop_crate_02", weight: 1 },
                ],
            },
        },
    lootTable: {
        // tier_world: [
        //     { name: "tier_guns", count: 1, weight: 0.29 }, // todo get more data on this from original
        //     { name: "tier_ammo", count: 1, weight: 0.04 }, // ?
        //     { name: "tier_scopes", count: 1, weight: 0.15 }, // ?
        //     { name: "tier_armor", count: 1, weight: 0.15 }, // ?
        //     { name: "tier_medical", count: 1, weight: 0.2 }, // ?
        //     { name: "tier_throwables", count: 1, weight: 0.05 }, // ?
        //     { name: "tier_packs", count: 1, weight: 0.09 }, // ?
        // ],
        // tier_surviv: [
        //     { name: "tier_scopes", count: 1, weight: 0.15 }, // todo get more data on this from original
        //     { name: "tier_armor", count: 1, weight: 0.15 }, // ?
        //     { name: "tier_medical", count: 1, weight: 0.2 }, // ?
        //     { name: "tier_throwables", count: 1, weight: 0.05 }, // ?
        //     { name: "tier_packs", count: 1, weight: 0.09 }, // ?
        // ],
        // tier_container: [
        //     { name: "tier_guns", count: 1, weight: 0.29 },
        //     { name: "tier_ammo", count: 1, weight: 0.04 },
        //     { name: "tier_scopes", count: 1, weight: 0.15 },
        //     { name: "tier_armor", count: 1, weight: 0.2 },
        //     { name: "tier_medical", count: 1, weight: 0.2 },
        //     { name: "tier_throwables", count: 1, weight: 0.05 },
        //     { name: "tier_packs", count: 1, weight: 0.09 },
        //     { name: "tier_outfits", count: 1, weight: 0.035 }, // !
        // ],
        // tier_leaf_pile: [
        //     { name: "tier_ammo", count: 1, weight: 0.2 },
        //     { name: "tier_scopes", count: 1, weight: 0.2 },
        //     { name: "tier_armor", count: 1, weight: 0.2 },
        //     { name: "tier_medical", count: 1, weight: 0.2 },
        //     { name: "tier_throwables", count: 1, weight: 0.15 },
        //     { name: "tier_packs", count: 1, weight: 0.05 },
        // ],
        // tier_soviet: [
        //     { name: "tier_guns", count: 1, weight: 3 }, // ?
        //     { name: "tier_armor", count: 1, weight: 2 }, // ?
        //     { name: "tier_packs", count: 1, weight: 1 }, // ?
        // ],
        // tier_toilet: [
        //     { name: "tier_guns", count: 1, weight: 0.1 },
        //     { name: "tier_scopes", count: 1, weight: 0.05 },
        //     { name: "tier_medical", count: 1, weight: 0.6 },
        //     { name: "tier_throwables", count: 1, weight: 0.05 },
        //     { name: "tier_outfits", count: 1, weight: 0.025 }, // !
        // ],
        // tier_scopes: [
        //     { name: "2xscope", count: 1, weight: 10 },
        //     { name: "4xscope", count: 1, weight: 25 },
        //     //{ name: "8xscope", count: 1, weight: 1 }, // ?
        //     //{ name: "15xscope", count: 1, weight: 0.02 }, // ?
        // ],
        tier_armor: [
            { name: "helmet01", count: 1, weight: 9 }, // !
            { name: "helmet02", count: 1, weight: 6 },
            { name: "helmet03", count: 1, weight: 0.2 },
            { name: "chest01", count: 1, weight: 15 }, // !
            { name: "chest02", count: 1, weight: 6 },
            { name: "chest03", count: 1, weight: 0.2 },
        ],
        tier_packs: [
            { name: "backpack01", count: 1, weight: 15 }, // !
            { name: "backpack02", count: 1, weight: 6 },
            { name: "backpack03", count: 1, weight: 0.2 },
        ],
        // tier_medical: [
        //     { name: "bandage", count: 5, weight: 16 },
        //     { name: "healthkit", count: 1, weight: 4 },
        //     { name: "soda", count: 1, weight: 20 },
        //     { name: "painkiller", count: 1, weight: 10 },
        // ],
        // tier_throwables: [
        //     { name: "frag", count: 2, weight: 1 }, // !
        //     { name: "smoke", count: 1, weight: 1 },
        //     { name: "mirv", count: 2, weight: 0.05 },
        // ],
        tier_ammo: [
            { name: "9mm", count: 60, weight: 3 },
            { name: "762mm", count: 60, weight: 3 },
            // { name: "556mm", count: 60, weight: 3 },
            // { name: "12gauge", count: 10, weight: 3 },
        ],
        tier_ammo_crate: [
            { name: "9mm", count: 60, weight: 3 },
            { name: "762mm", count: 60, weight: 3 },
            // { name: "556mm", count: 60, weight: 3 },
            // { name: "12gauge", count: 10, weight: 3 },
            { name: "50AE", count: 21, weight: 1 },
            // { name: "308sub", count: 5, weight: 1 },
            { name: "flare", count: 1, weight: 1 },
            { name: "45acp", count: 60, weight: 1 },
        ],
        // tier_vending_soda: [
        //     { name: "soda", count: 1, weight: 2 }, // ?
        //     { name: "tier_ammo", count: 1, weight: 1 }, // ?
        // ],
        tier_sv98: [{ name: "ots38_dual", count: 1, weight: 1 }],
        // tier_scopes_sniper: [
        //     { name: "4xscope", count: 1, weight: 5 }, // ?
        //     //{ name: "8xscope", count: 1, weight: 1 }, // ?
        //    // { name: "15xscope", count: 1, weight: 0.02 }, // ?
        // ],
        // tier_mansion_floor: [{ name: "outfitCasanova", count: 1, weight: 1 }],
        // tier_vault_floor: [{ name: "outfitJester", count: 1, weight: 1 }],
        // tier_police_floor: [{ name: "outfitPrisoner", count: 1, weight: 1 }],
        // tier_chrys_01: [{ name: "outfitImperial", count: 1, weight: 1 }],
        // tier_chrys_02: [{ name: "katana", count: 1, weight: 1 }],
        // tier_chrys_03: [
        //     { name: "2xscope", count: 1, weight: 5 }, // ?
        //     { name: "4xscope", count: 1, weight: 5 }, // ?
        //     //{ name: "8xscope", count: 1, weight: 5 }, // ?
        //     //{ name: "15xscope", count: 1, weight: 0.1 }, // ?
        // ],
        // tier_chrys_case: [
        //     { name: "", count: 1, weight: 5 }, // ?
        //     { name: "tier_katanas", count: 1, weight: 3 }, // ?
        //     { name: "naginata", count: 1, weight: 1 }, // ?
        // ],
        // tier_eye_02: [{ name: "stonehammer", count: 1, weight: 1 }],
        tier_eye_block: [
            { name: "ots38_dual", count: 1, weight: 1 },
            { name: "flare_gun_dual", count: 1, weight: 1 },
            { name: "colt45", count: 1, weight: 1 },
            { name: "painkiller", count: 4, weight: 1 },
            { name: "p30l", count: 1, weight: 1 },
        ],
        // tier_sledgehammer: [{ name: "sledgehammer", count: 1, weight: 1 }],
        // tier_chest_04: [
        //     { name: "p30l", count: 1, weight: 40 }, // ?
        //     { name: "p30l_dual", count: 1, weight: 1 }, // ?
        // ],
        // tier_woodaxe: [{ name: "woodaxe", count: 1, weight: 1 }],
        // tier_club_melee: [{ name: "machete_taiga", count: 1, weight: 1 }],
        tier_guns: [
            { name: "m9", count: 1, weight: 30 },
            { name: "glock", count: 1, weight: 24 },
            { name: "m93r", count: 1, weight: 20 },
            { name: "ot38", count: 1, weight: 20 },
            { name: "ots38", count: 1, weight: 2 },
            { name: "colt45", count: 1, weight: 1.5 },
            { name: "flare_gun", count: 1, weight: 1.5 },
            { name: "p30l", count: 1, weight: 0.5 },
            { name: "deagle", count: 1, weight: 0.5 },
        ],
        tier_police: [
            { name: "deagle", count: 1, weight: 0.5 },
            { name: "helmet03", count: 1, weight: 0.15 },
            { name: "chest03", count: 1, weight: 0.1 },
            { name: "backpack03", count: 1, weight: 0.25 },
        ],
        tier_ring_case: [
            { name: "ots38_dual", count: 1, weight: 1 },
            { name: "flare_gun_dual", count: 1, weight: 1 },
            { name: "colt45_dual", count: 1, weight: 1 },
        ],
        tier_chest: [
            { name: "m9", count: 1, weight: 10 *0.8 },
            { name: "glock", count: 1, weight: 10 *0.8 },
            { name: "m93r", count: 1, weight: 10 *0.8 },
            { name: "ot38", count: 1, weight: 10 *0.8 },
            { name: "flare_gun", count: 1, weight: 30 *0.8 },
            { name: "ots38", count: 1, weight: 10 *0.8 },
            { name: "colt45", count: 1, weight: 7.5 *0.8 },
            { name: "p30l", count: 1, weight: 7.5 *0.8 },
            { name: "deagle", count: 1, weight: 5 *0.8 },

            { name: "helmet02", count: 1, weight: 16 *0.2 },
            { name: "helmet03", count: 1, weight: 4 *0.2 },
            { name: "chest02", count: 1, weight: 64 *0.2 },
            { name: "chest03", count: 1, weight: 8 *0.2 },
            { name: "4xscope", count: 1, weight: 8 *0.2 },
            //{ name: "8xscope", count: 1, weight: 0.25 },
        ],
        // tier_conch: [
        //     { name: "outfitAqua", count: 1, weight: 1 },
        //     { name: "outfitCoral", count: 1, weight: 1 },
        // ],
        // tier_noir_outfit: [{ name: "outfitNoir", count: 1, weight: 1 }],
        // tier_khaki_outfit: [{ name: "outfitKhaki", count: 1, weight: 1 }],
        // tier_pirate_melee: [{ name: "hook", count: 1, weight: 1 }],
        tier_hatchet: [
            { name: "p30l", count: 1, weight: 3 },
            { name: "flare_gun", count: 1, weight: 1 },
        ],
        // tier_lmgs: [
        //     { name: "dp28", count: 1, weight: 2 }, // ?
        //     { name: "bar", count: 1, weight: 1.5 }, // ?
        //     { name: "qbb97", count: 1, weight: 0.5 }, // ?
        //     { name: "m249", count: 1, weight: 0.05 }, // ?
        //     { name: "pkp", count: 1, weight: 0.05 }, // ?
        // ],
        // tier_shotguns: [
        //     { name: "spas12", count: 1, weight: 2 }, // ?
        //     { name: "mp220", count: 1, weight: 1.5 }, // ?
        //     //{ name: "m1100", count: 1, weight: 1 }, // ?
        //     { name: "m870", count: 1, weight: 1 }, // ?
        //     { name: "saiga", count: 1, weight: 0.15 }, // ?
        //     { name: "usas", count: 1, weight: 0.01 }, // ?
        // ],
        // tier_hatchet_melee: [
        //     { name: "fireaxe", count: 1, weight: 5 }, // ?
        //     { name: "tier_katanas", count: 1, weight: 3 }, // ?
        //     { name: "stonehammer", count: 1, weight: 1 }, // ?
        // ],
        // tier_pavilion: [
        //     { name: "naginata", count: 1, weight: 2 }, // ?
        //     { name: "pkp", count: 1, weight: 2 }, // ?
        //     { name: "dp28", count: 1, weight: 1 }, // ?
        //     { name: "bar", count: 1, weight: 1 }, // ?
        //     //{ name: "m9", count: 1, weight: 1 }, // ?
        // ],
        // tier_forest_helmet: [{ name: "helmet03_forest", count: 1, weight: 1 }],
        // tier_outfits: [
        //     { name: "outfitCobaltShell", count: 1, weight: 0.2 }, // ?
        //     { name: "outfitKeyLime", count: 1, weight: 0.15 }, // ?
        //     { name: "outfitWoodland", count: 1, weight: 0.1 }, // ?
        //     { name: "outfitCamo", count: 1, weight: 0.1 }, // ?
        //     { name: "outfitGhillie", count: 1, weight: 0.01 }, // ?
        // ],
        // tier_islander_outfit: [{ name: "outfitIslander", count: 1, weight: 1 }],
        // tier_imperial_outfit: [{ name: "outfitImperial", count: 1, weight: 1 }],
        // tier_pineapple_outfit: [{ name: "outfitPineapple", count: 1, weight: 1 }],
        // tier_tarkhany_outfit: [{ name: "outfitTarkhany", count: 1, weight: 1 }],
        // tier_spetsnaz_outfit: [{ name: "outfitSpetsnaz", count: 1, weight: 1 }],
        // tier_lumber_outfit: [{ name: "outfitLumber", count: 1, weight: 1 }],
        // tier_verde_outfit: [{ name: "outfitVerde", count: 1, weight: 1 }],
        tier_airdrop_uncommon: [
            { name: "deagle", count: 1, weight: 1 },
            { name: "p30l", count: 1, weight: 1 },
            { name: "ots38", count: 1, weight: 1 },
            { name: "colt45", count: 1, weight: 1 },
        ],
        tier_airdrop_rare: [
            { name: "deagle_dual", count: 1, weight: 1 },
            { name: "p30l_dual", count: 1, weight: 1 },
            { name: "ots38_dual", count: 1, weight: 1 },
        ],
        // tier_airdrop_mythic: [
        //     { name: "scarssr", count: 1, weight: 1 }, // ?
        //     { name: "usas", count: 1, weight: 0.5 }, // ?
        //     { name: "p30l_dual", count: 1, weight: 1 }, // ?
        //     // { name: "awc", count: 1, weight: 0.1 }, // ?
        //     { name: "pkp", count: 1, weight: 0.3 }, // ?
        //     { name: "m249", count: 1, weight: 0.3 }, // ?
        // ],
        tier_airdrop_ammo: [
            { name: "9mm", count: 30, weight: 3 },
            { name: "762mm", count: 30, weight: 3 },
            // { name: "556mm", count: 30, weight: 3 },
            // { name: "12gauge", count: 5, weight: 3 },
        ],
        // tier_airdrop_outfits: [
        //     { name: "", count: 1, weight: 20 },
        //     { name: "outfitMeteor", count: 1, weight: 5 }, // !
        //     { name: "outfitHeaven", count: 1, weight: 1 }, // !
        //     { name: "outfitGhillie", count: 1, weight: 0.5 },
        // ],
        // tier_airdrop_throwables: [
        //     { name: "frag", count: 2, weight: 1 },
        //     { name: "mirv", count: 2, weight: 0.5 },
        // ],
        tier_airdrop_melee: [
            { name: "katana", count: 1, weight: 9 },
            { name: "katana_orchid", count: 1, weight: 1 },
        ],
        // tier_airdrop_armor: [
        //     { name: "helmet03", count: 1, weight: 1 },
        //     { name: "chest03", count: 1, weight: 1 },
        //     { name: "backpack03", count: 1, weight: 1 },
        // ],
        // tier_airdrop_scopes: [
        //     { name: "", count: 1, weight: 24 }, // ?
        //     { name: "4xscope", count: 1, weight: 5 }, // ?
        //     //{ name: "8xscope", count: 1, weight: 1 }, // ?
        //     //{ name: "15xscope", count: 1, weight: 0.02 }, // ?
        // ],
        // tier_katanas: [
        //     { name: "katana", count: 1, weight: 4 }, // ?
        //     { name: "katana_rusted", count: 1, weight: 4 }, // ?
        //     { name: "katana_orchid", count: 1, weight: 1 }, // ?
        // ],
        /*
        tier_stonehammer: [{ name: "stonehammer", count: 1, weight: 1 }],
        tier_saloon: [
            { name: "vector45", count: 1, weight: 1 },
            { name: "mkg45", count: 1, weight: 1 },
        ],
        tier_cattle_crate: [
            { name: "m1a1", count: 1, weight: 1 },
            { name: "model94", count: 1, weight: 1 },
            { name: "colt45", count: 1, weight: 1 },
            { name: "outfitVerde", count: 1, weight: 0.1 },
            { name: "outfitDesertCamo", count: 1, weight: 0.1 },
        ],
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
            // * commented until we have a pass so the xp artifacts do something
            // { name: "tier_xp_uncommon", count: 1, weight: 1 },
            // { name: "tier_xp_rare", count: 1, weight: 0.1 },
            // { name: "tier_xp_mythic", count: 1, weight: 0.001 },
            // *
        ],
        tier_airdrop_xp: [
            { name: "", count: 1, weight: 15 },
            // { name: "tier_xp_uncommon", count: 1, weight: 1 },
            // { name: "tier_xp_rare", count: 1, weight: 0.1 },
            // { name: "tier_xp_mythic", count: 1, weight: 0.001 },
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
        */
    },
    mapGen: {
        spawnReplacements: [
            {
                mil_crate_02: "mil_crate_03",
                pot_05: "gg_p30l_pot",
                pot_02: "gg_peacemaker_pot",
                crate_07: "gg_m93r_crate",
                tree_03: "gg_ots_tree",
                stone_02: "gg_m93r_rock",
                gun_mount_01: "gg_peacemaker_rack",
                gun_mount_02: "gg_peacemaker_rack",
                gun_mount_05: "gg_peacemaker_rack",
                gun_mount_03: "gg_flare_gun_rack",
                locker_03: "gg_m93r_locker",
            },
        ],
        fixedSpawns: [
            {
                // small is spawn count for solos and duos, large is spawn count for squads
                warehouse_01: 2,
                house_red_01: { small: 3, large: 4 },
                house_red_02: { small: 3, large: 4 },
                barn_01: { small: 1, large: 3 },
                barn_02: 1,
                hut_01: 3,
                hut_02: 1, // spas hut
                hut_03: 1, // scout hut
                shack_03a: 2,
                shack_03b: { small: 2, large: 3 },
                greenhouse_01: 1,
                cache_01: 1,
                cache_02: 1, // mosin tree
                cache_07: 1,
                bunker_structure_01: 1,
                bunker_structure_02: 1,
                bunker_structure_03: 1,
                bunker_structure_04: 1,
                bunker_structure_05: 1,
                warehouse_complex_01: 1,
                chest_01: 1,
                chest_03: 1,
                mil_crate_02: 1,
                tree_02: 3,
                teahouse_complex_01su: 3,
                stone_04: 1,
                club_complex_01: 1,
            },
        ],
    },
    
    /* STRIP_FROM_PROD_CLIENT:END */
};

export const GG = util.mergeDeep({}, Main, mapDef) as MapDef;
