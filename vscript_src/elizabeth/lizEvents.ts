
export enum LizEvent {
	PlayerReady = "player_ready",
	ObjectCaught = "object_caught",
	GunPointed = "gun_pointed",
}

/**
 * Fired when a player is ready to interact with liz
 */
export interface PlayerReadyEvent {
	userID: number;
	player: CBasePlayer;
}

/**
 * Fired when a tagged object is caught by the player
 */
export interface ObjectCaughtEvent {
	entID: number;
	userID: number;
	player: CBasePlayer;
}

/**
 * Fired when a gun is pointed at liz
 */
export interface GunPointedEvent {
	userID: number;
}

export abstract class LizEventManager {
	public static on(e: LizEvent, callback: any, scope: any): number {
		return ListenToGameEvent("liz_" + (e as string), callback, scope);
	}

	public static emit(e: LizEvent, data: any) {
		FireGameEvent("liz_" + (e as string), data);
	}
}
