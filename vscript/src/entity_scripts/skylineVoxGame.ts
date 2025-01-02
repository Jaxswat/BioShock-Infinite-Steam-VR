import TickDelta from "../utils/TickDelta";
import Timer from "../utils/Timer";
import BioshockEntity from "../entities/BioshockEntity";
import BioshockEventManager from "../events/BioshockEventManager";
import { BioshockEvent, FairGameTargetDestroyedEvent } from "../events/BioshockEvents";

/**
 * Scoreboard is composed of two decagons, one for left/right digits.
 * This class manages the score and updates the rotation for these entities.
 */
class Scoreboard {
    private static readonly degreesPerDigit: number = 360 / 10; // Decagon
    private static readonly rotationSpeed: number = 36;

    private scoreRotorLeftEntity: CBaseEntity;
    private scoreRotorRightEntity: CBaseEntity;
    private targetAngleLeft: number;
    private targetAngleRight: number;
    private score: number;

    public constructor(scoreRotorLeftEntity: CBaseEntity, scoreRotorRightEntity: CBaseEntity) {
        this.scoreRotorLeftEntity = scoreRotorLeftEntity;
        this.scoreRotorRightEntity = scoreRotorRightEntity;
        this.targetAngleLeft = 0;
        this.targetAngleRight = 0;
        this.score = 0;
    }

    public getScore(): number {
        return this.score;
    }

    public addScore(score: number = 1): void {
        this.score += score;
        this.updateScoreDigits();
    }

    public setScore(score: number): void {
        this.score = score;
        this.updateScoreDigits();
    }

    private updateScoreDigits(): void {
        const score = this.score % 100;
        const scoreRight = score % 10;
        const scoreLeft = (score - scoreRight) / 10;

        this.targetAngleLeft = scoreLeft * Scoreboard.degreesPerDigit;
        this.targetAngleRight = scoreRight * Scoreboard.degreesPerDigit;
    }

    public updatePose(delta: number): void {
        const currentAngleLeft = this.scoreRotorLeftEntity.GetLocalAngles().z;
        const currentAngleRight = this.scoreRotorRightEntity.GetLocalAngles().z;

        const angleLeft = Lerp(Scoreboard.rotationSpeed * delta, currentAngleLeft, this.targetAngleLeft);
        const angleRight = Lerp(Scoreboard.rotationSpeed * delta, currentAngleRight, this.targetAngleRight);

        this.scoreRotorLeftEntity.SetLocalAngles(0, 0, angleLeft);
        this.scoreRotorRightEntity.SetLocalAngles(0, 0, angleRight);
    }
}

/**
 * GameTimer just controls a big fat arrow that rotates around a circle.
 * (representing the time left in the game)
 */
class GameTimer {
    private static readonly rotationSpeed: number = 10;
    private arrowEntity: CBaseEntity;
    private timer: Timer;
    private targetAngle: number;

    public constructor(arrowEntity: CBaseEntity) {
        this.arrowEntity = arrowEntity;
        this.timer = new Timer(0);
        this.targetAngle = 0;
    }

    public reset(totalTime: number): void {
        this.timer.setWaitSeconds(totalTime);
        this.timer.reset();
        this.targetAngle = 0;
        this.arrowEntity.SetLocalAngles(0, -90, 0);
    }

    public update(delta: number): void {
        this.timer.tick(delta);
        this.targetAngle = this.timer.getProgress() * 360;
    }

    public updatePose(delta: number): void {
        const angle = Lerp(GameTimer.rotationSpeed * delta, this.arrowEntity.GetLocalAngles().z, this.targetAngle);
        this.arrowEntity.SetLocalAngles(0, -90, angle);
    }

    public isDone(): boolean {
        return this.timer.isDone();
    }
}

