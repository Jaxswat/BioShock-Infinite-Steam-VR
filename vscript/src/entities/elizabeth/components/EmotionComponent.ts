import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";
import {LizSpeechType} from "../lizSpeech";

class BlinkingAnimation {

    // durations/intervals in seconds
    private blinkDurationMin: number;
    private blinkDurationMax: number;
    private blinkIntervalMin: number;
    private blinkIntervalMax: number;

    private blinkTimer: number;
    private blinkPercentage: number;
    private isBlinking: boolean;
    private currentBlinkDuration: number;
    private currentBlinkInterval: number;

    public constructor() {
        this.blinkDurationMin = 0.1;
        this.blinkDurationMax = 0.4;
        this.blinkIntervalMin = 2;
        this.blinkIntervalMax = 8;
        this.blinkTimer = 0;
        this.blinkPercentage = 0;
        this.isBlinking = false;
        this.currentBlinkDuration = 0;
        this.currentBlinkInterval = this.getRandomBlinkInterval();
    }

    public update(delta: number): number {
        this.blinkTimer += delta;

        if (!this.isBlinking && this.blinkTimer >= this.currentBlinkInterval) {
            this.startBlink();
        }

        if (this.isBlinking) {
            this.updateBlinkPercentage(delta);
        }

        return this.blinkPercentage;
    }

    private startBlink(): void {
        this.isBlinking = true;
        this.blinkTimer = 0;
        this.blinkPercentage = 0;
        this.currentBlinkDuration = this.getRandomBlinkDuration();
        this.currentBlinkInterval = this.getRandomBlinkInterval();
    }

    private updateBlinkPercentage(delta: number): void {
        const halfDuration = this.currentBlinkDuration / 2;

        if (this.blinkTimer < halfDuration) {
            // Eyelids closing
            this.blinkPercentage = this.blinkTimer / halfDuration;
        } else if (this.blinkTimer < this.currentBlinkDuration) {
            // Eyelids opening
            this.blinkPercentage = 1 - (this.blinkTimer - halfDuration) / halfDuration;
        } else {
            // Blink done
            this.isBlinking = false;
            this.blinkPercentage = 0;
        }
    }

    private getRandomBlinkDuration(): number {
        return Math.random() * (this.blinkDurationMax - this.blinkDurationMin) + this.blinkDurationMin;
    }

    private getRandomBlinkInterval(): number {
        return Math.random() * (this.blinkIntervalMax - this.blinkIntervalMin) + this.blinkIntervalMin;
    }
}

export default class EmotionComponent extends LizComponent {
    private addSmile: boolean;
    private smile: number;

    private blinkingAnimation: BlinkingAnimation;

    public constructor(liz: Elizabeth) {
        super(liz);

        this.addSmile = true;
        this.smile = 0;
        this.blinkingAnimation = new BlinkingAnimation();
    }

    public update(delta: number) {
    }

    public updatePose(delta: number): void {
        const blink = this.blinkingAnimation.update(delta);

        // if (this.smile >= 1) {
        //     this.addSmile = false;
        // } else if (this.smile <= 0){
        //     this.addSmile = true;
        // }

        // if (this.addSmile) {
        //     this.smile += 0.002
        // } else {
        //     this.smile -= 0.002
        // }

        // this.liz.getEntity().SetPoseParameter("face_smile", this.smile);
        this.liz.getEntity().SetPoseParameter("face_blink", blink);
    }

    /**
     * Sets smile percentage 0 - 1
     */
    public setSmile(smile: number): void {
        this.smile = smile;
    }
}
