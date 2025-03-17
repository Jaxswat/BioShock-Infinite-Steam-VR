import {LizState, LizStateName} from "./LizState";
import Elizabeth from "../Elizabeth";
import Timer from "../../../utils/Timer";
import {getSpeechClip, LizSpeechTag} from "../lizSpeech";
import { LookBehavior } from "../components/LookAtComponent";

export default class IdleState extends LizState {
    private stateSwitchTimer: Timer;
    private greetingTimer: Timer;
    private playedGreeting: boolean;

    public constructor(liz: Elizabeth) {
        super(LizStateName.Idle, liz);
        this.stateSwitchTimer = new Timer(5);
        this.greetingTimer = new Timer(2);
        this.playedGreeting = false;
    }

    public enter(): void {
        this.liz.getEntity().ResetSequence("standing_idle");
        this.stateSwitchTimer.reset();

        this.liz.facePlayer();
        this.liz.getLookAt().setTargetEntity(this.liz.getPlayer().GetHMDAvatar(), LookBehavior.TRACKING);
    }

    public exit(): void {
    }

    public update(delta: number): void {
        this.stateSwitchTimer.tick(delta);

        if (!this.playedGreeting) {
            this.greetingTimer.tick(delta);

            if (this.greetingTimer.isDone()) {
                this.playedGreeting = true;
                const clip = getSpeechClip(LizSpeechTag.Greeting, null, null);
                this.liz.getSpeech().queueClip(clip!);
            }
        }
    }

    public isCompleted(): boolean {
        return this.stateSwitchTimer.isDone();
    }
}
