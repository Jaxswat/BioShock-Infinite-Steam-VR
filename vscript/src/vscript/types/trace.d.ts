

declare interface TraceTable {
	// Input
	startpos: Vector;
	endpos: Vector;
	mask?: number;
	ignore?: CBaseEntity;

	// Output
	pos?: Vector;
	fraction?: number;
	hit?: boolean;
	enthit?: CBaseEntity;
	startsolid?: boolean;
	normal?: Vector;
}

declare function TraceLine(this: void, traceTable: TraceTable): void;