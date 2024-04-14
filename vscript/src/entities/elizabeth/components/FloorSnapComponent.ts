import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";
import {LineTrace, TraceResult} from "../../../utils/Trace";

/**
 * Component that snaps Elizabeth's position to the floor so that she isn't floatin' around.
 *
 * Component order may matter for this since an entity's position can only be set once per tick.
 */
export default class FloorSnapComponent extends LizComponent {
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
            this.enabled = false; // Once snapped, turn off snapping until re-enabled externally
        }
    }

    private getFloorPosition(): TraceResult {
        const lizEntity = this.liz.getEntity();
        const startVector = lizEntity.GetCenter();
        const trace = new LineTrace(startVector, addVector(startVector, Vector(0, 0, -1000)));
        trace.setIgnoreEntity(lizEntity);

        return trace.run();
    }
}
