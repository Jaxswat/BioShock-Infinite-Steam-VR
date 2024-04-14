import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";
import Timer from "../../../utils/Timer";
import {LineTrace} from "../../../utils/Trace";

/**
 * Component that tracks the player's abandonment of Elizabeth
 */
export default class AbandonComponent extends LizComponent {
    private abandonTimer: Timer;
    private readonly maxAbandonDistance = 500;
    private readonly maxAbandonSeconds = 3;

    public constructor(liz: Elizabeth) {
        super(liz);
        this.abandonTimer = new Timer(this.maxAbandonSeconds);
    }

    public update(delta: number) {
        const entity = this.liz.getEntity();
        const player = this.liz.getPlayer();
        if (!player) {
            return;
        }

        const lizPos = entity.GetAbsOrigin();

        const distanceToPlayer = VectorDistance(player.GetAbsOrigin(), lizPos);
        if (distanceToPlayer > this.maxAbandonDistance) {
            this.abandonTimer.tick(delta);
            // TODO: should the timer reset if the player comes back?
        }

        if (this.abandonTimer.isDone()) {
            this.abandonTimer.reset();
            entity.SetAbsOrigin(this.getTeleportPosition());
            print("TEELEPORTIN TO PLAYER");
        }
    }

    private getTeleportPosition(): Vector {
        const player = this.liz.getPlayer();
        const hmd = player.GetHMDAvatar()!;
        const playerPos = player.GetAbsOrigin();
        const playerForward = hmd.GetForwardVector();
        const playerRight = hmd.GetRightVector();
        const playerUp = hmd.GetUpVector();

        const offsetDistance = 100;
        const randomOffsetRange = 50;
        const randomOffsetX = (Math.random() * 2 - 1) * randomOffsetRange;
        const randomOffsetY = (Math.random() * 2 - 1) * randomOffsetRange;

        let offset = Vector(0, 0, 0);
        offset = addVector(offset, mulVector(playerForward, -offsetDistance as Vector));
        offset = addVector(offset, mulVector(playerRight, randomOffsetX as Vector));
        offset = addVector(offset, mulVector(playerUp, randomOffsetY as Vector));
        offset.z = hmd.GetAbsOrigin().z - playerPos.z;

        const teleportPosition = addVector(playerPos, offset);

        const traceStart = teleportPosition;
        const traceEnd = addVector(traceStart, subVector(traceStart, Vector(0, 0, offset.z)));
        const trace = new LineTrace(traceStart, traceEnd);
        trace.setIgnoreEntity(this.liz.getEntity());
        const traceResult = trace.run();

        if (traceResult.getFraction() < 1 && traceResult.getFraction() > 0.1) {
            return teleportPosition;
        } else {
            // invalid, retry. TODO: max retry?
            return this.getTeleportPosition();
        }
    }
}
