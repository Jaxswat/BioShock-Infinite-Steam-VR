import {LizState, LizStateName} from "./LizState";
import Elizabeth from "../Elizabeth";
import {getClipByName, getSpeechClip, LizSpeechSentiment, LizSpeechTag} from "../speechConfig";
import {sqrMagnitude} from "../../../utils/Math";
import {ObjectCaughtEvent, PlayerReadyEvent} from "../lizEvents";
import {LizStateManager} from "./LizStateManager";
import Timer from "../../../utils/Timer";

enum ThrowingStateName {
    Waiting = 'waiting',
    Throwing = 'throwing',
    Catching = 'catching',
    Canceled = 'canceled'
}

class ThrowBaseState extends LizState {
    private parentState: ThrowingState;

    protected constructor(stateName: ThrowingStateName, parentState: ThrowingState, liz: Elizabeth) {
        super(stateName, liz);
        this.parentState = parentState;
    }

    protected cancelThrow() {
        this.parentState.cancelThrow();
    }

    protected getThrowObject(): CBaseEntity | null {
        return this.parentState.getThrowObject();
    }

    protected getThrowObjectEntID(): number {
        return this.parentState.getThrowObjectEntID();
    }

    protected setThrowObject(throwObject: CBaseEntity | null) {
        this.parentState.setThrowObject(throwObject);
    }

    protected setThrowObjectEntID(throwObjectEntID: number) { 
        this.parentState.setThrowObjectEntID(throwObjectEntID);
    }
}


class ThrowWaitingState extends ThrowBaseState {
    private throwTimeoutTime: number;
    private throwReady: boolean;

    // How long to wait before throwing
    private readonly throwTimeoutSeconds: number = 5;

    public constructor(parentState: ThrowingState, liz: Elizabeth) {
        super(ThrowingStateName.Waiting, parentState, liz);
        this.throwTimeoutTime = 0;
        this.throwReady = false;
    }

    public enter(): void {
        this.throwTimeoutTime = 0;
        this.throwReady = false;

        this.liz.getEntity().ResetSequence("standing_idle");
        this.spawnCoin();

        const clip = getSpeechClip(LizSpeechTag.FoundMoney, null, null);
        this.liz.getSpeech().queueClip(clip!);
    }

    public update(delta: number): void {
        this.throwTimeoutTime += delta;

        if (this.throwTimeoutTime > this.throwTimeoutSeconds) {
            this.cancelThrow();
        }

        // If the player somehow snatches it out of her hand early
        if (GetHandHoldingEntity(this.getThrowObject()!) !== null) {
            this.cancelThrow();
        }
    }

    public isCompleted(): boolean {
        return this.throwReady;
    }

    private spawnCoin() {
        const entity = this.liz.getEntity();
        const rightGripAttachment = entity.ScriptLookupAttachment("toss");
        const coinPos = entity.GetAttachmentOrigin( rightGripAttachment );


        const coinSpawnInfo: EntitySpawnInfo & any = {
            model: "models/silver_eagle/silver_eagle.vmdl",
            origin: coinPos,
            angles: QAngle(0, 90, 0),
            Collisions: "Solid",
            vscripts: "entity_scripts/tossedCoin",
        };

        const throwObject = SpawnEntityFromTableSynchronous( "prop_destinations_physics", coinSpawnInfo );
        throwObject.SetParent(entity, "toss");
        this.setThrowObject(throwObject);
    }

    public onPlayerReady(event: PlayerReadyEvent) {
        if (event.userID !== this.liz.getPlayer().GetUserID()) {
            return;
        }

        this.throwReady = true;
    }
}

class ThrowThrowingState extends ThrowBaseState {
    // How long the throw has been active
    private throwTime: number;
    private throwReleased: boolean;
    // How far into the animation to release the object
    private readonly throwReleaseTime: number = 0.3;
    private readonly maxThrowSpeed: number = 400;

    public constructor(parentState: ThrowingState, liz: Elizabeth) {
        super(ThrowingStateName.Throwing, parentState, liz);
        this.throwTime = 0;
        this.throwReleased = false;
    }

    public enter(): void {
        this.throwTime = 0;
        this.throwReleased = false;
        this.liz.getEntity().ResetSequence("standing_toss");
    }

