import Elizabeth from "../Elizabeth";
import LizComponent from "./LizComponent";

export default class LookAtComponent extends LizComponent {
    private enabled: boolean;
    private target: Vector;

    public constructor(liz: Elizabeth) {
        super(liz);

        this.enabled = false;
        this.target = Vector();
    }

    public updatePose(delta: number) {
        if (!this.enabled) {
            return;
        }

        const lizEntity = this.liz.getEntity();
        const lizPos = lizEntity.GetAbsOrigin();
        const lizFwd = lizEntity.GetForwardVector();
        const lizRight = lizEntity.GetRightVector();
        const lizUp = lizEntity.GetUpVector();

        const adjustedLizPos = lizPos;
        adjustedLizPos.z = this.target.z;
        let directionTargetToLiz = subVector(this.target, adjustedLizPos).Normalized();
        let dot = lizFwd.Dot(directionTargetToLiz);
        let radAngle = Math.acos(dot);
        let headYaw = (radAngle * 180) / Math.PI;
        let rightDot = lizRight.Dot(directionTargetToLiz);

        if (rightDot < 0) {
            headYaw *= -1;
        }

        if (headYaw < -60) {
            headYaw = -60;
        }
        if (headYaw > 60) {
            headYaw = 60;
        }

        let attachmentIndex = lizEntity.ScriptLookupAttachment("eyes");
        let attachmentLocation = lizEntity.GetAttachmentOrigin(attachmentIndex);
        let directionTargetToLizUp = subVector(this.target, attachmentLocation);
        let vecToAngle = VectorToAngles(directionTargetToLizUp);

        let headPitch: number;
        if (vecToAngle.x > 180) {
            headPitch = (360 - vecToAngle.x);
        } else {
            headPitch = -vecToAngle.x;
        }

        if (headPitch < -25) {
            headPitch = -25;
        }
        if (headPitch > 25) {
            headPitch = 25;
        }

        lizEntity.SetPoseParameter("head_pitch", headPitch);
        lizEntity.SetPoseParameter("head_yaw", -headYaw);

        lizEntity.SetPoseParameter("eyes_pitch", headPitch/2);
        lizEntity.SetPoseParameter("eyes_yaw", -headYaw/2);
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    public getTarget(): Vector {
        return this.target;
    }

    public setTarget(target: Vector) {
        this.target = target;
    }
}
