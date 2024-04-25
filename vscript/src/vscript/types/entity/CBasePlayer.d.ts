declare abstract class CBasePlayer extends CBaseEntity {
	GetHMDAvatar(): CPropHMDAvatar | null;
	GetVRHand(nHandID: number): CPropVRHand | null;
	GetUserID(): number;
	IsVRControllerButtonPressed(nButton: UInt64): boolean;

	// CSteamTours_Player

	/**
	 * Sets whether the content browser is allowed to be brought up by the player.
	 */
	SetContentBrowserAllowed(bAllowed: boolean): void;
}
