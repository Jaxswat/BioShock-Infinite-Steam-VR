export enum LizAnimationState {
	IDLE = "standing_idle",
	START_WALKING = "start_walking",
	FULL_RUNNING = "trotting_running",
	STOP_WALKING = "stop_walking",
	DANCING = "dancing",
}

export class LizAnimationController {
	private entity: CBaseAnimating;
	private ticks: number = 0;

	constructor(entity: CBaseAnimating) {
		this.entity = entity;
	}

	private state: LizAnimationState = LizAnimationState.IDLE;

	public updateAnimation(isMoving: boolean, isRunning: boolean, hasStartedWalking: boolean): void {
		if (isRunning) {
			if (isMoving && hasStartedWalking) {
			  this.setState(LizAnimationState.START_WALKING);
			} else {
			  this.setState(LizAnimationState.FULL_RUNNING);
			}
		  } else {
			if (isMoving && hasStartedWalking) {
			  this.setState(LizAnimationState.STOP_WALKING);
			} else if (this.state !== LizAnimationState.DANCING) {
			  this.setState(LizAnimationState.IDLE);
			}
		  }
		  
		  if (!isMoving) {
			this.ticks++;

			if (this.state === LizAnimationState.IDLE && this.ticks > (10/0.01)) {
				this.setState(LizAnimationState.DANCING);
				this.ticks = 0;
			} else if (this.state === LizAnimationState.DANCING && this.ticks > (10/0.01)) {
				this.setState(LizAnimationState.IDLE);
				this.ticks = 0;
			}
		  }
	}

	private setState(state: LizAnimationState): void {
		if (this.state == state) {
			return;
		}

		print("SET ANIM STATE", state)

		this.state = state;
		this.entity.ResetSequence(state);
	}

	private isSequenceFinished(): boolean {
		return this.entity.IsSequenceFinished();
	}
}
