export enum NavDir {
    North = 0,
    East = 1,
    South = 2,
    West = 3
}

export const NAV_DIRECTION_COUNT = 4; // North, East, South, West

export class NavArea {
    // Area ID
    private id: number;

    // Area Attributes. Not used for now.
    private attributes: number;

    // The shape of the area. For now most areas have 4 vertices that form a quad.
    // They're in this order: NW = 0, SW = 1, SE = 2, NE = 3.
    private polygon: Vector[];

    // The other areas that this area is connected to.
    // Outer array is always 4 elements long: North, East, South, West.
    // Inner array contains all connections in the respective direction.
    private connections: [NavConnection[], NavConnection[], NavConnection[], NavConnection[]];

    private center: Vector;

    public constructor(id: number, polygon: Vector[], connections: [NavConnection[], NavConnection[], NavConnection[], NavConnection[]]) {
        this.id = id;
        this.attributes = 0;
        this.polygon = polygon;
        this.connections = connections;
        this.center = Vector();
        this.recalculateCenter();
    }

    public getID(): number {
        return this.id;
    }

    public setID(id: number) {
        this.id = id;
    }

    public getAttributes(): number {
        return this.attributes;
    }

    public getPolygon(): Vector[] {
        return this.polygon;
    }

    public getCorner(corner: number): Vector {
        return this.polygon[corner];
    }

    public getConnectionDirs(): [NavConnection[], NavConnection[], NavConnection[], NavConnection[]] {
        return this.connections;
    }

    public getConnections(dir: NavDir): NavConnection[] {
        return this.connections[dir];
    }

    public getCenter(): Vector {
        return this.center;
    }

    private recalculateCenter() {
        let x = 0;
        let y = 0;
        let z = 0;
        const polyCount = this.polygon.length;
        for (const polygon of this.polygon) {
            x = x + polygon.x;
            y = y + polygon.y;
            z = z + polygon.z;
        }

        this.center.x = x * (1 / polyCount);
        this.center.y = y * (1 / polyCount);
        this.center.z = z * (1 / polyCount);
    }
}

// Points to an Area and includes which edge is connected.
export interface NavConnection {
    // The area or area ID that the parent area is connected to.
    // After applying references, this will always be a NavArea object.
    area: NavArea | number;

    // The edge index that is connected to the parent area.
    // Same ordering as NavArea.polygon
    edgeIndex: number;
}

/**
 * Minified constructor for codegen
 */
export const newNavArea = (
    areaID: number,
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
    x2: number, y2: number, z2: number,
    x3: number, y3: number, z3: number,
    connections0: [number, number][] = [],
    connections1: [number, number][] = [],
    connections2: [number, number][] = [],
    connections3: [number, number][] = [],
) => new NavArea(
    areaID,
    [
        Vector(x0, y0, z0),
        Vector(x1, y1, z1),
        Vector(x2, y2, z2),
        Vector(x3, y3, z3)
    ],
    [
        connections0.map(c => ({ area: c[0], edgeIndex: c[1] } as NavConnection)),
        connections1.map(c => ({ area: c[0], edgeIndex: c[1] } as NavConnection)),
        connections2.map(c => ({ area: c[0], edgeIndex: c[1] } as NavConnection)),
        connections3.map(c => ({ area: c[0], edgeIndex: c[1] } as NavConnection)),
    ]
);
