import {LizStateName, LizState} from "./LizState";
import Elizabeth from "../Elizabeth";
import {PlayerReadyEvent} from "../lizEvents";

export default class FollowingState extends LizState {
    private lastPlayerPosition: Vector;
    private readonly minDistanceToMove = 10;

    public constructor(liz: Elizabeth) {
        super(LizStateName.Following, liz);
        this.lastPlayerPosition = this.liz.getPosition();
    }

    public enter(): void {
        this.goToPlayer();
    }

    public exit(): void {
        this.liz.getMove().stop();
    }

    public update(delta: number): void {
        const playerPos = this.liz.getPlayer().GetAbsOrigin();
        if (VectorDistance(playerPos, this.lastPlayerPosition) < this.minDistanceToMove) {
            return;
        }

        this.goToPlayer();
    }

    private goToPlayer(): void {
        const playerPos = this.liz.getPlayer().GetAbsOrigin();
        this.liz.getMove().moveTo(playerPos);
        this.lastPlayerPosition = playerPos;
    }

    public onPlayerReady(event: PlayerReadyEvent) {
        this.goToPlayer();
    }

    public isCompleted(): boolean {
        return VectorDistance(this.liz.getPlayer().GetAbsOrigin(), this.liz.getPosition()) < 100;
    }
}
