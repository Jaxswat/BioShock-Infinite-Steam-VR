
declare function FireEntityIOInputNameOnly(entity: EHandle, inputName: string): void;
declare function FireEntityIOInputString(entity: EHandle, inputName: string, value: string): void;
declare function FireEntityIOInputVec(entity: EHandle, inputName: string, value: Vector): void;

declare function GetHandHoldingEntity(entity: CBaseEntity): CPropVRHand | null;
declare function GetPlayerFromUserID(userID: number): CBasePlayer | null;

declare interface EntitySpawnInfo {
    targetname: string; // name of entity?
    model: string;
    origin: Vector;
    angles: QAngle;
    solid: boolean; // collision enabled
    DefaultAnim?: string
}

declare function SpawnEntityFromTableSynchronous(className: string, spawnInfo: EntitySpawnInfo & any): CBaseEntity;

declare function SetRenderingEnabled(ehandle: EHandle, enabled: boolean): void;

declare function PrecacheModel(modelName: string, context: any): void;
declare function PrecacheSoundFile(soundFileName: string, context: any): void;

declare const DMG_GENERIC = 0;
declare const DMG_CRUSH = 1;
declare const DMG_BULLET = 2;
declare const DMG_SLASH = 4;
declare const DMG_BURN = 8;
declare const DMG_VEHICLE = 16;
declare const DMG_FALL = 32;
declare const DMG_BLAST = 64;
declare const DMG_CLUB = 128;
declare const DMG_SHOCK = 256;
declare const DMG_SONIC = 512;
declare const DMG_ENERGYBEAM = 1024;
declare const DMG_PREVENT_PHYSICS_FORCE = 2048;
declare const DMG_NEVERGIB = 4096;
declare const DMG_ALWAYSGIB = 8192;
declare const DMG_DROWN = 16384;
declare const DMG_PARALYZE = 32768;
declare const DMG_NERVEGAS = 65536;
declare const DMG_POISON = 131072;
declare const DMG_RADIATION = 262144;
declare const DMG_DROWNRECOVER = 524288;
declare const DMG_ACID = 1048576;
declare const DMG_SLOWBURN = 2097152;
declare const DMG_REMOVENORAGDOLL = 4194304;
declare const DMG_PHYSGUN = 8388608;
declare const DMG_PLASMA = 16777216;
declare const DMG_AIRBOAT = 33554432;
declare const DMG_DISSOLVE = 67108864;
declare const DMG_BLAST_SURFACE = 134217728;
declare const DMG_DIRECT = 268435456;

declare interface CTakeDamageInfo {
    AddDamage(addAmount: number): void;
    AddDamageType(bitsDamageType: number): void;
    AllowFriendlyFire(): boolean;
    BaseDamageIsValid(): boolean;
    CanBeBlocked(): boolean;
    GetAmmoType(): number;
    GetAttacker(): CBaseEntity;
    GetBaseDamage(): number;
    GetDamage(): number;
    GetDamageCustom(): number;
    GetDamageForce(): Vector;
    GetDamagePosition(): number;
    GetDamageTaken(): number;
    GetDamageType(): number;
    GetInflictor(): CBaseEntity;
    GetMaxDamage(): number;
    GetOriginalDamage(): number;
    GetRadius(): number;
    GetReportedPosition(): Vector;
    GetStabilityDamage(): number;
    ScaleDamage(scaleAmount: number): void;
    SetAllowFriendlyFire(allow: boolean): void;
    SetAmmoType(ammoType: number): void;
    SetAttacker(attacker: CBaseEntity): void;
    SetCanBeBlocked(block: boolean): void;
    SetDamage(damage: number): void;
    SetDamageCustom(damageCustom: number): void;
    SetDamageForce(damageForce: Vector): void;
    SetDamagePosition(damagePosition: Vector): void;
    SetDamageTaken(damageTaken: number): void;
    SetDamageType(bitsDamageType: number): void;
    SetMaxDamage(maxDamage: number): void;
    SetOriginalDamage(originalDamage: number): void;
    SetRadius(radius: number): void;
    SetReportedPosition(reportedPosition: Vector): void;
    SetStabilityDamage(stabilityDamage: number): void;
}


declare function CreateDamageInfo(inflictor: EHandle, attacker: EHandle, force: Vector, hitPos: Vector, damage: number, damageTypes: number): CTakeDamageInfo;

/**
 * Based on some Garry's Mod docs, CreateDamageInfo doesn't actually create a unique instance.
 * If it's the same implementation, then we probably don't need to call this. Ever.
 */
declare function DestroyDamageInfo(damageInfo: CTakeDamageInfo): void;

declare function UTIL_Remove(entity: CBaseEntity): void;
