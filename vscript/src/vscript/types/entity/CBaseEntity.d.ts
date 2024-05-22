declare interface EHandle {}

declare abstract class CBaseEntity {
	GetName(): string;
	GetClassname(): string;

	EyePosition(): Vector;
	EyeAngles(): QAngle;

	GetAbsOrigin(): Vector;
	GetAbsScale(): number;
	GetAngles(): QAngle;
	GetAnglesAsVector(): Vector;

	GetAnglesAsVector(): Vector;
	GetAngularVelocity(): Vector;
	GetBaseVelocity(): Vector;
	GetBoundingMaxs(): Vector;
	GetBoundingMins(): Vector;
	GetBounds(): any;
	GetCenter(): Vector;
	GetHealth(): number;
	SetHealth(health: number): void;
	GetLocalAngles(): QAngle;
	GetLocalAngularVelocity(): QAngle;
	GetLocalOrigin(): Vector;
	GetLocalScale(): number;
	GetLocalVelocity(): Vector;
	/**
	 * Return the mass of the entity's physics body in kilograms.
	 * Returns 0 if there is no physics body.
	 */
	GetMass(): number;
	GetMaxHealth(): number;
	GetModelName(): string;
	GetMoveParent(): CBaseEntity;
	GetOrigin(): Vector;
	GetOwner(): CBaseEntity;
	GetOwnerEntity(): CBaseEntity;

	GetRenderColor(): Vector;
	SetRenderColor(r: number, g: number, b: number): void;
	SetRenderAlpha(alpha: number): void;
	SetRenderMode(mode: number): void;

	SetModel(modelName: string): void;

	PrecacheScriptSound(soundName: string): void;

	GetChildren(): CBaseEntity[];

	Attribute_GetFloatValue(pName: string, flDefault: number): number;
	Attribute_GetIntValue(pName: string, nDefault: number): number;
	Attribute_SetFloatValue(pName: string, flValue: number): void;
	Attribute_SetIntValue(pName: string, nValue: number): void;
	HasAttribute(pName: string): boolean;

	GetForwardVector(): Vector;
	GetRightVector(): Vector;
	GetUpVector(): Vector;
	SetForwardVector(v: Vector): void;

	ApplyAbsVelocityImpulse(vecImpulse: Vector): void;
	ApplyLocalAngularVelocityImpulse(angImpulse: Vector): void;
	GetVelocity(): Vector;
	SetVelocity(vecVelocity: Vector): void;
	SetAbsAngles(fPitch: number, fYaw: number, fRoll: number): void;
	SetAbsOrigin(origin: Vector): void;
	SetAbsScale(flScale: number): void;
	SetAngles(fPitch: number, fYaw: number, fRoll: number): void;
	SetAngularVelocity(pitchVel: number, yawVel: number, rollVel: number): void;
	SetLocalOrigin(origin: Vector): void;
	SetLocalAngles(pitch: number, yaw: number, roll: number): void;

	/**
	 * Sets the parent of the entity. If the parent is null, the entity will be unparented.
	 * @param parent parent entity
	 * @param pAttachmentName attachment name, optional. Use empty string to ignore.
	 */
	SetParent(parent: CBaseEntity | null, pAttachmentName: string): void;

	EmitSound(soundName: string): void;
	EmitSoundParams(soundName: string, pitch?: number, volume?: number, soundTime?: number): void;
	StopSound(soundName: string): void;

	/**
	 * Gets the duration of the sound
	 * @param soundName sound name
	 * @param actorModelName no idea. Just put an empty string
	 */
	GetSoundDuration(soundName: string, actorModelName: string): number;

	// SetThink(name: string, self: void, updateRate: number): void;
	// SetThink(thinkFunction: Function, thinkName: string, initialDelay: number): void;
	SetThink(thinkFunction: any, thinkName: any, initialDelay: number): void;

	TakeDamage(damageInfo: CTakeDamageInfo): number;

	GetEntityHandle(): EHandle;
	GetEntityIndex(): number;
}
