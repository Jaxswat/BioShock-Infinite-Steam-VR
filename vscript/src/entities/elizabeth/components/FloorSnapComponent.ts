import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";
import {LineTrace, TraceResult} from "../../../utils/Trace";

export default class FloorSnapComponent extends LizComponent {
    private enabled: boolean;

    public constructor(liz: Elizabeth, enabled: boolean) {
        super(liz);
        this.enabled = enabled;
    }

    public update(delta: number): void {
        if (!this.enabled) {
            return;
        }

        const traceResult = this.getFloorPosition();
        const floorHit = traceResult.hasHit()
        const floorPos = traceResult.getHitPosition();

        if (floorHit) {
            const lizEntity = this.liz.getEntity();
            const lizPos = lizEntity.GetAbsOrigin();
        	lizEntity.SetAbsOrigin(Vector(lizPos.x, lizPos.y, floorPos.z));
        }
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    private getFloorPosition(): TraceResult {
        const lizEntity = this.liz.getEntity();
        const startVector = lizEntity.GetCenter();
        const trace = new LineTrace(startVector, addVector(startVector, Vector(0, 0, -1000)));
        trace.setIgnoreEntity(lizEntity);

        return trace.run();
    }
}
