import Timer from "../../../utils/Timer";
import Elizabeth from "../Elizabeth";
import LizComponent from "./LizComponent";

export enum LookBehavior {
    NATURAL = 0,  // Natural scanning with saccades and fixations
    TRACKING = 1, // Focused tracking of a target (natural, fewer saccades)
}

export default class LookAtComponent extends LizComponent {
    private targetModeEntity: boolean;
    private targetPosition: Vector;
    private targetEntity: CBaseEntity | null;
    private lastHeadPitch: number;
    private lastHeadYaw: number;
    private lastEyesPitch: number;
    private lastEyesYaw: number;
    
    private readonly HEAD_YAW_LIMIT = 60;
    private readonly HEAD_PITCH_LIMIT = 25;
    private readonly EYES_YAW_LIMIT = 35;
    private readonly EYES_PITCH_LIMIT = 25;
    private readonly HEAD_TURN_SPEED = 45;  // Degrees per second
    private readonly EYES_TURN_SPEED = 90;
    
    private currentBehavior: LookBehavior;
    
    // Interest point system (offsets from the main target)
    private readonly INTEREST_POINT_RADIUS = 2.5;
    private interestPointTimer: Timer;
    private lookWithOffsetTimer: Timer;      // How long to look at a specific offset
    private currentLookAtOffset: Vector;     // Current offset from the main target
    private targetLookAtOffset: Vector;      // Target offset to move towards
    private readonly OFFSET_CHANGE_SPEED = 5.0; // How fast the eyes move between interest points
    
    private readonly SCAN_MIN_INTERVAL = 0.5;   // Min time to look at one interest point
    private readonly SCAN_MAX_INTERVAL = 2.0;   // Max time to look at one interest point
    private readonly SCAN_TRACKING_MULTIPLIER = 2.0; // Longer fixations when tracking
    
    private readonly MICROSACCADE_AMPLITUDE = 0.025; // Small random movements in inches
    private readonly MICROSACCADE_FREQ = 2.0;       // Frequency of microsaccades
    
    public constructor(liz: Elizabeth) {
        super(liz);
        this.enabled = true;
        this.targetModeEntity = false;
        this.targetPosition = Vector(0, 0, 0);
        this.targetEntity = null;
        this.lastHeadYaw = 0;
        this.lastHeadPitch = 0;
        this.lastEyesYaw = 0;
        this.lastEyesPitch = 0;
        
        this.currentBehavior = LookBehavior.NATURAL;
        this.currentLookAtOffset = Vector(0, 0, 0);
        this.targetLookAtOffset = Vector(0, 0, 0);
        
        this.interestPointTimer = new Timer(this.getRandomScanInterval());
        this.lookWithOffsetTimer = new Timer(0.1);
    }
    
    private getRandomScanInterval(): number {
        let interval = this.SCAN_MIN_INTERVAL + Math.random() * (this.SCAN_MAX_INTERVAL - this.SCAN_MIN_INTERVAL);
        
        if (this.currentBehavior === LookBehavior.TRACKING) {
            interval *= this.SCAN_TRACKING_MULTIPLIER;
        }
        
        return interval;
    }
    
    private generateNewOffset(): Vector {
        // If tracking, use smaller offsets for more focused attention
        const radiusMultiplier = this.currentBehavior === LookBehavior.TRACKING ? 0.4 : 1.0;
        
        const radius = this.INTEREST_POINT_RADIUS * radiusMultiplier;
        const xOffset = (Math.random() * 2 - 1) * radius;
        const yOffset = (Math.random() * 2 - 1) * radius;
        const zOffset = (Math.random() * 2 - 1) * radius * 0.3; // Less vertical movement
        
        return Vector(xOffset, yOffset, zOffset);
    }

    private resetLerps() {
        this.lastHeadYaw = 0;
        this.lastHeadPitch = 0;
        this.lastEyesYaw = 0;
        this.lastEyesPitch = 0;
    }
    
