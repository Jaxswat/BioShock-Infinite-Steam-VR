import {BoxTrace, LineTrace, TraceResult} from "../Trace";
import Timer from "../Timer";

export default class NavGenerator {
    private done: boolean;
    private startPoint: Vector;
    private genIterator: number;
    private genPosition: Vector;
    private trace: LineTrace;
    private traceResult: TraceResult | null;
    private genTimer: Timer;
    private validPoints: Vector[]; // Valid.

    private genX: number;
    private genY: number;
    private lastZ: number;

    private readonly genSize: number = 100;
    private readonly genOffset: number = 50;
    private readonly groundOffset: number = 30;

    public constructor(startPoint: Vector) {
        this.done = false;
        this.startPoint = Vector(Math.floor(startPoint.x), Math.floor(startPoint.y), Math.floor(startPoint.z));
        this.genIterator = 0;
        this.genPosition = startPoint;
        this.trace = new LineTrace(Vector(), Vector());
        this.traceResult = null;
        this.genTimer = new Timer(0);
        this.genX = 0;
        this.genY = 0;
        this.lastZ = startPoint.z;
        this.validPoints = [];
    }

    /**
     * Run generation logic in steps to avoid blocking the game thread.
     */
    public tickGeneration(delta: number) {
        if (this.done) {
            return;
        } else if (this.genIterator === 0) {
            print("Generating nav mesh.");
        }

        this.genTimer.tick(delta);

        this.resetTrace();
        this.traceResult = this.trace.run();
        if (this.traceResult.hasHit()) {
            this.lastZ = this.traceResult.getHitPosition().z + this.groundOffset;
        }
        this.genPosition = Vector(this.startPoint.x + (this.genX * this.genOffset), this.startPoint.y + (this.genY * this.genOffset), this.lastZ);

        const isValid = this.checkPointValid();
        if (isValid) {
            DebugDrawSphere(this.genPosition, Vector(0, 255, 0), 1, 5, false, 600);
            // this.validPoints.push(this.genPosition);
        } else {
            DebugDrawSphere(this.genPosition, Vector(255, 0, 0), 1, 5, false, 600);
        }

        if (this.genX >= this.genSize) {
            this.genX = 0;
            this.genY++;
        } else {
            this.genX++;
        }

        if (this.genY >= this.genSize) {
            this.done = true;
        }

        this.genIterator++;
        if (this.done) {
            print("Nav mesh generation done. Points:", this.genIterator, "Time:", this.genTimer.getTime(), "seconds");
        }
    }

    private resetTrace() {
        this.trace.setStartPosition(this.genPosition);
        this.trace.setEndPosition(subVector(this.genPosition, Vector(0, 0, 1000)));
    }

    private readonly spaceSize = 32;
    private readonly spaceMin = Vector(-9.998732, -18.859135, -0.057327); // Liz size
    private readonly spaceMax = Vector(9.537852, 18.859135, 66.952141);
    private checkPointValid() {
        const upTrace = new BoxTrace(this.genPosition, addVector(this.genPosition, Vector(0, 0, this.spaceSize)), this.spaceMin, this.spaceMax);
        const forwardTrace = new BoxTrace(this.genPosition, addVector(this.genPosition, Vector(this.spaceSize, 0, 0)), this.spaceMin, this.spaceMax);
        const backTrace = new BoxTrace(this.genPosition, addVector(this.genPosition, Vector(-this.spaceSize, 0, 0)), this.spaceMin, this.spaceMax);
        const leftTrace = new BoxTrace(this.genPosition, addVector(this.genPosition, Vector(0, this.spaceSize, 0)), this.spaceMin, this.spaceMax);
        const rightTrace = new BoxTrace(this.genPosition, addVector(this.genPosition, Vector(0, -this.spaceSize, 0)), this.spaceMin, this.spaceMax);

        if (upTrace.run().hasHit() || forwardTrace.run().hasHit() || backTrace.run().hasHit() || leftTrace.run().hasHit() || rightTrace.run().hasHit()) {
            return false;
        }

        return true;
    }
}
