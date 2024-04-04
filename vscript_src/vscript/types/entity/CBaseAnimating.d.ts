declare abstract class CBaseAnimating extends CBaseEntity {
	GetSequence(): string;
	IsSequenceFinished(): boolean;
	ResetSequence(pSequenceName: string): void;
	SetSequence(pSequenceName: string): void;
	StopAnimation(): void;
	ScriptLookupAttachment(pAttachmentName: string): number;
	SequenceDuration(pSequenceName: string): number;
	GetCycle(): number;
	GetAttachmentAngles(iAttachment: number): Vector;
	GetAttachmentForward(iAttachment: number): Vector;
	GetAttachmentOrigin(iAttachment: number): Vector;
	SetPoseParameter(szName: string, fValue: number): number;
	GetSequence(): string;
}
