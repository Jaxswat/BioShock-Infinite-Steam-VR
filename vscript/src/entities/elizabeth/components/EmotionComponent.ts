import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";
import {LizSpeechType} from "../speechConfig";

class BlinkingAnimation {

    // Minimum duration of a single blink in seconds
    private blinkDurationMin: number;
    // Maximum duration of a single blink in seconds
    private blinkDurationMax: number;
    // Minimum interval between blinks in seconds
    private blinkIntervalMin: number;
    // Maximum interval between blinks in seconds
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

class TalkingAnimation {
    private mouthOpenMin: number;
    private mouthOpenMax: number;
    private mouthOpenSpeed: number;
    private mouthCloseSpeed: number;

    private mouthOpenPercentage: number;
    private isSpeaking: boolean;
    private speechTimer: number;
    private speechDuration: number;

    public constructor() {
        this.mouthOpenMin = 0;
        this.mouthOpenMax = 1;
        this.mouthOpenSpeed = 8;
        this.mouthCloseSpeed = 2;

        this.mouthOpenPercentage = 0;
        this.isSpeaking = false;
        this.speechTimer = 0;
        this.speechDuration = 0;
    }

    public update(delta: number): number {
        if (this.isSpeaking) {
            this.speechTimer += delta;
            this.updateMouthOpenPercentage(delta);

            if (this.speechTimer >= this.speechDuration) {
                this.isSpeaking = false;
                this.speechTimer = 0;
            }
        } else {
            this.updateMouthClosePercentage(delta);
        }

        return this.mouthOpenPercentage;
    }

    private updateMouthOpenPercentage(delta: number): void {
        const targetPercentage = Math.sin(this.speechTimer * this.mouthOpenSpeed) * 0.5 + 0.5;
        const percentageDiff = targetPercentage - this.mouthOpenPercentage;
        const percentageChange = Math.sign(percentageDiff) * Math.min(Math.abs(percentageDiff), delta * this.mouthOpenSpeed);
        this.mouthOpenPercentage += percentageChange;
        this.mouthOpenPercentage = Math.max(this.mouthOpenMin, Math.min(this.mouthOpenMax, this.mouthOpenPercentage));
    }

    private updateMouthClosePercentage(delta: number): void {
        const percentageChange = Math.min(this.mouthOpenPercentage, delta * this.mouthCloseSpeed);
        this.mouthOpenPercentage -= percentageChange;
        this.mouthOpenPercentage = Math.max(this.mouthOpenMin, this.mouthOpenPercentage);
    }

    public setSpeaking(isSpeaking: boolean): void {
        this.isSpeaking = isSpeaking;
    }

    public setSpeechDuration(speechDuration: number): void {
        this.speechDuration = speechDuration;
    }
}

export default class EmotionComponent extends LizComponent {
    private addSmile: boolean;
    private smile: number;

    private blinkingAnimation: BlinkingAnimation;
    private talkingAnimation: TalkingAnimation;

    public constructor(liz: Elizabeth) {
        super(liz);

        this.addSmile = true;
        this.smile = 0;
        this.blinkingAnimation = new BlinkingAnimation();
        this.talkingAnimation = new TalkingAnimation();
    }

    public update(delta:number) {
        const currentClip = this.liz.getSpeech().getCurrentClip();
        let isSpeaking = currentClip !== null && currentClip.type === LizSpeechType.Speech;
        let clipDuration = this.liz.getSpeech().getCurrentClipDuration();
        const currentClipProgress = this.liz.getSpeech().getCurrentClipProgress()

        // Stop speaking if the clip is mostly done
        if (currentClipProgress > 0.6) {
           isSpeaking = false;
        }

        this.talkingAnimation.setSpeaking(isSpeaking);
        this.talkingAnimation.setSpeechDuration(clipDuration);
    }

    public updatePose(delta: number): void {
        const blink = this.blinkingAnimation.update(delta);
        const mouthOpen = this.talkingAnimation.update(delta);

        if (this.smile >= 1) {
            this.addSmile = false;
        } else if (this.smile <= 0){
            this.addSmile = true;
        }

        if (this.addSmile) {
            this.smile += 0.002
        } else {
            this.smile -= 0.002
        }

        this.liz.getEntity().SetPoseParameter("face_smile", this.smile);
        this.liz.getEntity().SetPoseParameter("face_blink", blink);
        this.liz.getEntity().SetPoseParameter("face_speak", mouthOpen);
    }

    /**
     * Sets smile percentage 0 - 1
     */
    public setSmile(smile: number): void {
        this.smile = smile;
    }
}