class VoxTarget extends BioshockEntity {
    public static readonly models: string[] = [
        "models/fair_booth_a/booth_cutouts_skyline_vox_1.vmdl",
        "models/fair_booth_a/booth_cutouts_skyline_vox_2.vmdl",
        "models/fair_booth_a/booth_cutouts_skyline_vox_3.vmdl",
        "models/fair_booth_a/booth_cutouts_skyline_vox_4.vmdl",
        "models/fair_booth_a/booth_cutouts_skyline_vox_5.vmdl",
    ];
    private id: number;
    private startPositon: Vector;
    private endPosition: Vector;
    private progress: number;
    private speed: number;

    private onPathComplete: (this: void, self: VoxTarget) => void;

    public constructor(id: number, startPosition: Vector, endPosition: Vector, speed: number, onPathComplete: (self: VoxTarget) => void) {
        const spawnInfo: EntitySpawnInfo & any = {
            model: VoxTarget.models[Math.floor(Math.random() * VoxTarget.models.length)],
            origin: startPosition,
            angles: QAngle(0, 90, 0),
            scale: 0.3,
            solid: 6, // VPhysics
            vscripts: "entity_scripts/skylineVoxTarget",
            ScriptedMovement: 1
        }

        const entity = SpawnEntityFromTableSynchronous("prop_dynamic", spawnInfo);
        entity.Attribute_SetIntValue("fair_game_id", 0);
        entity.Attribute_SetIntValue("fair_game_ent_id", id);
        entity.SetHealth(5);
        super(entity);

        this.id = id;
        this.startPositon = startPosition;
        this.endPosition = endPosition;
        this.progress = 0;
        this.speed = speed;

        this.onPathComplete = onPathComplete;
    }

    public updatePose(delta: number): void {
        if (this.progress >= 1) {
            return;
        }

        this.progress += this.speed * delta;
        const nextPosition = VectorLerp(this.progress, this.startPositon, this.endPosition);
        this.getEntity().SetAbsOrigin(nextPosition);

        if (this.progress >= 1) {
            this.onPathComplete(this);
        }
    }

    public getID(): number {
        return this.id;
    }

    public getEntity(): CBaseEntity {
        return this.entity;
    }
}

class SkylineVoxGame {
    private static readonly gameDurationSeconds: number = 60;
    private gameTimer: GameTimer;
    private scoreboard: Scoreboard;
    private isActive: boolean;
    private railPositions: [Vector, Vector][];
    private targetIDSequence: number;
    private targets: VoxTarget[];
    private targetSpawnTimer: Timer;

    public constructor(gameTimer: GameTimer, scoreboard: Scoreboard) {
        this.gameTimer = gameTimer;
        this.scoreboard = scoreboard;
        this.isActive = false;

        this.railPositions = [];
        this.targetIDSequence = 0;
        this.targets = [];
        this.targetSpawnTimer = new Timer(1);

        BioshockEventManager.on(BioshockEvent.FairGameTargetDestroyed, this.onTargetDestroyed, this);
    }

    private reset(): void {
        this.gameTimer.reset(SkylineVoxGame.gameDurationSeconds);
        this.scoreboard.setScore(0);
    }

    public start(): void {
        this.reset();
        this.isActive = true;
    }

    public update(delta: number): void {
        if (!this.isActive) {
            return;
        } else if (this.gameTimer.isDone()) {
            this.isActive = false;
            this.start(); // Temporary, just loop game
            return;
        }

        this.gameTimer.update(delta);

        this.targetSpawnTimer.tick(delta);
        if (this.targetSpawnTimer.isDone()) {
            const rail = this.getRandomRail();
            const id = ++this.targetIDSequence;
            const target = new VoxTarget(id, rail[0], rail[1], Math.max(Math.min(Math.random() * 0.5, 0.5), 0.2), (t) => this.onTargetPathComplete(t));
            this.targets.push(target);
            this.targetSpawnTimer.reset();
        }
    }

