import {LizState} from "./LizState";
import { LizObjectCaughtEvent, LizPlayerReadyEvent } from "../../../events/BioshockEvents";

export class LizStateManager {
    private managerName: string;
    private states: { [key: string]: LizState };
    private currentState: LizState | null;

    public constructor(managerName?: string) {
        this.managerName = managerName || "Unknown";
        this.states = {};
        this.currentState = null;
    }

    public addState(state: LizState) {
        this.states[state.getStateName()] = state;
    }

    public getState(stateName: string): LizState {
        return this.states[stateName];
    }

    public isCurrentState(stateName: string): boolean {
        return this.currentState !== null && this.currentState.getStateName() === stateName;
    }

    public getCurrentState(): LizState | null {
        return this.currentState;
    }

    public begin(initialStateName: string) {
        this.setState(initialStateName);
    }

    public end() {
        if (this.currentState !== null) {
            this.currentState.exit();
        }

        this.currentState = null;
    }

    public setState(stateName: string) {
        if (this.currentState !== null && this.currentState.getStateName() !== stateName) {
            this.currentState.exit();
            // print("[STATE MANAGER / " + this.managerName + "] EXITING STATE: " + this.currentState.getStateName());
        }

        this.currentState = this.getState(stateName);
        print("[STATE MANAGER / " + this.managerName + "] ENTERING STATE: " + this.currentState.getStateName());
        this.currentState.enter();
    }

    public update(delta: number) {
        if (this.currentState === null) {
            return;
        }

        this.currentState.update(delta);
    }

    public onPlayerReady(event: LizPlayerReadyEvent) {
        if (this.currentState === null) {
            return;
        }

        this.currentState.onPlayerReady(event);
    }

    public onObjectCaught(event: LizObjectCaughtEvent) {
        if (this.currentState === null) {
            return;
        }

        this.currentState.onObjectCaught(event);
    }
}
