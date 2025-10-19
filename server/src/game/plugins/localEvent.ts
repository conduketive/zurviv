import { GameObjectDefs } from "../../../../shared/defs/gameObjectDefs";
import type { GunDef } from "../../../../shared/defs/gameObjects/gunDefs";
import { UnlockDefs } from "../../../../shared/defs/gameObjects/unlockDefs";
import { GameConfig, InventoryItem, WeaponSlot } from "../../../../shared/gameConfig";
import { ObjectType } from "../../../../shared/net/objectSerializeFns";
import type { Player } from "../../game/objects/player";
import { GamePlugin, type PlayerDamageEvent } from "../../game/pluginManager";

/**
 * Checks if an item is present in the player's loadout
 */
export const isItemInLoadout = (
    item: string,
    category: string,
    ownedItems?: Set<string>,
) => {
    if (ownedItems && !ownedItems.has(item)) return false;
    if (!UnlockDefs.unlock_default.unlocks.includes(item)) return false;

    const def = GameObjectDefs[item];
    if (!def || def.type !== category) return false;

    return true;
};

const BACKPACK_LEVEL = 3;
export function onPlayerJoin(data: Player) {
    if (data.game.mapName !== "local_main") return;
    const inventory: Partial<Record<InventoryItem, number>> = {
        frag: 3,
        smoke: 1,
        strobe: 1,
        mirv: 1,
        bandage: GameConfig.bagSizes["bandage"][BACKPACK_LEVEL],
        healthkit: GameConfig.bagSizes["healthkit"][BACKPACK_LEVEL],
        soda: GameConfig.bagSizes["soda"][BACKPACK_LEVEL],
        painkiller: GameConfig.bagSizes["painkiller"][BACKPACK_LEVEL],
        "1xscope": 1,
        "2xscope": 1,
        "4xscope": 1,
    };
    data.weaponManager.setWeapon(WeaponSlot.Primary, "mosin", 5);
    data.weaponManager.setWeapon(WeaponSlot.Secondary, "spas12", 9);
    for (const [item, amount] of Object.entries(inventory)) {
        data.invManager.set(item as unknown as InventoryItem, amount);
    }
    data.backpack = "backpack03";
    data.helmet = "helmet03";
    data.chest = "chest03";
    data.scope = "4xscope";
    data.boost = 100;
    data.weaponManager.setCurWeapIndex(WeaponSlot.Primary);
    data.addPerk("endless_ammo", false);
    if (!data.game.map.perkMode) data.addPerk("takedown", false);
}
export default class DeathMatchPlugin extends GamePlugin {
    protected override initListeners(): void {
        this.on("playerJoin", onPlayerJoin);
    }
}

const customReloadPercentage: Record<string, number> = {
    sv98: 10,
    awm: 0,
    pkp: 30,
    lasr_gun: 7,
    lasr_gun_dual: 14,
};
function calculateAmmoToGive(type: string, currAmmo: number, maxClip: number): number {
    const amount = customReloadPercentage[type] ?? 50;
    if (amount === 0) return currAmmo;
    return Math.floor(Math.min(currAmmo + (maxClip * amount) / 100, maxClip));
}