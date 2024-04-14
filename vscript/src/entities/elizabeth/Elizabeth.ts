import {LizAnimationController} from "./animationController";
import {LizCuriousityUtils} from "./lizCuriousity";
import {LizEvent, LizEventManager, ObjectCaughtEvent, PlayerReadyEvent} from "./lizEvents";
import IdleState from "./states/IdleState";
import ThrowingState from "./states/ThrowingState";
import {LizStateName} from "./states/LizState";
import {LizStateManager} from "./states/LizStateManager";
import LookAtComponent from "./components/LookAtComponent";
import EmotionComponent from "./components/EmotionComponent";
import FloorSnapComponent from "./components/FloorSnapComponent";
import SpeechComponent from "./components/SpeechComponent";
import BioshockEntity from "../BioshockEntity";
import AbandonComponent from "./components/AbandonComponent";
import {LineTrace} from "../../utils/Trace";
import PlayerLookingComponent from "./components/PlayerLookingComponent";
import {BioshockEntityComponentManager} from "../BioshockEntityComponent";

export default class Elizabeth extends BioshockEntity {
	private animController: LizAnimationController;

	private slowSpeed = 20;
	private fullSpeed = 70;
	private currentSpeed = 0;

	private player: CBasePlayer;

	private headOffset: number;

	private speech: SpeechComponent;
	private playerLooking: PlayerLookingComponent;
	private floorSnap: FloorSnapComponent;
	private lookAt: LookAtComponent;
	private emotion: EmotionComponent;
	private abandon: AbandonComponent;

	private stateManager: LizStateManager;

	public constructor(entity: CBaseAnimating) {
		super(entity);
		this.getEntity().Attribute_SetIntValue("is_liz", 1);

		this.headOffset = this.getEntity().GetAttachmentOrigin(this.getEntity().ScriptLookupAttachment("head")).z - this.getEntity().GetAbsOrigin().z;

		this.animController = new LizAnimationController(entity);

		this.player = Entities.GetLocalPlayer();

		this.speech = new SpeechComponent(this);
		this.playerLooking = new PlayerLookingComponent(this);
		this.floorSnap = new FloorSnapComponent(this, true);
		this.lookAt = new LookAtComponent(this);
		this.emotion = new EmotionComponent(this);
		this.abandon = new AbandonComponent(this);

		this.components.add(this.speech);
		this.components.add(this.playerLooking);
		this.components.add(this.floorSnap);
		this.components.add(this.lookAt);
		this.components.add(this.emotion);
		this.components.add(this.abandon);

		this.stateManager = new LizStateManager("Elizabeth");
		this.stateManager.addState(new IdleState(this));
		this.stateManager.addState(new ThrowingState(this));
		this.stateManager.begin(LizStateName.Idle);

		LizEventManager.on(LizEvent.PlayerReady, this.onPlayerReady, this);
		LizEventManager.on(LizEvent.ObjectCaught, this.onObjectCaught, this);

		print("Elizabeth spawned");
	}

	public update(delta: number) {
		if (this.player === null) {
			this.player = Entities.GetLocalPlayer();
			return;
		}

		this.components.update(delta);
		this.stateManager.update(delta);

		if (this.stateManager.getCurrentState()!.isCompleted()) {
			if (this.stateManager.isCurrentState(LizStateName.Idle)) {
				this.stateManager.setState(LizStateName.Throwing);
			} else {
				this.stateManager.setState(LizStateName.Idle);
			}
		}

		// let lizPos = this.entity.GetAbsOrigin();
		// let lizFwd = this.entity.GetForwardVector();
		// let lizRight = this.entity.GetRightVector();
		// let lizUp = this.entity.GetUpVector();
		// const direction = subVector(this.goalPos, lizPos).Normalized();
		// const distance = VectorDistance(Vector(lizPos.x, lizPos.y, 0), Vector(this.goalPos.x, this.goalPos.y, 0));
		//
		// const acceleration = 20;
		// const deceleration = 20;
		//
		// if (distance > 50) {
		// 	const desiredSpeed = Math.min(distance / delta, this.fullSpeed);
		// 	const desiredVelocity = mulVector(direction, desiredSpeed as Vector);
		//
		// 	const accelerationVector = mulVector(subVector(desiredVelocity, this.entity.GetVelocity()).Normalized(), acceleration as Vector);
		// 	this.entity.SetVelocity(addVector(this.entity.GetVelocity(), (mulVector(accelerationVector, delta as Vector))));
		//
		// 	if (this.entity.GetVelocity().Length() > desiredSpeed) {
		// 		this.entity.SetVelocity(mulVector(this.entity.GetVelocity().Normalized(), desiredSpeed as Vector));
		// 	}
		// } else {
		// 	// The NPC has reached or is very close to the target position, so it should stop
		// 	const decelerationVector = mulVector(this.entity.GetVelocity().Normalized(), -deceleration as Vector);
		// 	this.entity.SetVelocity(addVector(this.entity.GetVelocity(), mulVector(decelerationVector, delta as Vector)));
		//
		// 	if (this.entity.GetVelocity().Length() < 1) {
		// 		// Stop the NPC completely
		// 		this.entity.SetVelocity(Vector(0, 0, 0))
		// 	}
		//
		// 	// commented out for curiousity points
		// 	// const goal = getGoalPointAtIndex(this.goalIndex);
		// 	// this.goalPos = goal.position;
		// 	// this.goalIndex++;
		// }
		//
		// // DebugDrawLine(this.goalPos, addVector(this.goalPos, Vector(0, 0, 100)), 255, 0, 0, false, delta);
		//
		// let targetYaw = Rad2Deg(Math.atan2(direction.x, direction.y));
		// this.entity.SetAbsAngles(0, -targetYaw+90, 0);
		//
		// this.currentSpeed = this.entity.GetVelocity().Length();
		// this.animController.updateAnimation(this.currentSpeed > 0, this.currentSpeed > (this.fullSpeed * 0.7), this.currentSpeed < (this.fullSpeed * 0.05));
	}

	public updatePose(delta: number) {
		this.components.updatePose(delta);
	}

	private getPlayerByUserID(userID: number): CBasePlayer | null {
		const allPlayerEntities = Entities.FindAllByClassname("player") as CBasePlayer[];
		return allPlayerEntities.find(p => p.GetUserID() === userID) || null;
	}

	private onPlayerReady(event: PlayerReadyEvent) {
		const player = this.getPlayerByUserID(event.userID);
		if (!player) {
			return;
		}

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
		return this.entity as CBaseAnimating;
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

	public getPosition(): Vector {
		return this.entity.GetAbsOrigin();
	}

	public getHeadPosition(): Vector {
		const pos = this.getPosition();
		return Vector(pos.x, pos.y, pos.z + this.headOffset);
	}



	/**
	 * Returns true if the player is looking at Elizabeth.
	 */
	public isPlayerLooking(): boolean {
		// DebugDrawLine(this.player.GetHMDAvatar()!.GetAbsOrigin(), this.getHeadPosition(), this.playerLooking ? 0 : 255, this.playerLooking ? 255 : 0, 0, false, 0.1);
		return this.playerLooking.isLooking();
	}
}
