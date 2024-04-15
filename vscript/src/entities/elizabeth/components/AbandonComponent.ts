import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";
import Timer from "../../../utils/Timer";
import {LineTrace} from "../../../utils/Trace";

/**
 * Component that tracks the player's abandonment of Elizabeth
 */
export default class AbandonComponent extends LizComponent {
    private readonly maxAbandonSeconds = 3;
    private readonly maxAbandonDistance = 500;
    private abandonTimer: Timer;

    public constructor(liz: Elizabeth) {
        super(liz);
        this.abandonTimer = new Timer(this.maxAbandonSeconds);
    }

    public update(delta: number) {
        const distanceToPlayer = VectorDistance(this.liz.getPlayer().GetAbsOrigin(), this.liz.getPosition());
        if (distanceToPlayer > this.maxAbandonDistance && !this.liz.isPlayerLooking()) {
            this.abandonTimer.tick(delta);
        } else {
            this.abandonTimer.resetTime();
        }

        if (this.abandonTimer.isDone()) {
            this.abandonTimer.reset();
            this.liz.getMove().stop();
            this.liz.getEntity().SetAbsOrigin(this.getTeleportPosition());
            this.liz.onAbandon();
        }
    }

    private getTeleportPosition(): Vector {
        const player = this.liz.getPlayer();
        const hmd = player.GetHMDAvatar()!;
        const playerPos = player.GetAbsOrigin();
        const playerForward = hmd.GetForwardVector();
        const playerRight = hmd.GetRightVector();

        const offsetDistance = 100;
        const randomOffsetRange = 50;
        const randomOffsetX = (Math.random() * 2 - 1) * randomOffsetRange;

        let offset = Vector(0, 0, 0);
        offset = addVector(offset, mulVector(playerForward, -offsetDistance as Vector));
        offset = addVector(offset, mulVector(playerRight, randomOffsetX as Vector));
        offset.z = hmd.GetAbsOrigin().z - playerPos.z;

        const teleportPosition = addVector(playerPos, offset);

        const floorTrace = new LineTrace(teleportPosition, subVector(teleportPosition, Vector(0, 0, 1000)));
        if (floorTrace.run().hasHit()) {
            return floorTrace.run().getHitPosition();
        }

        return teleportPosition;
    }
}
