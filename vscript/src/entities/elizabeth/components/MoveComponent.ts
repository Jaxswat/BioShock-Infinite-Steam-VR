import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";
import {LineTrace} from "../../../utils/Trace";
import {VTunnel, VTunnelMessage} from "../../../vconsole_tunnel/VTunnel";
import {TheNavMesh} from "../../../navigation/NavMesh";
import {DebugDrawNavArea, findAreaForPosition, findPath} from "../../../navigation/PathFinding";

export default class MoveComponent extends LizComponent {
    private readonly stepSpeed: number = 5;
    private readonly walkSpeed: number = 20;
    private readonly runSpeed: number = 70;
    private readonly speedLerpFactor: number = 10;

    private targetPosition: Vector;
    private currentSpeed: number;
    private targetSpeed: number;
    private lastYaw: number; // Yee haw?

    private path: Vector[];
    private currentPathIndex: number;

    public constructor(liz: Elizabeth) {
        super(liz);
        this.targetPosition = this.liz.getPosition();
        this.currentSpeed = 0;
        this.targetSpeed = 0;
        this.lastYaw = 0;

        this.path = [];
        this.currentPathIndex = 0;

        VTunnel.onMessage('liz_move_to', (msg: VTunnelMessage) => {
            const position = msg.indexPartDataAsVector(0);
            DebugDrawSphere(position, Vector(0, 0, 255), 1, 5, false, 1.4);

            // const startArea = findAreaForPosition(position, TheNavMesh);
            // if (startArea) {
            //     DebugDrawNavArea(startArea, TheNavMesh, 5);
            // }

            this.moveTo(position);
        });
    }

    public updatePose(delta: number): void {
        const entity = this.liz.getEntity();
        const currentPos = this.liz.getPosition();

        if (this.currentPathIndex < this.path.length) {
            const targetPos = this.path[this.currentPathIndex];
            const posSub = subVector(targetPos, currentPos);
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
                this.currentPathIndex++;
                if (this.currentPathIndex < this.path.length) {
                    this.targetPosition = this.path[this.currentPathIndex];
                } else {
                    this.stop();
                }
            } else {
                const targetYaw = -Rad2Deg(Math.atan2(direction.x, direction.y)) + 90;
                const currentYaw = Lerp(10 * delta, entity.GetAngles().y, targetYaw);
                entity.SetAbsAngles(0, currentYaw, 0);
                this.lastYaw = currentYaw;
            }
        }
    }

    public moveTo(position: Vector): void {
        const startPos = this.liz.getPosition();
        // const path = findPath(startPos, position, NAV_MESH);

        // if (path.length > 0) {
        //     // for (let i = 1; i < path.length - 1 ; i++) {
        //     //     const point = path[i];
        //     //     DebugDrawSphere(point, Vector(0, 255, 255), 1, 5, false, 5);
        //     // }
        //
        //     this.path = path;
        //     this.currentPathIndex = 0;
        //     this.targetPosition = path[0];
        //     this.targetSpeed = this.runSpeed;
        // } else {
        //     print("No valid path found.");
        // }
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
