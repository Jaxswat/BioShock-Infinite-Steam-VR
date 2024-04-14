import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";
import Timer from "../../../utils/Timer";
import {LineTrace} from "../../../utils/Trace";

/**
 * Handles the very expensive calculation of seeing if the player is looking at Elizabeth.
 * Caches the result for a short time so that it doesn't have to be recalculated every tick.
 */
export default class PlayerLookingComponent extends LizComponent {
    private readonly playerFovDegrees: number = 120;
    private readonly playerMaxDistanceLineOfSight: number = 1500;
    private readonly lookingCalculationIntervalSeconds: number = 0.25;

    private looking: boolean;
    private lookingCalculated: boolean;
    private lookingCalculationTimer: Timer;

    public constructor(liz: Elizabeth) {
        super(liz);
        this.looking = false;
        this.lookingCalculated = false;
        this.lookingCalculationTimer = new Timer(this.lookingCalculationIntervalSeconds);
    }

    public update(delta: number): void {
        this.lookingCalculationTimer.tick(delta);

        if (this.lookingCalculationTimer.isDone()) {
            this.lookingCalculationTimer.reset();
            this.lookingCalculated = false;
        }
    }

    public isLooking(): boolean {
        if (!this.lookingCalculated) {
            this.looking = this.calculatePlayerLooking();
            this.lookingCalculated = true;
        }

        return this.looking;
    }

    /**
     * Calculates if the player is looking at Elizabeth.
     * Computed in order of the least complexity: distance, fov, line of sight trace.
     */
    private calculatePlayerLooking(): boolean {
        const player = this.liz.getPlayer();
        const hmd = player.GetHMDAvatar()!;
        const playerPos = hmd.GetAbsOrigin();
        const playerForward = hmd.GetForwardVector();

        const lizPos = this.liz.getHeadPosition();
        const lizDirection = subVector(lizPos, playerPos);
        const lizDistance = lizDirection.Length();

        // LOS distance check
        if (lizDistance > this.playerMaxDistanceLineOfSight) {
            return false;
        }

        const lizDirectionNormalized = lizDirection.Normalized();

        const dotProduct = playerForward.Dot(lizDirectionNormalized);
        const angleInRadians = Math.acos(dotProduct);
        const angleInDegrees = (angleInRadians * 180) / Math.PI;

        // FOV check
        if (angleInDegrees > this.playerFovDegrees / 2) {
            return false;
        }

        const trace = new LineTrace(playerPos, lizPos);
        trace.setIgnoreEntity(player);

        // Trace check
        const traceResult = trace.run();
        const hasObstacle = traceResult.getFraction() < 0.9;
        return !hasObstacle;
    }
}
