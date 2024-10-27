import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";
import { LizSpeechClip } from "../lizSpeech";

export interface PoseParamAnimation {
    fps: number;
    keyframes: number[];
}

export function speechClipToAnimation(clip: LizSpeechClip): PoseParamAnimation {
    return {
        fps: clip.framerate,
        keyframes: clip.keyframes,
    };
}

export const EMPTY_ANIMATION: PoseParamAnimation = {
    fps: 0,
    keyframes: [],
};

export class PoseParamAnimationComponent extends LizComponent {
    private poseParamName: string;
    private animation: PoseParamAnimation;
    private speed: number;
    private currentTime: number;
    private loop: boolean;

    public constructor(liz: Elizabeth, poseParamName: string, animation: PoseParamAnimation | null) {
        super(liz);
        this.poseParamName = poseParamName;
        this.speed = 1.0;
        this.currentTime = 0;
        this.loop = false;

        if (animation) {
            this.animation = animation;
        } else {
            this.animation = EMPTY_ANIMATION;
        }
    }

    public updatePose(delta: number) {
        const { fps, keyframes } = this.animation;
        if (keyframes.length === 0) {
            // TODO: beware of visually "snapping" to 0
            this.liz.getEntity().SetPoseParameter(this.poseParamName, 0);
            return;
        }

        const duration = (keyframes.length - 1) / fps;
        this.currentTime += delta * this.speed;

        if (this.loop) {
            this.currentTime %= duration;
        } else if (this.currentTime > duration) {
            this.currentTime = duration;
        } else if (this.currentTime < 0) {
            this.currentTime = 0;
        }

        const frameIndex = Math.floor(this.currentTime * fps);
        const t = this.currentTime * fps - frameIndex;
        const currentFrame = keyframes[frameIndex];
        const nextFrame = keyframes[Math.min(frameIndex + 1, keyframes.length - 1)];
        const interpolatedValue = currentFrame + (nextFrame - currentFrame) * t;

        this.liz.getEntity().SetPoseParameter(this.poseParamName, Math.min(interpolatedValue * 3, 1));
    }

    public getSpeed(): number {
        return this.speed;
    }
    public setSpeed(speed: number): void {
        this.speed = speed;
    }

    public getLoop(): boolean {
        return this.loop;
    }
    public setLoop(loop: boolean): void {
        this.loop;
    }

    public getAnimation(): PoseParamAnimation {
        return this.animation;
    }
    public setAnimation(animation: PoseParamAnimation): void {
        this.animation = animation;
        this.currentTime = 0;
    }

    public getCurrentTime(): number {
        return this.currentTime;
    }
    public setCurrentTime(currentTime: number): void {
        this.currentTime = currentTime;
    }
}
