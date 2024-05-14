import {NavArea} from "./NavArea";

class NavMesh {
    private areas: Map<number, NavArea>;

    public constructor() {
        this.areas = new Map();
    }

    public addArea(area: NavArea): void {
        this.areas.set(area.getID(), area);
    }

    /**
     * Updates the pointers in the connected areas to reference the referenced area object
     */
    public applyAreaReferences() {
        this.areas.forEach(area => {
            const directions = area.getConnectionDirs();
            directions.forEach(direction => {
                direction.forEach(connection => {
                    const connectedAreaID = connection.area as any as number;
                    connection.area = this.getAreaByID(connectedAreaID)!;
                });
            });
        });
    }

    public getAreas() {
        return this.areas.values();
    }

    public getAreaByID(id: number): NavArea | null {
        return this.areas.get(id) || null;
    }

    public getAreaByPosition(position: Vector): NavArea | null {
        for (const area of this.areas.values()) {
            if (area.isPointInArea(position)) {
                return area;
            }
        }

        return null;
    }

    public getClosestArea(position: Vector): NavArea | null {
        let closestArea: NavArea | null = null;
        let closestDistance = Infinity;

        for (const area of this.areas.values()) {
            const distance = VectorDistance(area.getCenter(), position);
            if (distance < closestDistance) {
                closestArea = area;
                closestDistance = distance;
            }
        }

        return closestArea;
    }
}

export const TheNavMesh = new NavMesh();
