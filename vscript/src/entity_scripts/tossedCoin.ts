import { BioshockEvent, LizObjectCaughtEvent } from "../events/BioshockEvents";
import BioshockEventManager from "../events/BioshockEventManager";

export const __BundleAsGameScript = null;

let pickedUp = false;
export function OnPickedUp(handle: EHandle, hand: CPropVRHand): void {
	if (pickedUp) {
		return;
	}
	pickedUp = true;

	const entID = thisEntity.Attribute_GetIntValue("liz_ent_id", -1);
	BioshockEventManager.emit<LizObjectCaughtEvent>(BioshockEvent.LizObjectCaught, { entID, userID: hand.GetPlayer().GetUserID() });				
}
