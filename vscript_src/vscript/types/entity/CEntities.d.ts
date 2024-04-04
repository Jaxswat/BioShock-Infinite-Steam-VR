interface CEntities {
	FindAllByClassname(className: string): CBaseEntity[];
	FindAllInSphere(origin: Vector, radius: number): CBaseEntity[];
	CreateByClassname(className: string): CBaseEntity;
	First(): CBaseEntity;
	Next(startFrom: CBaseEntity): CBaseEntity | null;
	GetLocalPlayer(): CBasePlayer;
	FindByClassnameNearest(className: string, origin: Vector, radius: number): CBaseEntity;
}

declare const Entities: CEntities;
