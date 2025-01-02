import BioshockEventManager from "../events/BioshockEventManager";
import { BioshockEvent, FairGameTargetDestroyedEvent } from "../events/BioshockEvents";

export const __BundleAsGameScript = null;

export function OnTakeDamage(damageInfo: any): void {
    const player: CBasePlayer | null = (damageInfo.attacker as CBasePlayer) || null;
    if (!player) {
        return;
    }

    const gameID = thisEntity.Attribute_GetIntValue("fair_game_id", -1);
    const entID = thisEntity.Attribute_GetIntValue("fair_game_ent_id", -1);
    const userID = player.GetUserID();
    BioshockEventManager.emit<FairGameTargetDestroyedEvent>(BioshockEvent.FairGameTargetDestroyed, { gameID, entID, userID });
}
