

declare interface TraceTable {
	// Input
	startpos: Vector;
	endpos: Vector;
	mask: number | null;
	ignore: CBaseEntity | null;

	// Hull
	min?: Vector;
	max?: Vector;

	// Output
	pos: Vector | null;
	fraction: number | null;
	hit: boolean | null;
	enthit: CBaseEntity | null;
	startsolid: boolean | null;
	normal: Vector | null;
}

declare function TraceLine(this: void, traceTable: TraceTable): void;
declare function TraceHull(this: void, traceTable: TraceTable): void;
