import {LizState, LizStateName} from "./LizState";
import Elizabeth from "../Elizabeth";
import Timer from "../../../utils/Timer";
import {getSpeechClip, LizSpeechTag} from "../lizSpeech";

export default class IdleState extends LizState {
    private stateSwitchTimer: Timer;
    private lookTimer: Timer;
    private greetingTimer: Timer;
    private playedGretting: boolean;

    public constructor(liz: Elizabeth) {
        super(LizStateName.Idle, liz);
        this.stateSwitchTimer = new Timer(5);
        this.lookTimer = new Timer(0.3);
        this.greetingTimer = new Timer(2);
        this.playedGretting = false;
    }

    public enter(): void {
        this.liz.getEntity().ResetSequence("standing_idle");
        this.stateSwitchTimer.reset();

        this.liz.facePlayer();
        this.liz.getLookAt().setTarget(this.liz.getPlayer().GetHMDAvatar()!.GetAbsOrigin());
        this.liz.getLookAt().setEnabled(true);
    }

    public exit(): void {
        this.liz.getLookAt().setEnabled(false);
    }

    public update(delta: number): void {
        this.stateSwitchTimer.tick(delta);
        this.lookTimer.tick(delta);

        if (this.lookTimer.isDone()) {
            this.lookTimer.reset();
            this.liz.getLookAt().setTarget(this.liz.getPlayer().GetHMDAvatar()!.GetAbsOrigin());
        }

        if (!this.playedGretting) {
            this.greetingTimer.tick(delta);

            if (this.greetingTimer.isDone()) {
                this.playedGretting = true;
                const clip = getSpeechClip(LizSpeechTag.Greeting, null, null);
                this.liz.getSpeech().queueClip(clip!);
            }
        }
    }

    public isCompleted(): boolean {
        return this.stateSwitchTimer.isDone();
    }
}
