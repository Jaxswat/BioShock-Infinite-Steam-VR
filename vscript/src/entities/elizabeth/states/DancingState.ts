import {LizStateName, LizState} from "./LizState";
import Elizabeth from "../Elizabeth";

export default class DancingState extends LizState {
    public constructor(liz: Elizabeth) {
        super(LizStateName.Dancing, liz);
    }

    public enter(): void {
        this.liz.getEntity().ResetSequence("dancing");
        this.liz.getEmotion().setSmile(1.0);
    }

    public exit(): void {
        // Do nothing
    }

    public update(delta: number): void {
        // Do nothing
    }
}
