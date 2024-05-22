import Tool from "../Tool";
import TickDelta from "../../utils/TickDelta";

export default class Skyhook extends Tool {
	private isEquipped: boolean = false;
	private hand: CPropVRHand | null = null;
	private handID: number = -1;
	private handAttachment: CBaseEntity | null = null;
	private hooksAttachment: CBaseAnimating | null = null;
	private player: CBasePlayer | null = null;

	private skyhookBodyModel = "models/tools/skyhook.vmdl";
	private skyhookHooksModel = "models/tools/skyhook_hooks.vmdl";
	private skyhookAnimName = "default";
	private skyhookHooksAttachmentPointName = "hooks_attach"

	private equipSound = "skyhook_equip";
	private startSound = "skyhook_start_spinning";
	private loopSound = "skyhook_spinning";
	private stopSound = "skyhook_stop_spinning";

	private currentSpinSpeed = 0;
	private targetSpinSpeed = 0;
	private maxSpinSpeed = 3000;
	private isSpinning = false;

	private tickDelta: TickDelta;
	private hookUpdateRate = 1 / 30 // 30 tps;

	/**
	 * Prevent spinning when picked up
	 */
	private disableSpinning = true;
	private disableSpinningSeconds = 0.1;
	private equippedAt = 0;

	constructor(entity: CDestinationsPropTool) {
		super(entity);
		this.tickDelta = new TickDelta();
	}

	public precache(context: any) {
		PrecacheModel(this.skyhookBodyModel, context);
		PrecacheModel(this.skyhookHooksModel, context);
	}

	public activate() {
		const entity = this.getEntity();
		const attachmentID = entity.ScriptLookupAttachment( "hooks_attach" );
		const spawnPosition = entity.GetAttachmentOrigin( attachmentID );

		const hooksSpawnInfo: EntitySpawnInfo & any = {
			targetname: "hooks",
			model: this.skyhookHooksModel,
			origin: spawnPosition,
			angles: entity.GetAngles(),
			solid: 1,
			DefaultAnim: "",
			Collisions: "Solid",
			ScriptedMovement: 1
		}

		this.hooksAttachment = SpawnEntityFromTableSynchronous( "prop_dynamic", hooksSpawnInfo ) as CBaseAnimating;
		this.hooksAttachment.SetParent( entity, this.skyhookHooksAttachmentPointName );

		this.hooksAttachment.SetLocalOrigin( Vector(0, 0, 0) );
		this.hooksAttachment.SetLocalAngles( 0, 90, 0 );
		this.hooksAttachment.SetSequence(this.skyhookAnimName);

		this.hooksAttachment.SetThink(this.think.bind(this), this, this.hookUpdateRate);
	}

	public think(): number {
		const delta = this.tickDelta.tick();
		if (this.disableSpinning) {
			this.targetSpinSpeed = 0;
		}
	
		const targetSpinSpeed = this.targetSpinSpeed > 0.2 ? this.maxSpinSpeed : 0;
	
		this.currentSpinSpeed = Lerp(3*delta, this.currentSpinSpeed, targetSpinSpeed);
		this.hooksAttachment!.SetAngularVelocity(this.currentSpinSpeed,0,0);
	
		const lastIsSpinning = this.isSpinning;
		this.isSpinning = this.targetSpinSpeed > 0.2;
	
		if (this.isSpinning && lastIsSpinning != this.isSpinning) {
			EmitSoundOn(this.startSound, this.hooksAttachment!);
			EmitSoundOn(this.loopSound, this.hooksAttachment!);
		}
		if (!this.isSpinning && lastIsSpinning != this.isSpinning) {
			EmitSoundOn(this.stopSound, this.hooksAttachment!);
			StopSoundOn(this.loopSound, this.hooksAttachment!);
		}
	
	
		const power = this.currentSpinSpeed / this.maxSpinSpeed;
		if (this.hand !== null && power > 0.2) {
			this.hand.FireHapticPulse(power);
		}
	
		return this.hookUpdateRate;
	}

	public equip(hand: CPropVRHand, handID: number, handAttachment: CBaseEntity, player: CBasePlayer): boolean {
		this.hand = hand;
		this.handID = handID;
		this.handAttachment = handAttachment;
		this.player = player;
		this.isEquipped = true;

		this.disableSpinning = true;
		this.equippedAt = Time();
	
		this.hooksAttachment!.SetParent(this.handAttachment, this.skyhookHooksAttachmentPointName);
		this.hooksAttachment!.SetLocalOrigin(Vector(0, 0, 0));
		this.hooksAttachment!.SetLocalAngles(0, 90, 0);
		this.hooksAttachment!.SetSequence(this.skyhookAnimName);
		EmitSoundOn(this.equipSound, this.hooksAttachment!);
	
		return true;
	}

	public drop(): boolean {
		this.hooksAttachment!.SetParent(this.getEntity(), this.skyhookHooksAttachmentPointName);
		this.hooksAttachment!.SetLocalOrigin(Vector(0, 0, 0));
		this.hooksAttachment!.SetLocalAngles(0, 90, 0);

		this.hand = null;
		this.handID = -1;
		this.handAttachment = null;
		this.player = null;
		this.isEquipped = false;

		this.disableSpinning = true;

		return true;
	}

	public handleInput(input: CHandInputData): CHandInputData {
		const IN_TRIGGER = this.handID === 0 ? IN_USE_HAND0 : IN_USE_HAND1;
		const IN_GRIP = this.handID === 0 ? IN_GRIP_HAND0 : IN_GRIP_HAND1;

		if (input.buttonsReleased.IsBitSet(IN_TRIGGER)) {
			// Prevent trigger release from dropping the tool
			input.buttonsReleased.ClearBit(IN_TRIGGER);
		}

		if (input.buttonsReleased.IsBitSet(IN_GRIP)) {
			input.buttonsReleased.ClearBit(IN_GRIP);

			// Drop the tool when grip is pressed
			this.getEntity().ForceDropTool();
		}

		if (this.disableSpinning && input.triggerValue == 0 && (Time() - this.equippedAt) > this.disableSpinningSeconds) {
			this.disableSpinning = false;
		}

		this.targetSpinSpeed = input.triggerValue;

		return input;
	}
}
