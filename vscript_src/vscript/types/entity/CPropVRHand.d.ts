
declare abstract class CPropVRHand extends CBaseEntity {
    FireHapticPulse(strength: number): void;
    FireHapticPulsePrecise(nPulseDurationMicroseconds: number): void;
    GetHandID(): number;
    GetVelocity(): Vector;
    GetPlayer(): CBasePlayer;
    GetHandAttachment(): CBaseEntity;
}