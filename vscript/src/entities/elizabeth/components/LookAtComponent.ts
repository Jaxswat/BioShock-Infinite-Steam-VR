import Elizabeth from "../Elizabeth";
import LizComponent from "./LizComponent";

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
    
    public constructor(liz: Elizabeth) {
        super(liz);
        this.enabled = true;
        this.targetModeEntity = false;
        this.targetPosition = Vector();
        this.targetEntity = null;
        this.lastHeadYaw = 0;
        this.lastHeadPitch = 0;
        this.lastEyesYaw = 0;
        this.lastEyesPitch = 0;
    }

    private resetLerps() {
        this.lastHeadYaw = 0;
        this.lastHeadPitch = 0;
        this.lastEyesYaw = 0;
        this.lastEyesPitch = 0;
    }

    public updatePose(delta: number) {
        const target = this.getNextPosition();

        const lizEntity = this.liz.getEntity();
        const lizPos = lizEntity.GetAbsOrigin();
        const lizFwd = lizEntity.GetForwardVector();
        const lizRight = lizEntity.GetRightVector();
        
        const adjustedLizPos = lizPos;
        adjustedLizPos.z = target.z;
        
        let directionToTarget = subVector(target, adjustedLizPos);
        
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

        return pos;
    }
    
    public setTargetModeEntity(targetModeEntity: boolean) {
        this.targetModeEntity = targetModeEntity;
    }

    public getTargetPosition(): Vector {
        return this.targetPosition;
    }
    
    public setTargetPosition(targetPosition: Vector) {
        this.targetModeEntity = false;
        this.targetPosition = targetPosition;
        
        // TODO: check if position is behind or requires turn, then turn + reset lerps
    }

    public getTargetEntity(): CBaseEntity | null {
        return this.targetEntity;
    }
    
    public setTargetEntity(targetEntity: CBaseEntity | null) {
        this.targetModeEntity = true;
        this.targetEntity = targetEntity;
    }
    
    private targetRequiresBodyTurn(angleToTarget: number): boolean {
        return Math.abs(angleToTarget) > this.HEAD_YAW_LIMIT * 0.9;
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
