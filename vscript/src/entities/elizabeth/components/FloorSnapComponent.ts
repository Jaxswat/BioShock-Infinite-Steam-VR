import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";

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

        const [floorPos, floorHit] = this.getFloorPosition();
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

    private getFloorPosition(): LuaMultiReturn<[pos: Vector, hit: boolean]> {
        const lizEntity = this.liz.getEntity();
        let startVector = lizEntity.GetCenter();
        let traceTable: TraceTable = {
            startpos: startVector,
            endpos: addVector(startVector, Vector(0, 0, -1000)),
            ignore: lizEntity,
            mask: 33636363 // TRACE_MASK_PLAYER_SOLID from L4D2 script API, may not be correct for Source 2.
        };

        TraceLine(traceTable)

        if (!traceTable.hit) {
            return $multi(Vector(), false);
        }

        return $multi(traceTable.pos!, traceTable.hit);
    }
}
