export default class Timer {
    private time: number;
    private done: boolean;
    private waitSeconds: number;

    public constructor(waitSeconds: number) {
        this.time = 0;
        this.done = false;
        this.waitSeconds = waitSeconds;
    }

    public tick(delta: number) {
        this.time += delta;

        if (!this.done && this.time >= this.waitSeconds) {
            this.done = true;
        }
    }

    public getTime(): number {
        return this.time;
    }

    public isDone(): boolean {
        return this.done;
    }

    /**
     * Resets the timer to 0 and sets done to false
     */
    public reset(){
        this.time = 0;
        this.done = false;
    }

    /**
     * Resets the timer to 0, does not reset done status
     */
    public resetTime(){
        this.time = 0;
    }

    public setWaitSeconds(waitSeconds: number){
        this.waitSeconds = waitSeconds;
    }
}
