import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";
import {LizSpeechClip} from "../speechConfig";
import Timer from "../../../utils/Timer";

export default class SpeechComponent extends LizComponent {
    private speakerEntity: CBaseEntity;

    private speechQueue: LizSpeechClip[];
    private currentClip: LizSpeechClip | null;
    private clipTimer: Timer;

    /**
     * The amount of time to pad the end of a clip with silence
     */
    private readonly clipPaddingSeconds: number = 0.25;

    public constructor(liz: Elizabeth) {
        super(liz);

        this.speakerEntity = Entities.CreateByClassname("info_target");
        this.speakerEntity.SetParent(this.liz.getEntity(), "mouth");
        this.speakerEntity.SetLocalOrigin( Vector(0, 0, 0) );
        this.speakerEntity.SetLocalAngles( 0, 0, 0 );

        this.speechQueue = [];
        this.currentClip = null;
        this.clipTimer = new Timer(0);
    }

    public update(delta: number) {
        this.clipTimer.tick(delta);
        if (!this.clipTimer.isDone() || this.speechQueue.length === 0) {
            return;
        }

        const clip = this.speechQueue.shift()!;
        this.playClip(clip);
    }

    /**
     * Plays a clip immediately
     */
    public playClip(clip: LizSpeechClip) {
        if (this.currentClip !== null && !this.clipTimer.isDone()) {
            StopSoundOn(this.currentClip.assetName, this.speakerEntity);
        }

        this.currentClip = clip;
        EmitSoundOn(clip.assetName, this.speakerEntity);
        const clipDuration = this.speakerEntity.GetSoundDuration(clip.assetName, "");
        const waitSeconds = clipDuration + this.clipPaddingSeconds;
        this.clipTimer.setWaitSeconds(waitSeconds);
        this.clipTimer.reset();
    }

    /**
     * Queues a clip to be played next
     */
    public queueClip(clip: LizSpeechClip) {
        this.speechQueue.push(clip);
    }

    public clearQueue() {
        this.speechQueue = [];
    }
}
