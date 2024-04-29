import LizComponent from "./LizComponent";
import Elizabeth from "../Elizabeth";
import {LineTrace} from "../../../utils/Trace";
import {VTunnel, VTunnelMessage} from "../../../vconsole_tunnel/VTunnel";
import NAV_MESH from "../../../navigation/battleship_bay_nav";

export default class MoveComponent extends LizComponent {
    private readonly stepSpeed: number = 5;
    private readonly walkSpeed: number = 20;
    private readonly runSpeed: number = 140; // 70
    private readonly speedLerpFactor: number = 50;

    private targetPosition: Vector;
    private currentSpeed: number;
    private targetSpeed: number;

    private navPoints: NavPoint[];
    private path: NavPoint[];
    private currentPathIndex: number;

    public constructor(liz: Elizabeth) {
        super(liz);
        this.targetPosition = this.liz.getPosition();
        this.currentSpeed = 0;
        this.targetSpeed = 0;

        this.navPoints = [];
        this.path = [];
        this.currentPathIndex = 0;

        VTunnel.onMessage('liz_move_to', (msg: VTunnelMessage) => {
            const position = msg.indexPartDataAsVector(0);
            DebugDrawSphere(position, Vector(0, 0, 255), 1, 5, false, 1.4);
            this.moveTo(position);
        });
    }

    public updatePose(delta: number): void {
        const entity = this.liz.getEntity();
        const currentPos = this.liz.getPosition();

        if (this.currentPathIndex < this.path.length) {
            const targetNavPoint = this.path[this.currentPathIndex];
            const posSub = subVector(targetNavPoint.position, currentPos);
            const direction = posSub.Normalized();
            direction.z = 0; // no flying bruv.
            const distance = posSub.Length();

            this.currentSpeed = Lerp(this.speedLerpFactor * delta, this.currentSpeed, this.targetSpeed);
            if (this.currentSpeed === 0) {
                return;
            }

            const speed = this.currentSpeed * delta;
            const nextPos = addVector(currentPos, mulVector(direction, speed as Vector));

            const traceStart = Vector(nextPos.x, nextPos.y, entity.GetCenter().z);
            const floorTrace = new LineTrace(traceStart, subVector(traceStart, Vector(0, 0, 1000)));
            const floorTraceResult = floorTrace.run();
            if (floorTraceResult.hasHit()) {
                nextPos.z = floorTraceResult.getHitPosition().z;
            }

            this.liz.getEntity().ResetSequence("trotting_running");
            entity.SetAbsOrigin(nextPos);

            if (distance < 10) {
                this.currentPathIndex++;
                if (this.currentPathIndex < this.path.length) {
                    this.targetPosition = this.path[this.currentPathIndex].position;
                } else {
                    this.stop();
                }
            } else {
                const targetYaw = Rad2Deg(Math.atan2(direction.x, direction.y));
                entity.SetAbsAngles(0, -targetYaw+90, 0);
            }
        }
    }

    public moveTo(position: Vector): void {
        const startPos = this.liz.getPosition();
        const path = Nav.findPath(startPos, position, this.navPoints);

        for (let point of path) {
            DebugDrawSphere(point.position, Vector(0, 255, 255), 1, 5, false, 5);
        }

        if (path.length > 0) {
            this.path = path;
            this.currentPathIndex = 0;
            this.targetPosition = path[0].position;
            this.targetSpeed = this.runSpeed;
        } else {
            print("No valid path found.");
        }
    }

    public stop(): void {
        this.liz.getEntity().ResetSequence("standing_idle");
        this.targetSpeed = 0;
        this.currentSpeed = 0;
    }

    public isAtTarget(): boolean {
        return VectorDistance(this.targetPosition, this.liz.getPosition()) < 10;
    }
}

enum NavType {
    Walkable = 0,
    Obstacle = 1,

}

interface NavPoint {
    id: number;
    position: Vector;
    navType: NavType;
    gCost: number;
    hCost: number;
    fCost: number;
    parent: NavPoint | null;
}

abstract class Nav {
    private static getNearestNavPoint(position: Vector, navPoints: NavPoint[]): NavPoint | null {
        let nearestNavPoint: NavPoint | null = null;
        let nearestDistance = Infinity;

        for (const navPoint of navPoints) {
            const distance = VectorDistance(position, navPoint.position);
            if (distance < nearestDistance) {
                nearestNavPoint = navPoint;
                nearestDistance = distance;
            }
        }

        return nearestNavPoint;
    }

