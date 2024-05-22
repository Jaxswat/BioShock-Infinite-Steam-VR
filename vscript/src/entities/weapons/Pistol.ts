import Tool from "../Tool";
import TickDelta from "../../utils/TickDelta";
import {LineTrace} from "../../utils/Trace";

/**
 * Pistol Weapon
 *
 * A note on the model/animations:
 *
 * prop_destinations_tool entity cannot play animations, but handAttachment can (KINDA?)...
 * The animation looked awful and incorrect. It kept stuttering and playing at 1000x speed?
 * So what I did instead is made a dummy model to attach a prop_dynamic to.
 * The dummy model has the vr_controller_root attachment point, and the prop_dynamic has the pistol model.
 * The dummy model is just a single polygon that is very tiny, since ModelDoc (or whatever garbage version ships with SteamVR Home)
 * requires some mesh to be present. I manually override the `m_collision` file in the .vmdl to be the same as the pistol model.
 *
 * I would have made the dummy model the pistol, but none of the render settings would make it invisible.
 * I could have also done what I did for Skyhook and manually animate the parts, but that's an awful implementation.
 * The Skyhook needs that for collision/smooth spinning, but the pistol doesn't.
 *
 * The result of all this is, the dummy mesh can be picked up with the same collision as the pistol model, and the pistol model is attached to the hand correctly.
 * The only bug is that when the tool is dropped, it gets rotated 90 degrees in the wrong direction. I could probably fix
 * this by re-exporting the pistol at the correct x-axis forward direction, but whaaaatever.
 *
 * Also, the code for this is ugly. Ugly code is a sign of great struggle with SteamVR Home.
 */
export default class Pistol extends Tool {
    private isEquipped: boolean = false;
    private hand: CPropVRHand | null = null;
    private handID: number = -1;
    private handAttachment: CBaseEntity | null = null;
    private modelAttachment: CBaseAnimating | null = null;
    private player: CBasePlayer | null = null;

    private hiddenModel = "models/tools/vr_tool_root.vmdl";
    private pistolModel = "models/weapons/pistol.vmdl";

    private tickDelta: TickDelta;
    private updateRate = 1 / 30 // 30 tps;

    private triggerDown = false;
    private fired = false;
    private disableFiring = true;
    private disableFiringSeconds = 0.1;
    private equippedAt = 0;

    constructor(entity: CDestinationsPropTool) {
        super(entity);
        this.tickDelta = new TickDelta();
    }

    public precache(context: any) {
        PrecacheModel(this.hiddenModel, context);
        PrecacheModel(this.pistolModel, context);
    }

    public activate() {
        const entity = this.getEntity();

        const spawnInfo: EntitySpawnInfo & any = {
            model: this.pistolModel,
            origin: entity.GetAbsOrigin(),
            angles: entity.GetAngles(),
            solid: 1,
            DefaultAnim: "",
            Collisions: "Solid"
        }

        this.modelAttachment = SpawnEntityFromTableSynchronous( "prop_dynamic", spawnInfo ) as CBaseAnimating;
        this.modelAttachment.SetParent( entity, "" );

        this.modelAttachment.SetLocalOrigin( Vector(0, 0, 0) );
        this.modelAttachment.SetLocalAngles( 0, 0, 0 );
        this.modelAttachment.ResetSequence("idle");

        this.modelAttachment.SetThink(this.think.bind(this), this, this.updateRate);
    }

    public think(): number {
        const delta = this.tickDelta.tick();
        if (this.disableFiring || this.hand === null) {
            return this.updateRate;
        }

        if (this.triggerDown && !this.fired) {
            this.fired = true;
            this.onFire();
        } else if (!this.triggerDown && this.fired) {
            this.fired = false;
        }

        return this.updateRate;
    }

    private onFire() {
        this.modelAttachment!.ResetSequence("fire");
        EmitSoundOn("pistol_shot", this.modelAttachment!);
        this.hand!.FireHapticPulse(2);

        const muzzleAttachmentID = this.modelAttachment!.ScriptLookupAttachment("muzzle");
        const muzzlePosition = this.modelAttachment!.GetAttachmentOrigin(muzzleAttachmentID);
        const muzzleForward = this.modelAttachment!.GetAttachmentForward(muzzleAttachmentID);

        const trace = new LineTrace(muzzlePosition, addVector(muzzlePosition, mulVector(muzzleForward, 3000 as Vector)));
        trace.setIgnoreEntity(this.player!);
        const result = trace.run();

        const hitEntity = result.getEntityHit();
        if (hitEntity === null) {
            return;
        }

        const damageInfo = CreateDamageInfo(this.entity, this.player!, mulVector(muzzleForward, 200 as Vector), result.getHitPosition(), 50, DMG_BULLET);
        hitEntity.TakeDamage(damageInfo);
        DestroyDamageInfo(damageInfo);

        DebugDrawLine(trace.getStartPosition(), result.getHitPosition(), 255, 0, 0, false, 0.1);
    }

    public equip(hand: CPropVRHand, handID: number, handAttachment: CBaseEntity, player: CBasePlayer): boolean {
        this.isEquipped = true;
        this.hand = hand;
        this.handID = handID;
        this.handAttachment = handAttachment;
        this.player = player;

        this.disableFiring = true;
        this.equippedAt = Time();

        this.modelAttachment!.SetParent(this.handAttachment, "");
        this.modelAttachment!.SetLocalOrigin(Vector(0, 0, 0));
        this.modelAttachment!.SetLocalAngles(0, -90, 0);
        this.modelAttachment!.ResetSequence("fire_idle");
        EmitSoundOn("skyhook_equip", this.modelAttachment!);

        return true;
    }

    public drop(): boolean {
        this.modelAttachment!.SetParent(this.getEntity(), "");
        this.modelAttachment!.SetLocalOrigin(Vector(0, 0, 0));
        this.modelAttachment!.SetLocalAngles(0, 0, 0);
        this.modelAttachment!.ResetSequence("idle");

        this.isEquipped = false;
        this.hand = null;
        this.handID = -1;
        this.handAttachment = null;
        this.player = null;

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

        if (this.disableFiring && input.triggerValue == 0 && (Time() - this.equippedAt) > this.disableFiringSeconds) {
            this.disableFiring = false;
        }

        let triggerPose = input.triggerValue * 0.95; // trigger throw
        this.triggerDown = input.triggerValue === 1.0;
        if (this.triggerDown) {
            triggerPose = 1.0; // trigger break
        }

        this.modelAttachment!.SetPoseParameter("trigger", triggerPose);

        return input;
    }
}
