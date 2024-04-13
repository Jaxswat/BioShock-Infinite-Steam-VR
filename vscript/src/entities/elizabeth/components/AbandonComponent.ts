import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";
import Timer from "../../../utils/Timer";

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
            this.abandonTimer.reset()
            entity.SetAbsOrigin(player.GetHMDAvatar()!.GetAbsOrigin());
            print("TEELEPORTIN TO PLAYER");
        }
    }
}
