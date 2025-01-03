import { LizGunPointEvent, LizObjectCaughtEvent, LizPlayerReadyEvent } from "../../events/BioshockEvents";

export default interface LizEventHandler {
	onPlayerReady(event: LizPlayerReadyEvent): void 
	onObjectCaught(event: LizObjectCaughtEvent): void 
	onGunPoint(event: LizGunPointEvent): void;
};