    public update(delta: number): void {
        this.throwTime += delta;

        // If the player somehow snatches it out of her hand early
        if (!this.throwReleased && GetHandHoldingEntity(this.getThrowObject()!) !== null) {
            this.cancelThrow();
        }

        if (!this.throwReleased && this.liz.getEntity().GetCycle() > this.throwReleaseTime) {
            this.throwReleased = true;
            this.throwAtPlayer();
        }
    }

    public isCompleted(): boolean {
        return this.throwReleased;
    }

    private throwAtPlayer() {
        const throwObject = this.getThrowObject()!;
        const player = this.liz.getPlayer();
        const playerPos = player.GetHMDAvatar()!.GetAbsOrigin();
        const playerDirection = subVector(playerPos, throwObject.GetAbsOrigin());

        const velocity = this.getTossVelocity(playerDirection, this.maxThrowSpeed);
        const throwAngles = VectorToAngles(playerDirection.Normalized());
        const throwObjectEntID = Math.round(Math.random() * 10000);
        this.setThrowObjectEntID(throwObjectEntID);
        throwObject.Attribute_SetIntValue("liz_ent_id", throwObjectEntID);
        throwObject.SetParent(null, "");
        throwObject.SetAngles(throwAngles.x, throwAngles.y, throwAngles.z);
        throwObject.ApplyAbsVelocityImpulse(velocity);
        throwObject.ApplyLocalAngularVelocityImpulse(Vector(Math.random() * 100, 1000, Math.random() * 100));
        this.setThrowObject(null);
        EmitSoundOnClient("coin_toss", player);
    }

    /**
     * Bruh
     * https://gamedev.stackexchange.com/a/114547
     */
    private getTossVelocity(playerDirection: Vector, maxSpeed: number): Vector {
        const playerDistance = playerDirection.Length2D();
        let speed = maxSpeed;
        if (playerDistance < 360) {
            speed = maxSpeed / 2;
        }

        speed = Lerp(playerDirection.Length2D() / 360, 50, 400);
        const gravity = Convars.GetFloat("sv_gravity");

        const vGravity = Vector(0, 0, -gravity);
        const gSquared = sqrMagnitude(vGravity);

        const b = speed * speed + playerDirection.Dot(vGravity);
        const discriminant = b * b - gSquared * sqrMagnitude(playerDirection);
        const discRoot = Math.sqrt(Math.max(discriminant, 0));

        // Highest shot with the given max speed, longest duration
        // const maxHit = Math.sqrt((b + discRoot) * 2 / gSquared);

        let hitPath: number;
        if (playerDistance < 72) {
            // when under ~6 feet, do a gentle toss
            // Most direct shot with the given max speed, shortest duration
            hitPath = Math.sqrt(Math.sqrt(sqrMagnitude(playerDirection) * 4 / gSquared));
        } else {
            // world series
            // Lowest-speed arc available, optimal duration
            hitPath = Math.sqrt((b - discRoot) * 2 / gSquared);
        }

        // Convert from time-to-hit to a launch velocity
        return subVector(divVector(playerDirection, hitPath as Vector), (mulVector(vGravity, hitPath / 2 as Vector)));
    }
}

class ThrowCatchingState extends ThrowBaseState {
    private catchCompleted: boolean;
    private catchWaitTime: number;

    // How long to wait before laughing at you for failing to catch it
    private readonly catchMockTimeoutSeconds: number = 3;
    // How long to wait for player to catch it
    private readonly catchTimeoutSeconds: number = 5;

    public constructor(parentState: ThrowingState, liz: Elizabeth) {
        super(ThrowingStateName.Catching, parentState, liz);
        this.catchCompleted = false;
        this.catchWaitTime = 0;
    }

    public enter(): void {
        this.catchCompleted = false;
        this.catchWaitTime = 0;
    }

    public update(delta: number): void {
        const entity = this.liz.getEntity();
        if (entity.GetSequence() === "standing_toss" && entity.IsSequenceFinished()) {
            this.liz.getEntity().ResetSequence("standing_idle");
        }

        this.catchWaitTime += delta;
        if (this.catchWaitTime > this.catchTimeoutSeconds) {
            this.cancelThrow();
        }
    }

    public onObjectCaught(event: ObjectCaughtEvent) {
        const entID = event.entID;
        if (entID === -1 || entID !== this.getThrowObjectEntID()) {
            return;
        }

        if (this.catchWaitTime > this.catchMockTimeoutSeconds) {
            const clip = getClipByName("liz_clip_chirps_well_the_mans_got_an_ego");
            this.liz.getSpeech().queueClip(clip!);
        } else {
            EmitSoundOnClient("coin_catch", event.player);

            const clip = getSpeechClip(LizSpeechTag.CatchMoney, null, null);
            this.liz.getSpeech().queueClip(clip!);
        }

        this.catchCompleted = true;
    }

