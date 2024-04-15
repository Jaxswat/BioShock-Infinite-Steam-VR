import {LizStateName, LizState} from "./LizState";
import Elizabeth from "../Elizabeth";

export default class FollowingState extends LizState {
    private lastPlayerPosition: Vector;

    public constructor(liz: Elizabeth) {
        super(LizStateName.Following, liz);
        this.lastPlayerPosition = this.liz.getPosition();
    }

    public enter(): void {
        this.lastPlayerPosition = this.liz.getPlayer().GetAbsOrigin();
    }

    public exit(): void {
        this.liz.getMove().stop();
    }

    public update(delta: number): void {
        const playerPos = this.liz.getPlayer().GetAbsOrigin();
        if (this.lastPlayerPosition === playerPos) {
            return;
        }

        this.liz.getMove().moveTo(playerPos);
        this.lastPlayerPosition = playerPos;
    }

    public isCompleted(): boolean {
        return VectorDistance(this.liz.getPlayer().GetAbsOrigin(), this.liz.getPosition()) < 100;
    }
}
