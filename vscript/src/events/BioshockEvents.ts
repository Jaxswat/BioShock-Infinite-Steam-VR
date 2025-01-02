export enum BioshockEvent {
	// Don't use anything under ~10 due to re-used difficulty_changed game event

	FairGameStart = 50,
	FairGameTargetDestroyed = 51,

	LizPlayerReady = 168,
	LizObjectCaught = 169,
	LizGunPoint = 170,
};

export interface BioshockBaseEvent {
	userID: number;
	player?: CBasePlayer | null; // The event manager will try to populate this
};

export interface FairGameStartEvent extends BioshockBaseEvent {
	gameID: number;
};
export interface FairGameTargetDestroyedEvent extends BioshockBaseEvent {
	gameID: number;
	entID: number;
};

export interface LizPlayerReadyEvent extends BioshockBaseEvent {};
export interface LizObjectCaughtEvent extends BioshockBaseEvent {
	entID: number;
};
export interface LizGunPointEvent extends BioshockBaseEvent {};
