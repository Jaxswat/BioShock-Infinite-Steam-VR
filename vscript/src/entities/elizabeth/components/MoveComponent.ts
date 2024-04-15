import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";
import {LineTrace} from "../../../utils/Trace";

export default class MoveComponent extends LizComponent {
    private readonly stepSpeed: number = 5;
    private readonly walkSpeed: number = 20;
    private readonly runSpeed: number = 70;
    private readonly speedLerpFactor: number = 0.1;

    private targetPosition: Vector;
    private currentSpeed: number;
    private targetSpeed: number;

    public constructor(liz: Elizabeth) {
        super(liz);
        this.targetPosition = this.liz.getPosition();
        this.currentSpeed = 0;
        this.targetSpeed = 0;
    }

    public updatePose(delta: number): void {
        const entity = this.liz.getEntity();
        const currentPos = this.liz.getPosition();
        const posSub = subVector(this.targetPosition, currentPos);
        const direction = posSub.Normalized();
        direction.z = 0; // no flying bruv.
        const distance = posSub.Length();

        this.currentSpeed = Lerp(this.speedLerpFactor * delta, this.currentSpeed, this.targetSpeed);
        if (this.currentSpeed === 0) {
            return;
        }

        const speed = this.currentSpeed * delta;
        const nextPos = addVector(currentPos, mulVector(direction, speed as Vector));

        const traceStart = Vector(nextPos.x, nextPos.y, entity.GetCenter().z);
        const floorTrace = new LineTrace(traceStart, subVector(traceStart, Vector(0, 0, 1000)));
        const floorTraceResult = floorTrace.run();
        if (floorTraceResult.hasHit()) {
            nextPos.z = floorTraceResult.getHitPosition().z;
        }

        this.liz.getEntity().ResetSequence("trotting_running");
        entity.SetAbsOrigin(nextPos);
        if (distance < 10) {
            this.stop();
        } else {
            const targetYaw = Rad2Deg(Math.atan2(direction.x, direction.y));
            entity.SetAbsAngles(0, -targetYaw+90, 0);
        }
    }

    public moveTo(position: Vector): void {
        this.targetPosition = position;
        this.currentSpeed = this.runSpeed;
    }

    public stop(): void {
        this.liz.getEntity().ResetSequence("standing_idle");
        this.targetSpeed = 0;
        this.currentSpeed = 0;
    }

    public isAtTarget(): boolean {
        return VectorDistance(this.targetPosition, this.liz.getPosition()) < 10;
    }
}
