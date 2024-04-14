/**
 * Trace mask
 */
export enum TraceMask {
    TRACE_MASK_PLAYER_SOLID = 33636363 // From L4D2 script API, may not be correct for Source 2.
}

/**
 * Stores the results of a trace
 */
export class TraceResult {
    private hit: boolean;
    private hitPosition: Vector;
    private hitNormal: Vector;
    private entityHit: CBaseEntity | null;

    private startInSolid: boolean;
    private fraction: number;

    public constructor(traceTable: TraceTable) {
        this.hit = traceTable.hit! || false;
        this.hitPosition = traceTable.pos!;
        this.hitNormal = traceTable.normal!;
        this.entityHit = traceTable.enthit || null;
        this.startInSolid = traceTable.startsolid || false;
        this.fraction = traceTable.fraction || 0;
    }

    /**
     * Returns true if the trace hit something.
     */
    public hasHit(): boolean {
        return this.hit;
    }

    /**
     * Returns the position where the trace hit.
     */
    public getHitPosition(): Vector {
        return this.hitPosition;
    }

    /**
     * Returns the normal of the surface where the trace hit, in world space.
     */
    public getHitNormal(): Vector {
        return this.hitNormal;
    }

    /**
     * Returns true if the trace hit an entity.
     */
    public hasEntityHit(): boolean {
        return this.entityHit !== null;
    }

    /**
     * Returns the entity that was hit by the trace.
     */
    public getEntityHit(): CBaseEntity | null {
        return this.entityHit;
    }

    /**
     * Returns true if the trace started inside a solid.
     */
    public didStartInSolid(): boolean {
        return this.startInSolid;
    }

    /**
     * Returns the fraction from start to end where the trace hit something.
     */
    public getFraction(): number {
        return this.fraction;
    }
}

/**
 * Base class for traces.
 */
abstract class Trace {
    protected startPosition: Vector;
    protected endPosition: Vector;

    protected mask: TraceMask | number;
    protected ignoreEntity: CBaseEntity | null;

    protected constructor(startPosition: Vector, endPosition: Vector) {
        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.mask = TraceMask.TRACE_MASK_PLAYER_SOLID;
        this.ignoreEntity = null;
    }

    public getStartPosition(): Vector {
        return this.startPosition;
    }

    public setStartPosition(startPosition: Vector): Trace {
        this.startPosition = startPosition;
        return this;
    }

    public getEndPosition(): Vector {
        return this.endPosition;
    }

    public setEndPosition(endPosition: Vector): Trace {
        this.endPosition = endPosition;
        return this;
    }

    public getMask(): TraceMask | number {
        return this.mask;
    }

    public setMask(mask: TraceMask | number): Trace {
        this.mask = mask;
        return this;
    }

    public getIgnoreEntity(): CBaseEntity | null {
        return this.ignoreEntity;
    }

    public setIgnoreEntity(entity: CBaseEntity): Trace {
        this.ignoreEntity = entity;
        return this;
    }

    /**
     * Runs the trace and returns the result.
     */
    abstract run(): TraceResult;
}

/**
 * Performs a line trace between two points.
 */
export class LineTrace extends Trace {
    public constructor(startPosition: Vector, endPosition: Vector) {
        super(startPosition, endPosition);
    }

    /**
     * Runs the trace and returns the result.
     */
    public run(): TraceResult {
        const traceTable: TraceTable = {
            startpos: this.startPosition,
            endpos: this.endPosition,
            mask: this.mask,
            ignore: this.ignoreEntity,
            pos: null,
            fraction: null,
            hit: null,
            enthit: null,
            startsolid: null,
            normal: null
        };

        TraceLine(traceTable);

        return new TraceResult(traceTable);
    }
}
