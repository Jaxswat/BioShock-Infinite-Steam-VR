export const __BundleAsGameScript = null;

export function OnTakeDamage(damageInfo: any): void {
    const player: CBasePlayer | null = (damageInfo.attacker as CBasePlayer) || null;
    if (!player) {
        return;
    }

    const gameID = thisEntity.Attribute_GetIntValue("fair_game_id", -1);
    const entID = thisEntity.Attribute_GetIntValue("fair_game_ent_id", -1);
    const playerID = player.GetUserID();
    FireGameEvent("fair_game_target_destroyed", { gameID, entID, playerID });
}
