import {LizStateName, LizState} from "./LizState";
import Elizabeth from "../Elizabeth";
import {LizCuriousityPoint, LizCuriousityUtils} from "../lizCuriousity";
import {getSpeechClip, LizSpeechTag} from "../speechConfig";

export default class CuriousState extends LizState {
    private curiousityPoints: LizCuriousityPoint[] = [];
    private currentCuriousityPoint: LizCuriousityPoint | null = null;
    private maxCuriousitySeconds = 10;
    private curiousityTime = 0;
    private curiositySpeech = false;
    private curiousityRadius = 200;
    private usedCuriosityPoints = new Set<number>();

    public constructor(liz: Elizabeth) {
        super("curious", liz);
        this.curiousityPoints = LizCuriousityUtils.findAllCuriousityPoints();
    }

    public enter(): void {
        // Do nothing
    }

    public exit(): void {
        // Do nothing
    }

    public update(delta: number): void {
        const lizPos = this.liz.getEntity().GetAbsOrigin();
        if (this.currentCuriousityPoint === null) {
            this.currentCuriousityPoint = LizCuriousityUtils.getNearestCuriosityPoint(lizPos, this.curiousityPoints, this.usedCuriosityPoints);
            print("FOUND CURIOUSITY POINT");
            return;
        }

        const inCuriousRadius = VectorDistance(this.currentCuriousityPoint.position, lizPos) < this.curiousityRadius;
        // this.goalPos = this.currentCuriousityPoint.position; // Set next move position
        if (inCuriousRadius) {
            this.curiousityTime += delta;

            if (!this.curiositySpeech && this.curiousityTime > 5) {
                const isSmelly = this.currentCuriousityPoint.smelly;
                let sentiment = this.currentCuriousityPoint.sentiment;
                let speechTag = LizSpeechTag.Hmm;
                if (isSmelly) {
                    speechTag = LizSpeechTag.Smelly;
                } else if (sentiment > 0.51) {
                    speechTag = LizSpeechTag.LookAtThis;
                }

                const clip = getSpeechClip(speechTag, sentiment, null);
                this.liz.getSpeech().queueClip(clip!);
                this.curiositySpeech = true;
            }
        }

        if (this.curiousityTime > this.maxCuriousitySeconds) {
            this.usedCuriosityPoints.add(this.currentCuriousityPoint.id);
            this.currentCuriousityPoint = null;
            this.curiousityTime = 0;
            this.curiositySpeech = false;
        }
    }
}
