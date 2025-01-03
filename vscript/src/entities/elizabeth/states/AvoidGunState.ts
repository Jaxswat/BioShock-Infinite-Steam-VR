import { LizState, LizStateName } from "./LizState";
import Elizabeth from "../Elizabeth";
import Timer from "../../../utils/Timer";
import { getSpeechClip, LizSpeechTag } from "../lizSpeech";
import { LineTrace } from "../../../utils/Trace";

export default class AvoidGunState extends LizState {
	private stateSwitchTimer: Timer;

	public constructor(liz: Elizabeth) {
		super(LizStateName.AvoidGun, liz);
		this.stateSwitchTimer = new Timer(2);
	}

	public enter(): void {
		this.liz.getEntity().ResetSequence("standing_idle");
		this.stateSwitchTimer.reset();

		this.liz.facePlayer();

		const clip = getSpeechClip(LizSpeechTag.GunPoint, null, null);
		this.liz.getSpeech().queueClip(clip!);

		this.liz.getMove().moveTo(this.getAvoidedPosition());
	}

	public exit(): void {
	}

	public update(delta: number): void {
		this.stateSwitchTimer.tick(delta);
	}

	public isCompleted(): boolean {
		return this.stateSwitchTimer.isDone();
	}

	private getAvoidedPosition(): Vector {
		const player = this.liz.getPlayer();
		const hmd = player.GetHMDAvatar()!;
		const playerPos = player.GetAbsOrigin();
		const playerForward = hmd.GetForwardVector();
		const playerRight = hmd.GetRightVector();

		const offsetDistance = 100;
		const randomOffsetRange = 70;
		const randomOffsetX = (Math.random() * 2 - 1) * randomOffsetRange;

		let offset = Vector(0, 0, 0);
		offset = addVector(offset, mulVector(playerForward, offsetDistance as Vector));
		offset = addVector(offset, mulVector(playerRight, randomOffsetX as Vector));
		offset.z = hmd.GetAbsOrigin().z - playerPos.z;

		const teleportPosition = addVector(playerPos, offset);

		const floorTrace = new LineTrace(teleportPosition, subVector(teleportPosition, Vector(0, 0, 1000)));
		floorTrace.setIgnoreEntity(this.liz.getEntity());
		if (floorTrace.run().hasHit()) {
			return floorTrace.run().getHitPosition();
		}

		return teleportPosition;
	}
}