    // Update the current look at offset with microsaccades and interest point changes
    private updateLookAtOffset(delta: number): void {
        this.interestPointTimer.tick(delta);
        
        if (this.interestPointTimer.isDone()) {
            this.targetLookAtOffset = this.generateNewOffset();
            
            const interval = this.getRandomScanInterval();
            this.interestPointTimer.resetWithWaitSeconds(interval);
            this.lookWithOffsetTimer.resetWithWaitSeconds(0.1);
            
            if (Math.random() < 0.3) {
                this.liz.getEmotion().getBlinkingAnimation().triggerBlink(false, 0.3);
            }
        }
        
        this.lookWithOffsetTimer.tick(delta);
        
        if (!this.lookWithOffsetTimer.isDone()) {
            // Fast movement toward new point
            const t = this.lookWithOffsetTimer.getProgress() * this.OFFSET_CHANGE_SPEED * delta;
            this.currentLookAtOffset.x = this.safeLerp(t, this.currentLookAtOffset.x, this.targetLookAtOffset.x);
            this.currentLookAtOffset.y = this.safeLerp(t, this.currentLookAtOffset.y, this.targetLookAtOffset.y);
            this.currentLookAtOffset.z = this.safeLerp(t, this.currentLookAtOffset.z, this.targetLookAtOffset.z);
        } else {
            // microsaccades during fixation
            const microX = Math.sin(Time() * this.MICROSACCADE_FREQ) * this.MICROSACCADE_AMPLITUDE;
            const microY = Math.cos(Time() * this.MICROSACCADE_FREQ * 1.3) * this.MICROSACCADE_AMPLITUDE;
            const microZ = Math.sin(Time() * this.MICROSACCADE_FREQ * 0.7) * this.MICROSACCADE_AMPLITUDE * 0.5;
            
            this.currentLookAtOffset = addVector(this.targetLookAtOffset, Vector(microX, microY, microZ));
        }
    }

    public updatePose(delta: number) {
        this.updateLookAtOffset(delta);
        
        const target = this.getNextPosition();

        const lizEntity = this.liz.getEntity();
        const lizPos = lizEntity.GetAbsOrigin();
        const lizFwd = lizEntity.GetForwardVector();
        const lizRight = lizEntity.GetRightVector();
        
        lizPos.z = target.z;
        
        let directionToTarget = subVector(target, lizPos);
        
        if (directionToTarget.Length() < 0.001) {
            return;
        }
        
        directionToTarget = directionToTarget.Normalized();
        
        let dot = lizFwd.Dot(directionToTarget);
        dot = Math.max(-1, Math.min(1, dot));
        const radAngle = Math.acos(dot);
        let angleToTarget = (radAngle * 180) / Math.PI;
        
        const rightDot = lizRight.Dot(directionToTarget);
        if (rightDot < 0) {
            angleToTarget *= -1;
        }
        
        const attachmentIndex = lizEntity.ScriptLookupAttachment("eyes");
        const eyePosition = lizEntity.GetAttachmentOrigin(attachmentIndex);
        
        const directionFromEyes = subVector(target, eyePosition);
        const vecToAngle = VectorToAngles(directionFromEyes);
        
        let pitchToTarget: number;
        if (vecToAngle.x > 180) {
            pitchToTarget = (360 - vecToAngle.x);
        } else {
            pitchToTarget = -vecToAngle.x;
        }
        
        let headYaw = 0;
        let headPitch = 0;
        let eyesYaw = 0;
        let eyesPitch = 0;
        
        if (Math.abs(angleToTarget) <= this.EYES_YAW_LIMIT) {
            eyesYaw = angleToTarget;
            headYaw = 0;
        } else if (Math.abs(angleToTarget) <= (this.HEAD_YAW_LIMIT + this.EYES_YAW_LIMIT)) {
            headYaw = angleToTarget - (Math.sign(angleToTarget) * this.EYES_YAW_LIMIT);
            eyesYaw = Math.sign(angleToTarget) * this.EYES_YAW_LIMIT;
        } else {
            headYaw = angleToTarget;
            if (headYaw > this.HEAD_YAW_LIMIT) {
                headYaw = this.HEAD_YAW_LIMIT;
                eyesYaw = this.EYES_YAW_LIMIT;
            } else if (headYaw < -this.HEAD_YAW_LIMIT) {
                headYaw = -this.HEAD_YAW_LIMIT;
                eyesYaw = -this.EYES_YAW_LIMIT;
            }
        }
        
        if (Math.abs(pitchToTarget) <= this.EYES_PITCH_LIMIT) {
            eyesPitch = pitchToTarget;
            headPitch = 0;
        } else if (Math.abs(pitchToTarget) <= (this.HEAD_PITCH_LIMIT + this.EYES_PITCH_LIMIT)) {
            headPitch = pitchToTarget - (Math.sign(pitchToTarget) * this.EYES_PITCH_LIMIT);
            eyesPitch = Math.sign(pitchToTarget) * this.EYES_PITCH_LIMIT;
        } else {
            headPitch = pitchToTarget;
            if (headPitch > this.HEAD_PITCH_LIMIT) {
                headPitch = this.HEAD_PITCH_LIMIT;
                eyesPitch = this.EYES_PITCH_LIMIT;
            } else if (headPitch < -this.HEAD_PITCH_LIMIT) {
                headPitch = -this.HEAD_PITCH_LIMIT;
                eyesPitch = -this.EYES_PITCH_LIMIT;
            }
        }
        
        const targetHeadYaw = this.safeLerp(this.HEAD_TURN_SPEED * delta, this.lastHeadYaw, headYaw);
        const targetHeadPitch = this.safeLerp(this.HEAD_TURN_SPEED * delta, this.lastHeadPitch, headPitch);
        
        const targetEyesYaw = this.safeLerp(this.EYES_TURN_SPEED * delta, this.lastEyesYaw, eyesYaw);
        const targetEyesPitch = this.safeLerp(this.EYES_TURN_SPEED * delta, this.lastEyesPitch, eyesPitch);
        
        this.lastHeadYaw = targetHeadYaw;
        this.lastHeadPitch = targetHeadPitch;
        this.lastEyesYaw = targetEyesYaw;
        this.lastEyesPitch = targetEyesPitch;
        
        lizEntity.SetPoseParameter("head_yaw", -targetHeadYaw); // Negate yeehaw yaws
        lizEntity.SetPoseParameter("head_pitch", targetHeadPitch);
        lizEntity.SetPoseParameter("eyes_yaw", -targetEyesYaw);
        lizEntity.SetPoseParameter("eyes_pitch", targetEyesPitch);

        // DebugDrawText(addVector(eyePosition, Vector(0, 0, 16)), "Yaw: " + -targetHeadYaw, false, delta)
        // DebugDrawLine(eyePosition, target, 255, 0, 0, false, delta)
        // DebugDrawLine(eyePosition, addVector(eyePosition, mulVector(lizFwd, Vector(16, 16, 16))), 0, 255, 0, false, delta)
    }

