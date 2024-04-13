import {LizAnimationController} from "./animationController";
import {LizCuriousityPoint, LizCuriousityUtils} from "./lizCuriousity";
import {LizEvent, LizEventManager, ObjectCaughtEvent, PlayerReadyEvent} from "./lizEvents";
import {getGoalPointAtIndex} from "./lizNav";
import {getSpeechClip, LizSpeechTag} from "./speechConfig";
import IdleState from "./states/IdleState";
import ThrowingState from "./states/ThrowingState";
import {LizStateName} from "./states/LizState";
import {LizStateManager} from "./states/LizStateManager";
import LookAtComponent from "./components/LookAtComponent";
import EmotionComponent from "./components/EmotionComponent";
import FloorSnapComponent from "./components/FloorSnapComponent";
import SpeechComponent from "./components/SpeechComponent";


export default class Elizabeth {
	private spawnPos = Vector();

	private entity: CBaseAnimating;
	private animController: LizAnimationController;

	private slowSpeed = 20;
	private fullSpeed = 70;
	private currentSpeed = 0;

	private goalIndex: number = 0;
	public goalPos: Vector = Vector();
	private isRunning: boolean = false;
	private hasStartedWalking: boolean = false;

	private player: CBasePlayer;

	private speech: SpeechComponent;
	private floorSnap: FloorSnapComponent;
	private lookAt: LookAtComponent;
	private emotion: EmotionComponent;

	private stateManager: LizStateManager;

	public constructor(entity: CBaseAnimating) {
		this.entity = entity;
		this.animController = new LizAnimationController(entity);

		this.player = Entities.GetLocalPlayer();

		this.speech = new SpeechComponent(this);
		this.floorSnap = new FloorSnapComponent(this, true);
		this.lookAt = new LookAtComponent(this);
		this.emotion = new EmotionComponent(this);

		this.stateManager = new LizStateManager("Elizabeth");
		this.stateManager.addState(new IdleState(this));
		this.stateManager.addState(new ThrowingState(this));
	}

	/**
	 * Returns the currently focused player
	 */
	public getPlayer(): CBasePlayer {
		return this.player;
	}

	/**
	 * Return the underlying entity reference
	 */
	public getEntity(): CBaseAnimating {
		return this.entity;
	}

	public spawn() {
		this.entity.Attribute_SetIntValue("is_liz", 1);
		this.spawnPos = this.entity.GetAbsOrigin();

		const goal = getGoalPointAtIndex(this.goalIndex);
		this.goalPos = goal.position;
		this.goalIndex++;
		LizEventManager.on(LizEvent.PlayerReady, this.onPlayerReady, this);
		LizEventManager.on(LizEvent.ObjectCaught, this.onObjectCaught, this);

		this.curiousityPoints = LizCuriousityUtils.findAllCuriousityPoints();
		this.stateManager.begin(LizStateName.Idle);
		print("elizabeth spawn");
	}

	private getPlayerByUserID(userID: number): CBasePlayer | null {
		const allPlayerEntities = Entities.FindAllByClassname("player") as CBasePlayer[];
		return allPlayerEntities.find(p => p.GetUserID() === userID) || null;
	}

	private isLookingAtLiz(player: CBasePlayer): boolean {
		const head = player.GetHMDAvatar()!;
		const startVector = head.GetAbsOrigin();
		const traceTable: TraceTable = {
			startpos: startVector,
			endpos: addVector(startVector, mulVector(head.GetForwardVector(), 1000 as Vector)),
			ignore: head,
			mask: 33636363 // TRACE_MASK_PLAYER_SOLID from L4D2 script API, may not be correct for Source 2.
		};

		TraceLine(traceTable)

		const leftPos = RotatePosition(traceTable.startpos, QAngle(0, -45, 0), traceTable.endpos);
		const rightPos = RotatePosition(traceTable.startpos, QAngle(0, 45, 0), traceTable.endpos);
		DebugDrawLine(startVector, leftPos, 255, 0, 0, false, 4);
		DebugDrawLine(startVector, rightPos, 255, 0, 0, false, 4);


		if (!traceTable.hit) {
			return false;
		}

		return traceTable.enthit !== null && traceTable.enthit!.HasAttribute("is_liz");
	}

	private onPlayerReady(event: PlayerReadyEvent) {
		const player = this.getPlayerByUserID(event.userID);
		if (!player) {
			return;
		}

		this.isLookingAtLiz(player);

		event.player = player;
		this.stateManager.onPlayerReady(event);
	}
	private onObjectCaught(event: ObjectCaughtEvent) {
		const player = this.getPlayerByUserID(event.userID);
		if (!player) {
			return;
		}

		event.player = player;
		this.stateManager.onObjectCaught(event);
	}

