import Pistol from "../entities/weapons/Pistol";

export const __BundleAsGameScript = null;

const pistol = new Pistol(thisEntity);

export function Precache(context: any) {
    pistol.precache(context);
}

export function Activate() {
    pistol.activate();
}

export function SetEquipped(
    this: CBaseEntity,
    pHand: CPropVRHand,
    nHandID: number,
    pHandAttachment: CBaseEntity,
    pPlayer: CBasePlayer
): boolean {
    return pistol.equip(pHand, nHandID, pHandAttachment, pPlayer);
}

export function SetUnequipped(): boolean {
    return pistol.drop();
}

export function OnHandleInput(input: CHandInputData): CHandInputData {
    return pistol.handleInput(input);
}