    private getNextPosition(): Vector {
        let pos = this.targetPosition;

        if (this.targetModeEntity && this.targetEntity !== null && IsValidEntity(this.targetEntity)) {
            pos = this.targetEntity.GetAbsOrigin();
            this.targetPosition = pos;
        }

        return addVector(pos, this.currentLookAtOffset);
    }
    
    public setTargetModeEntity(targetModeEntity: boolean) {
        this.targetModeEntity = targetModeEntity;
    }

    public getTargetPosition(): Vector {
        return this.targetPosition;
    }
    
    public setTargetPosition(targetPosition: Vector, behavior?: LookBehavior) {
        this.targetModeEntity = false;
        this.targetPosition = Vector(targetPosition.x, targetPosition.y, targetPosition.z);
        
        if (behavior !== undefined) {
            this.setLookBehavior(behavior);
        }
        
        this.currentLookAtOffset = Vector(0, 0, 0);
        this.targetLookAtOffset = Vector(0, 0, 0);
        this.interestPointTimer.resetWithWaitSeconds(0.1);
    }

    public getTargetEntity(): CBaseEntity | null {
        return this.targetEntity;
    }
    
    public setTargetEntity(targetEntity: CBaseEntity | null, behavior?: LookBehavior) {
        this.targetModeEntity = true;
        this.targetEntity = targetEntity;
        
        if (!behavior) {
            behavior = LookBehavior.TRACKING;
        }

        this.setLookBehavior(behavior);
        
        this.currentLookAtOffset = Vector(0, 0, 0);
        this.targetLookAtOffset = Vector(0, 0, 0);
        this.interestPointTimer.resetWithWaitSeconds(0.1);
    }
    
    public setLookBehavior(behavior: LookBehavior): void {
        if (this.currentBehavior !== behavior) {
            this.currentBehavior = behavior;
            this.interestPointTimer.resetWithWaitSeconds(0.1);
        }
    }
    
    public getLookBehavior(): LookBehavior {
        return this.currentBehavior;
    }

    private safeLerp(rate: number, current: number, target: number): number {
        if (isNaN(rate) || isNaN(current) || isNaN(target)) {
            return isNaN(current) ? 0 : current;
        }
        
        const result = Lerp(rate, current, target);
        
        if (isNaN(result)) {
            return current;
        }
        
        return result;
    }
}