	private curiousityPoints: LizCuriousityPoint[] = [];
	private currentCuriousityPoint: LizCuriousityPoint | null = null;
	private maxCuriousitySeconds = 10;
	private curiousityTime = 0;
	private curiositySpeech = false;
	private curiousityRadius = 200;
	private usedCuriosityPoints = new Set<number>();
	private beCurious(delta: number) {
		const lizPos = this.entity.GetAbsOrigin();
		if (this.currentCuriousityPoint === null) {
			this.currentCuriousityPoint = LizCuriousityUtils.getNearestCuriosityPoint(lizPos, this.curiousityPoints, this.usedCuriosityPoints);
			print("FOUND CURIOUSITY POINT");
			return;
		}

		const inCuriousRadius = VectorDistance(this.currentCuriousityPoint.position, lizPos) < this.curiousityRadius;
		this.goalPos = this.currentCuriousityPoint.position;
		if (inCuriousRadius) {
			this.curiousityTime += delta;

			if (!this.curiositySpeech && this.curiousityTime > (this.maxAbandonSeconds / 2)) {
				const isSmelly = this.currentCuriousityPoint.smelly;
				let sentiment = this.currentCuriousityPoint.sentiment;
				let speechTag = LizSpeechTag.Hmm;
				if (isSmelly) {
					speechTag = LizSpeechTag.Smelly;
				} else if (sentiment > 0.51) {
					speechTag = LizSpeechTag.LookAtThis;
				}
	
				const clip = getSpeechClip(speechTag, sentiment, null);
				this.speech.queueClip(clip!);
				this.curiositySpeech = true;
			}
		}

		if (this.curiousityTime > this.maxCuriousitySeconds) {
			this.usedCuriosityPoints.add(this.currentCuriousityPoint.id);
			this.currentCuriousityPoint = null;
			this.curiousityTime = 0;
			this.curiositySpeech = false;
		}
	}

	private maxAbandonDistance = 1500;
	private maxAbandonSeconds = 3;
	private abandonTime = 0;
	private isTeleportingToPlayer = false;
	private regroupWithPlayer(delta: number) {
		const lizPos = this.entity.GetAbsOrigin();
		if (this.player === null) {
			this.player = Entities.GetLocalPlayer();
			return;
		}

		const distanceToPlayer = VectorDistance(this.player.GetAbsOrigin(), lizPos);
		if (distanceToPlayer > this.maxAbandonDistance) {
			this.abandonTime += delta;
		}

		if (this.abandonTime > this.maxAbandonSeconds) {
			this.abandonTime = 0;
			this.entity.SetAbsOrigin(this.player.GetHMDAvatar()!.GetAbsOrigin());
			this.isTeleportingToPlayer = true;
			this.currentCuriousityPoint = null;
			print("TEELEPORTIN TO PLAYER");
		}
	}

	public update(delta: number) {
		this.isTeleportingToPlayer = false;
		let lizPos = this.entity.GetAbsOrigin();
		let lizFwd = this.entity.GetForwardVector();
		let lizRight = this.entity.GetRightVector();
		let lizUp = this.entity.GetUpVector();

		// this.beCurious(delta);
		this.regroupWithPlayer(delta);

		this.floorSnap.update(delta);
		this.speech.update(delta);
		this.stateManager.update(delta);

		if (this.stateManager.getCurrentState()!.isCompleted()) {
			if (this.stateManager.isCurrentState(LizStateName.Idle)) {
				this.stateManager.setState(LizStateName.Throwing);
			} else {
				this.stateManager.setState(LizStateName.Idle);
			}
		}

		return;

		const direction = subVector(this.goalPos, lizPos).Normalized();
		const distance = VectorDistance(Vector(lizPos.x, lizPos.y, 0), Vector(this.goalPos.x, this.goalPos.y, 0));

		const acceleration = 20;
		const deceleration = 20;

		if (distance > 50) {
			// The NPC is far from the target position, so it should start moving
			const desiredSpeed = Math.min(distance / delta, this.fullSpeed);
			const desiredVelocity = mulVector(direction, desiredSpeed as Vector);

			const accelerationVector = mulVector(subVector(desiredVelocity, this.entity.GetVelocity()).Normalized(), acceleration as Vector);
			this.entity.SetVelocity(addVector(this.entity.GetVelocity(), (mulVector(accelerationVector, delta as Vector))));

			if (this.entity.GetVelocity().Length() > desiredSpeed) {
				this.entity.SetVelocity(mulVector(this.entity.GetVelocity().Normalized(), desiredSpeed as Vector));
			}
		} else {
			// The NPC has reached or is very close to the target position, so it should stop
			const decelerationVector = mulVector(this.entity.GetVelocity().Normalized(), -deceleration as Vector);
			this.entity.SetVelocity(addVector(this.entity.GetVelocity(), mulVector(decelerationVector, delta as Vector)));

			if (this.entity.GetVelocity().Length() < 1) {
				// Stop the NPC completely
				this.entity.SetVelocity(Vector(0, 0, 0))
			}

			// commented out for curiousity points
			// const goal = getGoalPointAtIndex(this.goalIndex);
			// this.goalPos = goal.position;
			// this.goalIndex++;
		}

		// DebugDrawLine(this.goalPos, addVector(this.goalPos, Vector(0, 0, 100)), 255, 0, 0, false, delta);

		let targetYaw = Rad2Deg(Math.atan2(direction.x, direction.y));
		this.entity.SetAbsAngles(0, -targetYaw+90, 0);

		this.currentSpeed = this.entity.GetVelocity().Length();
		this.animController.updateAnimation(this.currentSpeed > 0, this.currentSpeed > (this.fullSpeed * 0.7), this.currentSpeed < (this.fullSpeed * 0.05));
	}

	public updatePose(delta: number) {
		this.lookAt.updatePose(delta);
		this.emotion.updatePose(delta);
	}

	public getSpeech(): SpeechComponent {
		return this.speech;
	}

	public getFloorSnap(): FloorSnapComponent {
		return this.floorSnap;
	}

	public getLookAt(): LookAtComponent {
		return this.lookAt;
	}

	public getEmotion(): EmotionComponent {
		return this.emotion;
	}
}
