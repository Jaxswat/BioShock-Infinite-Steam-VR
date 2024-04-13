import {LizStateName, LizState} from "./LizState";
import Elizabeth from "../Elizabeth";

export default class DancingState extends LizState {
    public constructor(liz: Elizabeth) {
        super(LizStateName.Dancing, liz);
    }

    public enter(): void {
        // Do nothing
    }

    public exit(): void {
        // Do nothing
    }

    public update(delta: number): void {
        // Do nothing
    }
}