    public static findPath(startPos: Vector, targetPos: Vector, navPoints: NavPoint[]): NavPoint[] {
        const openList: NavPoint[] = [];
        const closedList: NavPoint[] = [];
        
        for (const navPoint of navPoints) {
            navPoint.gCost = Infinity;
            navPoint.hCost = 0;
            navPoint.fCost = Infinity;
            navPoint.parent = null;
        }

        const startNavPoint = Nav.getNearestNavPoint(startPos, navPoints);
        print("Start NavPoint: " + startNavPoint?.position);
        if (startNavPoint) {
            startNavPoint.gCost = 0;
            startNavPoint.hCost = Nav.getHeuristicCost(startNavPoint.position, targetPos);
            startNavPoint.fCost = startNavPoint.hCost;
            openList.push(startNavPoint);
        }

        const targetNavPoint = Nav.getNearestNavPoint(targetPos, navPoints);
        print("Target NavPoint: " + targetNavPoint?.position);
        while (openList.length > 0) {
            const currentNavPoint = openList.reduce((prev, curr) => prev.fCost < curr.fCost ? prev : curr);

            if (currentNavPoint.position === targetNavPoint?.position) {
                return Nav.reconstructPath(currentNavPoint);
            }

            const index = openList.indexOf(currentNavPoint);
            openList.splice(index, 1);
            closedList.push(currentNavPoint);

            const neighbors = Nav.getWalkableNeighbors(currentNavPoint, navPoints);
            print("Start NavPoint: " + currentNavPoint?.id, "Neighbors: " + neighbors.map(n => n.id).join(", "));
            for (const neighbor of neighbors) {
                if (closedList.includes(neighbor)) {
                    continue;
                }

                if (Nav.intersectsObstacle(currentNavPoint.position, neighbor.position, navPoints)) {
                    continue;
                }

                const tentativeGCost = currentNavPoint.gCost + Nav.getDistanceCost(currentNavPoint.position, neighbor.position);

                if (!openList.includes(neighbor)) {
                    openList.push(neighbor);
                } else if (tentativeGCost >= neighbor.gCost) {
                    continue;
                }

                neighbor.parent = currentNavPoint;
                neighbor.gCost = tentativeGCost;
                neighbor.hCost = Nav.getHeuristicCost(neighbor.position, targetPos);
                neighbor.fCost = neighbor.gCost + neighbor.hCost;
            }
        }

        // No path found
        return [];
    }

    private static getHeuristicCost(pos1: Vector, pos2: Vector): number {
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y) + Math.abs(pos1.z - pos2.z);
    }

    private static getDistanceCost(pos1: Vector, pos2: Vector): number {
        return subVector(pos1, pos2).Length();
    }

    private static intersectsObstacle(start: Vector, end: Vector, navPoints: NavPoint[]): boolean {
        for (const navPoint of navPoints) {
            if (navPoint.navType === NavType.Obstacle) {
                const center = navPoint.position;
                const radius = 30; // Obstacle radius

                const line = subVector(end, start)
                const lineLength = line.Length();
                const unitLine = line.Normalized();

                const projection = subVector(center, start).Dot(unitLine);

                if (projection >= 0 && projection <= lineLength) {
                    const closestPoint = addVector(start, mulVector(unitLine, projection as Vector));
                    const distance = subVector(closestPoint, center).Length();
                    if (distance <= radius) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private static getWalkableNeighbors(navPoint: NavPoint, navPoints: NavPoint[]): NavPoint[] {
        const neighbors: NavPoint[] = [];
        const searchRadiusXY = 500.0;
        const searchRadiusZ = 30.0;

        for (const otherPoint of navPoints) {
            if (otherPoint === navPoint || otherPoint.navType === NavType.Obstacle) {
                continue;
            }

            const dx = Math.abs(navPoint.position.x - otherPoint.position.x);
            const dy = Math.abs(navPoint.position.y - otherPoint.position.y);
            const dz = Math.abs(navPoint.position.z - otherPoint.position.z);

            if (dx <= searchRadiusXY && dy <= searchRadiusXY && dz <= searchRadiusZ) {
                neighbors.push(otherPoint);
            }
        }

        neighbors.sort((a, b) => {
            const distA = subVector(navPoint.position, a.position).Length();
            const distB = subVector(navPoint.position, b.position).Length();
            return distA - distB;
        });

        return neighbors.slice(0, 9);
    }

    private static reconstructPath(navPoint: NavPoint): NavPoint[] {
        const path: NavPoint[] = [];
        let current: NavPoint | null = navPoint;

        while (current) {
            path.unshift(current);
            current = current.parent;
        }

        return path;
    }
}