    public updatePose(delta: number): void {
        if (!this.isActive) {
            return;
        }

        this.gameTimer.updatePose(delta);
        this.scoreboard.updatePose(delta);
        for (const target of this.targets) {
            target.updatePose(delta);
        }
    }

    private onTargetPathComplete(target: VoxTarget): void {
        const targetIndex = this.targets.findIndex(t => t.getID() === target.getID());
        const [removedTarget] = this.targets.splice(targetIndex, 1);
        UTIL_Remove(removedTarget.getEntity());
    }

    private onTargetDestroyed(e: FairGameTargetDestroyedEvent): void {
        const targetIndex = this.targets.findIndex(t => t.getID() === e.entID);
        if (targetIndex === -1) {
            return;
        }

        const [removedTarget] = this.targets.splice(targetIndex, 1);
        UTIL_Remove(removedTarget.getEntity());

        this.scoreboard.addScore(1);
    }

    public addRailPosition(start: Vector, end: Vector): void {
        this.railPositions.push([start, end]);
    }

    private getRandomRail(): [Vector, Vector] {
        const rail = this.railPositions[Math.floor(Math.random() * this.railPositions.length)];

        if (Math.random() < 0.5) {
            return [rail[1], rail[0]];
        } else {
            return [rail[0], rail[1]];
        }
    }
}

/////////////////////////
// Actual game script
/////////////////////////

export const __BundleAsGameScript = null;
const logicUpdateRate = 1 / 15; // 15 tps. Regular think logic can be slower.
const poseUpdateRate = 1 / 60; // 60 tps. Higher because pose updates need to be smooth.

let skylineVoxGame: SkylineVoxGame;
let tickDelta: TickDelta;
let poseDelta: TickDelta;

export function Precache(context: any) {
    VoxTarget.models.forEach(model => PrecacheModel(model, context));
}

export function Activate(this: void) {
    const arrowEntity = Entities.FindByName(null, "skyline_vox_game_timer_arrow")!;
    const gameTimer = new GameTimer(arrowEntity);
    const scoreRotorLeftEntity = Entities.FindByName(null, "skyline_vox_game_score_rotor_left")!;
    const scoreRotorRightEntity = Entities.FindByName(null, "skyline_vox_game_score_rotor_right")!;
    const scoreboard = new Scoreboard(scoreRotorLeftEntity, scoreRotorRightEntity);
    skylineVoxGame = new SkylineVoxGame(gameTimer, scoreboard);

    const rail1Start = Entities.FindByName(null, "skyline_vox_rail_1_start")!;
    const rail1End = Entities.FindByName(null, "skyline_vox_rail_1_end")!;
    const rail2Start = Entities.FindByName(null, "skyline_vox_rail_2_start")!;
    const rail2End = Entities.FindByName(null, "skyline_vox_rail_2_end")!;
    const rail3Start = Entities.FindByName(null, "skyline_vox_rail_3_start")!;
    const rail3End = Entities.FindByName(null, "skyline_vox_rail_3_end")!;
    skylineVoxGame.addRailPosition(rail1Start.GetAbsOrigin(), rail1End.GetAbsOrigin());
    skylineVoxGame.addRailPosition(rail2Start.GetAbsOrigin(), rail2End.GetAbsOrigin());
    skylineVoxGame.addRailPosition(rail3Start.GetAbsOrigin(), rail3End.GetAbsOrigin());

    skylineVoxGame.start();

    tickDelta = new TickDelta();
    poseDelta = new TickDelta();
    thisEntity.SetThink(ThinkLogic, "logic", logicUpdateRate);
    thisEntity.SetThink(ThinkPose, "pose", poseUpdateRate);
}

function ThinkLogic() {
    const delta = tickDelta.tick();
    skylineVoxGame.update(delta);

    return logicUpdateRate;
}

function ThinkPose() {
    const delta = poseDelta.tick();
    skylineVoxGame.updatePose(delta);

    return poseUpdateRate;
}
