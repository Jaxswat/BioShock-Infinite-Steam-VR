declare abstract class CBasePlayer extends CBaseEntity {
	GetHMDAvatar(): CPropHMDAvatar | null;
	GetVRHand(): CPropVRHand | null;
	GetUserID(): number;
	IsVRControllerButtonPressed(nButton: UInt64): boolean;
}