    public isCompleted(): boolean {
        return this.catchCompleted;
    }
}

class ThrowCanceledState extends ThrowBaseState {
    private waitTimer: Timer;

    public constructor(parentState: ThrowingState, liz: Elizabeth) {
        super(ThrowingStateName.Canceled, parentState, liz);
        this.waitTimer = new Timer(2);
    }

    public enter() {
        this.waitTimer.reset();

        // Drop the object if it's still in her hand
        const throwObject = this.getThrowObject();
        if (throwObject !== null) {
            throwObject.SetParent(null, "");
            this.setThrowObject(null);
            this.setThrowObjectEntID(-1);
        }

        // You stole the object before she could throw it, or failed to catch it
        const clip = getSpeechClip(LizSpeechTag.Oh, LizSpeechSentiment.Dislike, null);
        this.liz.getSpeech().playClip(clip!);
    }

    public update(delta: number) {
        this.waitTimer.tick(delta);
    }

    public isCompleted(): boolean {
        return this.waitTimer.isDone();
    }
}

export default class ThrowingState extends LizState {
    private throwObject: CBaseEntity | null;
    private throwObjectEntID: number;
    private throwCanceled: boolean;
    private throwCompleted: boolean;

    private throwStateManager: LizStateManager;

    constructor(liz: Elizabeth) {
        super(LizStateName.Throwing, liz);
        this.throwObject = null;
        this.throwObjectEntID = -1;
        this.throwCanceled = false;
        this.throwCompleted = false;

        this.throwStateManager = new LizStateManager("ThrowingState");
        this.throwStateManager.addState(new ThrowWaitingState(this, liz));
        this.throwStateManager.addState(new ThrowThrowingState(this, liz));
        this.throwStateManager.addState(new ThrowCatchingState(this, liz));
        this.throwStateManager.addState(new ThrowCanceledState(this, liz));
    }

    public enter(): void {
        this.throwObject = null;
        this.throwObjectEntID = -1;
        this.throwCanceled = false;
        this.throwCompleted = false;

        this.throwStateManager.begin(ThrowingStateName.Waiting);
    }

    public exit(): void {
        this.throwStateManager.end();

        // Possible early exit, drop it like it's hot
        if (this.throwObject !== null) {
            this.throwObject.SetParent(null, "");
            this.throwObject = null;
            this.throwObjectEntID = -1;
        }
    }

    public update(delta: number): void {
        const state = this.throwStateManager.getCurrentState()!;
        const stateName = state.getStateName();
        const stateCompleted = state.isCompleted();

        if (this.throwCanceled && stateName !== ThrowingStateName.Canceled) {
            this.throwStateManager.setState(ThrowingStateName.Canceled);
        }

        if (stateName === ThrowingStateName.Waiting && stateCompleted) {
            this.throwStateManager.setState(ThrowingStateName.Throwing);
        } else if (stateName === ThrowingStateName.Throwing && stateCompleted) {
            this.throwStateManager.setState(ThrowingStateName.Catching);
        } else if (stateName === ThrowingStateName.Catching && stateCompleted) {
            this.throwCompleted = true;
        } else if (stateName === ThrowingStateName.Canceled && stateCompleted) {
            this.throwCompleted = true;
        }

        this.throwStateManager.update(delta);
    }

    public isCompleted(): boolean {
        return this.throwCompleted;
    }

    public cancelThrow() {
        this.throwCanceled = true;
    }

    public onPlayerReady(event: PlayerReadyEvent) {
        this.throwStateManager.onPlayerReady(event);
    }

    public onObjectCaught(event: ObjectCaughtEvent) {
        this.throwStateManager.onObjectCaught(event);
    }

    public getThrowObject(): CBaseEntity | null {
        return this.throwObject;
    }

    public setThrowObject(throwObject: CBaseEntity | null) {
        this.throwObject = throwObject;
    }

    public getThrowObjectEntID(): number {
        return this.throwObjectEntID;
    }

    public setThrowObjectEntID(throwObjectEntID: number) {
        this.throwObjectEntID = throwObjectEntID;
    }
}
