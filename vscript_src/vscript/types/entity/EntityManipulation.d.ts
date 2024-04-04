
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


declare function PrecacheModel(modelName: string, context: any): void;
declare function PrecacheSoundFile(soundFileName: string, context: any): void;