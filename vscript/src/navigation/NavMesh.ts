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
                    const connectedAreaID = connection.area as number;
                    connection.area = this.getAreaByID(connectedAreaID)!;
                });
            });
        });
    }

    public getAreaByID(id: number): NavArea | null {
        return this.areas.get(id) || null;
    }
}

export const TheNavMesh = new NavMesh();
