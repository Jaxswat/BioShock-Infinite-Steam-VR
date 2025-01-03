import {LizAnimationController} from "./animationController";
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
import PlayerLookingComponent from "./components/PlayerLookingComponent";
import MoveComponent from "./components/MoveComponent";
import FollowingState from "./states/FollowingState";
import ChoreoState from "./states/ChoreoState";
import {LizChoreoPoint, LizChoreoUtils} from "./LizChoreo";
import BioshockEventManager from "../../events/BioshockEventManager";
import { BioshockEvent, LizGunPointEvent, LizObjectCaughtEvent, LizPlayerReadyEvent } from "../../events/BioshockEvents";
import LizEventHandler from "./lizEvents";

require('./baked/lizSpeechClips'); // Register all liz speech clips

export default class Elizabeth extends BioshockEntity implements LizEventHandler {
	private animController: LizAnimationController;

	private choreoPoints: LizChoreoPoint[];

	private player: CBasePlayer;

	private headOffset: number;

	private speech: SpeechComponent;
	private playerLooking: PlayerLookingComponent;
	private floorSnap: FloorSnapComponent;
	private lookAt: LookAtComponent;
	private emotion: EmotionComponent;
	private abandon: AbandonComponent;
	private move: MoveComponent;

	private stateManager: LizStateManager;

	public constructor(entity: CBaseAnimating) {
		super(entity);
		this.getEntity().Attribute_SetIntValue("is_liz", 1);

		this.headOffset = this.getEntity().GetAttachmentOrigin(this.getEntity().ScriptLookupAttachment("head")).z - this.getEntity().GetAbsOrigin().z;

		this.animController = new LizAnimationController(entity);

		this.choreoPoints = LizChoreoUtils.findAllChoreoPoints();

		this.player = Entities.GetLocalPlayer();

		this.speech = new SpeechComponent(this);
		this.playerLooking = new PlayerLookingComponent(this);
		this.floorSnap = new FloorSnapComponent(this, true);
		this.lookAt = new LookAtComponent(this);
		this.emotion = new EmotionComponent(this);
		this.abandon = new AbandonComponent(this);
		this.move = new MoveComponent(this);

		this.components.add(this.speech);
		this.components.add(this.playerLooking);
		this.components.add(this.floorSnap);
		this.components.add(this.lookAt);
		this.components.add(this.emotion);
		this.components.add(this.abandon);
		this.components.add(this.move);

		this.stateManager = new LizStateManager("Elizabeth");
		this.stateManager.addState(new IdleState(this));
		this.stateManager.addState(new ThrowingState(this));
		this.stateManager.addState(new FollowingState(this));
		this.stateManager.addState(new ChoreoState(this));

		BioshockEventManager.on(BioshockEvent.LizPlayerReady, this.onPlayerReady, this);
		BioshockEventManager.on(BioshockEvent.LizObjectCaught, this.onObjectCaught, this);
		BioshockEventManager.on(BioshockEvent.LizGunPoint, this.onGunPoint, this);

		print("Elizabeth spawned");
	}

	public update(delta: number) {
		if (this.player === null) {
			this.player = Entities.GetLocalPlayer();

			if (this.player === null) {
				return;
			} else {
				// Player found, begin Liz'ing
				this.stateManager.begin(LizStateName.Idle);
				// this.abandon.setEnabled(false);
			}
		}

		this.components.update(delta);
		this.stateManager.update(delta);

		if (this.stateManager.getCurrentState()!.isCompleted()) {
			const playerDistance = VectorDistance(this.player.GetAbsOrigin(), this.getPosition());
			const nearestChoreoPoint = LizChoreoUtils.getNearestChoreoPoint(this.getPosition(), this.choreoPoints);
			if ((this.stateManager.isCurrentState(LizStateName.Idle) || this.stateManager.isCurrentState(LizStateName.Following)) && playerDistance > 150) {
				this.stateManager.setState(LizStateName.Following);
			} else if (nearestChoreoPoint && VectorDistance(nearestChoreoPoint.position, this.getPosition()) < nearestChoreoPoint.activateDistance) {
				this.stateManager.setState(LizStateName.Choreo);
			} else if (this.stateManager.isCurrentState(LizStateName.Idle)) {
				this.stateManager.setState(LizStateName.Throwing);
			} else if (this.stateManager.isCurrentState(LizStateName.Choreo)) {
				this.stateManager.setState(LizStateName.Idle);
			} else {
				this.stateManager.setState(LizStateName.Idle);
			}
		}
	}

	public updatePose(delta: number) {
		this.components.updatePose(delta);
	}

	/**
	 * Called when liz gets teleported back to the player
	 */
	public onAbandon() {
		this.stateManager.setState(LizStateName.Idle);
	}

	private onPlayerReady(event: LizPlayerReadyEvent) {
		this.stateManager.onPlayerReady(event);
	}

	private onObjectCaught(event: LizObjectCaughtEvent) {
		this.stateManager.onObjectCaught(event);
	}

	private onGunPoint(event: LizGunPointEvent) {
		this.stateManager.onGunPoint(event);
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

	public getMove(): MoveComponent {
		return this.move;
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

	/**
	 * Faces liz towards player. Temporary method until I decide where to put this.
	 */
	public facePlayer() {
		const direction = subVector(this.player.GetAbsOrigin(), this.getPosition()).Normalized();
		const targetYaw = Rad2Deg(Math.atan2(direction.x, direction.y));
		this.entity.SetAbsAngles(0, -targetYaw+90, 0);
	}

	public getChoreoPoints(): LizChoreoPoint[] {
		return this.choreoPoints;
	}
}
