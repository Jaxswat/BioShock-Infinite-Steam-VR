import VTunnelGadget from "../entities/weapons/VTunnelGadget";

export const __BundleAsGameScript = null;

const vtgadget = new VTunnelGadget(thisEntity);

export function Precache(context: any) {
    vtgadget.precache(context);
}

export function Activate() {
    vtgadget.activate();
}

export function SetEquipped(
    this: CBaseEntity,
    pHand: CPropVRHand,
    nHandID: number,
    pHandAttachment: CBaseEntity,
    pPlayer: CBasePlayer
): boolean {
    return vtgadget.equip(pHand, nHandID, pHandAttachment, pPlayer);
}

export function SetUnequipped(): boolean {
    return vtgadget.drop();
}

export function OnHandleInput(input: CHandInputData): CHandInputData {
    return vtgadget.handleInput(input);
}
