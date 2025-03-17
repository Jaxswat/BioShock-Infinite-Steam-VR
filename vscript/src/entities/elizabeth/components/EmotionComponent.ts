import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";
import Timer from "../../../utils/Timer";

export class BlinkingAnimation {
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
    
    private emotionalState: LizEmotionalState;
    private readonly EMOTION_MULTIPLIERS = {
        [LizEmotionalState.NEUTRAL]: 1.0,
        [LizEmotionalState.ALERT]: 0.7,  
        [LizEmotionalState.TIRED]: 1.5,    
        [LizEmotionalState.STRESSED]: 1.3, 
        [LizEmotionalState.FOCUSED]: 0.8   
    };
    
    public constructor() {
        this.blinkDurationMin = 0.1;
        this.blinkDurationMax = 0.4;
        this.blinkIntervalMin = 2.5;  
        this.blinkIntervalMax = 7.0;  
        this.blinkTimer = 0;
        this.blinkPercentage = 0;
        this.isBlinking = false;
        this.currentBlinkDuration = 0;
        this.currentBlinkInterval = this.getRandomBlinkInterval();
        this.emotionalState = LizEmotionalState.NEUTRAL;
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
    
    public startBlink(): void {
        if (this.isBlinking) {
            return;
        }
        
        this.isBlinking = true;
        this.blinkTimer = 0;
        this.blinkPercentage = 0;
        this.currentBlinkDuration = this.getRandomBlinkDuration();
        this.currentBlinkInterval = this.getRandomBlinkInterval();
    }
    
    public triggerBlink(force: boolean = false, probability: number = 0.3): boolean {
        if (this.isBlinking) {
            return false;
        }
        
        if (force || Math.random() < probability) {
            this.startBlink();
            return true;
        }
        
        return false;
    }
    
    public setEmotionalState(state: LizEmotionalState): void {
        this.emotionalState = state;
    }
    
    public getEmotionalState(): LizEmotionalState {
        return this.emotionalState;
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
        const multiplier = this.EMOTION_MULTIPLIERS[this.emotionalState] || 1.0;
        const interval = Math.random() * (this.blinkIntervalMax - this.blinkIntervalMin) + this.blinkIntervalMin;
        return interval * multiplier;
    }
    
    public isCurrentlyBlinking(): boolean {
        return this.isBlinking;
    }
    
    public getBlinkPercentage(): number {
        return this.blinkPercentage;
    }
}

export enum LizEmotionalState {
    NEUTRAL = 0,
    ALERT = 1,
    TIRED = 2,
    STRESSED = 3,
    FOCUSED = 4
}

export default class EmotionComponent extends LizComponent {
    private smile: number;

    private blinkingAnimation: BlinkingAnimation;
    private currentEmotionalState: LizEmotionalState;
    private emotionTimer: Timer;
    
    public constructor(liz: Elizabeth) {
        super(liz);
        this.smile = 0;
        this.blinkingAnimation = new BlinkingAnimation();
        this.currentEmotionalState = LizEmotionalState.NEUTRAL;
        this.emotionTimer = new Timer(0);
    }
    
    public getBlinkingAnimation(): BlinkingAnimation {
        return this.blinkingAnimation;
    }
    
    public setEmotionalState(state: LizEmotionalState, duration: number = 0): void {
        this.currentEmotionalState = state;
        this.blinkingAnimation.setEmotionalState(state);
        
        if (duration > 0) {
            this.emotionTimer.resetWithWaitSeconds(duration);
        }
    }
    
    public update(delta: number) { 
        if (this.currentEmotionalState !== LizEmotionalState.NEUTRAL) {
            this.emotionTimer.tick(delta);
            
            if (this.emotionTimer.isDone()) {
                this.setEmotionalState(LizEmotionalState.NEUTRAL);
            }
        }
    }
    
    public updatePose(delta: number): void {
        const blink = this.blinkingAnimation.update(delta);
        this.liz.getEntity().SetPoseParameter("face_blink", blink);
        this.liz.getEntity().SetPoseParameter("face_smile", this.smile);
    }

    /**
     * Sets smile percentage 0 - 1
     */
    public setSmile(smile: number): void {
        this.smile = smile;
    }
}
