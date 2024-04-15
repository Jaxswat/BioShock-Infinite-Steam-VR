import {LizState, LizStateName} from "./LizState";
import Elizabeth from "../Elizabeth";
import {LizChoreoPoint, LizChoreoUtils} from "../LizChoreo";
import Timer from "../../../utils/Timer";
import {getSpeechClip, LizSpeechSentiment, LizSpeechTag} from "../speechConfig";

export default class ChoreoState extends LizState {
    private choreoPoint: LizChoreoPoint | null;
    private choreoTimer: Timer;
    private moveTimer: Timer;
    private hasReachedPoint: boolean;
    private hasStartedChoreo: boolean;
    private canceled: boolean;

    public constructor(liz: Elizabeth) {
        super(LizStateName.Choreo, liz);
        this.choreoPoint = null;
        this.choreoTimer = new Timer(0);
        this.moveTimer = new Timer(5);
        this.hasReachedPoint = false;
        this.hasStartedChoreo = false;
        this.canceled = false;
    }

    public enter(): void {
        this.hasReachedPoint = false;
        this.hasStartedChoreo = false;
        this.canceled = false;

        this.choreoPoint = LizChoreoUtils.getNearestChoreoPoint(this.liz.getPosition(), this.liz.getChoreoPoints());
        if (this.choreoPoint === null) {
            this.canceled = true;
            return;
        }

        this.moveTimer.reset();
        this.liz.getMove().moveTo(this.choreoPoint.position);

        const clip = getSpeechClip(LizSpeechTag.LookAtThis, LizSpeechSentiment.StrongLike, null);
        this.liz.getSpeech().queueClip(clip!);
    }

    public exit(): void {
    }

    public update(delta: number): void {
        if (!this.hasReachedPoint) {
            this.moveTimer.tick(delta);
        }

        if (!this.hasReachedPoint && (this.liz.getMove().isAtTarget() || this.moveTimer.isDone())) {
            this.hasReachedPoint = true;
            this.liz.getMove().stop();
        }

        if (this.hasReachedPoint && !this.hasStartedChoreo) {
            this.startChoreo();
        }

        if (this.hasStartedChoreo) {
            this.choreoTimer.tick(delta);
        }
    }

    private startChoreo() {
        this.choreoTimer.setWaitSeconds(0);
        this.choreoTimer.reset();
        this.hasStartedChoreo = true;

        if (this.choreoPoint!.sequenceName === "dancing") {
            this.startDancingChoreo();
        }
    }

    public isCompleted(): boolean {
        return this.canceled || (this.hasStartedChoreo && this.choreoTimer.isDone());
    }

    private startDancingChoreo() {
        this.choreoTimer.setWaitSeconds(120);
        this.liz.getEntity().SetAbsOrigin(this.choreoPoint!.position);
        this.liz.getEntity().SetAbsAngles(this.choreoPoint!.rotation.x, this.choreoPoint!.rotation.y, this.choreoPoint!.rotation.z);
        this.liz.getEntity().ResetSequence("dancing");
        this.liz.getEmotion().setSmile(1.0);
    }
}
