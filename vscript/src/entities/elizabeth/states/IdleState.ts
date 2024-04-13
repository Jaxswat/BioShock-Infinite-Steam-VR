import {LizStateName, LizState} from "./LizState";
import Elizabeth from "../Elizabeth";
import Timer from "../../../utils/Timer";

export default class IdleState extends LizState {

    private stateSwitchTimer: Timer;

    public constructor(liz: Elizabeth) {
        super(LizStateName.Idle, liz);
        this.stateSwitchTimer = new Timer(5);
    }

    public enter(): void {
        this.liz.getEntity().ResetSequence("standing_idle");
        this.stateSwitchTimer.reset();
    }

    public exit(): void {
    }

    public update(delta: number): void {
        this.stateSwitchTimer.tick(delta);
    }

    public isCompleted(): boolean {
        return this.stateSwitchTimer.isDone();
    }
}
