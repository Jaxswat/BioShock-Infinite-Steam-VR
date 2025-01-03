import Elizabeth from "../Elizabeth";
import { LizGunPointEvent, LizObjectCaughtEvent, LizPlayerReadyEvent } from "../../../events/BioshockEvents";
import LizEventHandler from "../lizEvents";

export enum LizStateName {
	Idle = 'idle',
	Throwing = 'throwing',
	Following = 'following',
	Choreo = 'choreo',
}

/**
 * Encapsulates behaviors for a state in the state machine.
 */
export abstract class LizState implements LizEventHandler {
	private stateName: string;
	protected liz: Elizabeth;

	protected constructor(stateName: string, liz: Elizabeth) {
		this.stateName = stateName;
		this.liz = liz;
	}

	public getStateName(): string {
		return this.stateName;
	}

	/**
	 * Called when the state is entered.
	 */
	public enter(): void {

	}

	/**
	 * Called when the state is exited.
	 */
	public exit(): void {

	}

	/**
	 * Called every tick while the state is active.
	 */
	public update(delta: number): void {

	}

	/**
	 * Returns true if the state is completed.
	 * Finite states should return true when they are done.
	 */
	public isCompleted(): boolean {
		return false;
	}

	/**
	 * Returns true if liz can pick up the object in this state.
	 */
	public canPickUpObject(): boolean {
		return false;
	}

	public onPlayerReady(event: LizPlayerReadyEvent): void {
	}

	public onObjectCaught(event: LizObjectCaughtEvent): void {
	}

	public onGunPoint(event: LizGunPointEvent): void {
	}
}
