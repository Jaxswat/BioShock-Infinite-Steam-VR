import Skyhook from "../weapons/Skyhook";

export const __BundleAsGameScript = null;

const skyhook = new Skyhook(thisEntity);

export function Precache(context: any) {
	skyhook.precache(context);
}

export function Activate() {
	skyhook.activate();
}

export function SetEquipped(
	this: CBaseEntity,
	pHand: CPropVRHand,
	nHandID: number,
	pHandAttachment: CBaseEntity,
	pPlayer: CBasePlayer
): boolean {
	return skyhook.equip(pHand, nHandID, pHandAttachment, pPlayer);
}

export function SetUnequipped(): boolean {
	return skyhook.drop();
}

export function OnHandleInput(input: CHandInputData): CHandInputData {
	return skyhook.handleInput(input);
}
