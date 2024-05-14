export enum NavDir {
    North = 0,
    East = 1,
    South = 2,
    West = 3
}

export enum AreaCorner {
    NorthWest = 0,
    SouthWest = 1,
    SouthEast = 2,
    NorthEast = 3
}

export function directionToEdgeIndex(dir: NavDir): number {
    switch (dir) {
        case NavDir.North:
            return 0;
        case NavDir.East:
            return 3;
        case NavDir.South:
            return 2;
        case NavDir.West:
            return 1;
        default:
            return 0;
    }
}

export function edgeIndexSafe(edgeIndex: number): number {
    return edgeIndex % 4;
}

export function oppositeDirection(dir: NavDir): NavDir {
    switch (dir) {
        case NavDir.North:
            return NavDir.South;
        case NavDir.South:
            return NavDir.North;
        case NavDir.East:
            return NavDir.West;
        case NavDir.West:
            return NavDir.East;
        default:
            return NavDir.North;
    }
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

    public getConnectionByID(areaID: number): NavConnection | null {
        for (const dir of this.connections) {
            for (const connection of dir) {
                if (connection.area.getID() === areaID) {
                    return connection;
                }
            }
        }

        return null;
    }

    public getConnectionDirectionByID(areaID: number): NavDir | null {
        for (let dir = 0; dir < NAV_DIRECTION_COUNT; dir++) {
            const connections = this.connections[dir];
            for (const connection of connections) {
                if (connection.area.getID() === areaID) {
                    return dir as NavDir;
                }
            }
        }

        return null;
    }

    public getCenter(): Vector {
        return this.center;
    }

    public isPointInArea(point: Vector, checkZ: boolean = true): boolean {
        let inside = false;
        for (let i = 0, j = this.polygon.length - 1; i < this.polygon.length; j = i++) {
            const xi = this.polygon[i].x;
            const yi = this.polygon[i].y;
            const xj = this.polygon[j].x;
            const yj = this.polygon[j].y;

            const intersect =
                ((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);

            if (intersect && checkZ) {
                const zi = this.polygon[i].z;
                const zj = this.polygon[j].z;
                const zToleranceLow = point.z - 30;
                const zToleranceHigh = point.z + 100;

                if ((zi <= zToleranceHigh && zi >= zToleranceLow) &&
                    (zj <= zToleranceHigh && zj >= zToleranceLow)) {
                    inside = !inside;
                }
            } else if (intersect) {
                inside = !inside;
            }
        }
        return inside;
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
    area: NavArea;

    // The edge index of this area that is connected to the parent area.
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
        connections0.map(c => ({area: c[0] as any as NavArea, edgeIndex: c[1]} as NavConnection)),
        connections1.map(c => ({area: c[0] as any as NavArea, edgeIndex: c[1]} as NavConnection)),
        connections2.map(c => ({area: c[0] as any as NavArea, edgeIndex: c[1]} as NavConnection)),
        connections3.map(c => ({area: c[0] as any as NavArea, edgeIndex: c[1]} as NavConnection)),
    ]
);
