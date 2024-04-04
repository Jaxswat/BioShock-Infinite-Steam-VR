import {LizEvent, LizEventManager} from "../elizabeth/lizEvents";

export const __BundleAsGameScript = null;

let pickedUp = false;
export function OnPickedUp(handle: EHandle, hand: CPropVRHand): void {
	if (pickedUp) {
		return;
	}
	pickedUp = true;

	const entID = thisEntity.Attribute_GetIntValue("liz_ent_id", -1);
	LizEventManager.emit(LizEvent.ObjectCaught, { entID, userID: hand.GetPlayer().GetUserID() });
}
