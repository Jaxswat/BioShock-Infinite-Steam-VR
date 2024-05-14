import {
    NavArea,
    NavDir,
    NAV_DIRECTION_COUNT,
} from "./NavArea";
import {TheNavMesh} from "./NavMesh";

export function DebugDrawNavArea(area: NavArea, durationSeconds: number): void {
    for (let i = 0; i < area.getPolygon().length; i++) {
        const start = area.getCorner(i);
        const end = area.getCorner((i + 1) % area.getPolygon().length);
        const mid = VectorLerp(0.5, start, end);
        DebugDrawText(addVector(mid, Vector(0, 0, 10)), "dir: " + i, true, durationSeconds);
        DebugDrawLine(start, end, 0, 255, 0, false, durationSeconds);
    }

    for (let dir = 0; dir < area.getConnectionDirs().length; dir++) {
        DebugDrawText(addVector(area.getCorner(dir), Vector(0, 0, 15)), "" + dir, false, durationSeconds);

        for (let i = 0; i < area.getConnections(dir).length; i++) {
            const connection = area.getConnections(dir)[i];
            const neighbor = connection.area;
            if (!neighbor) continue;

            for (let i = 0; i < neighbor.getPolygon().length; i++) {
                DebugDrawLine(neighbor.getCorner(i), neighbor.getCorner((i + 1) % neighbor.getPolygon().length), 255, 0, 0, false, durationSeconds);
            }

            const edgeIndex = connection.edgeIndex;
            const areaEdge = [area.getCorner(edgeIndex), area.getCorner((edgeIndex + 1) % area.getPolygon().length)];
            const neighborEdge = [neighbor.getPolygon()[edgeIndex], neighbor.getPolygon()[(edgeIndex + 1) % neighbor.getPolygon().length]];
            DebugDrawLine(neighbor.getPolygon()[edgeIndex], addVector(neighbor.getPolygon()[edgeIndex], Vector(0, 0, 5)), 255, 0, 0, false, durationSeconds);
            DebugDrawText(addVector(neighbor.getPolygon()[edgeIndex], Vector(0, 0, 5)), "" + edgeIndex, false, durationSeconds);
        }

    }
}

interface PathNode {
    area: NavArea;
    parent: PathNode | null;
    gScore: number;
    hScore: number;
    fScore: number;
}

function heuristic(a: NavArea, b: NavArea): number {
    return VectorDistance(a.getCenter(), b.getCenter());
}

// triArea2 computes the twice signed area of the triangle formed by a, b, and c
function triArea2(a: Vector, b: Vector, c: Vector): number {
    const ax = b.x - a.x;
    const ay = b.y - a.y;
    const bx = c.x - a.x;
    const by = c.y - a.y;
    return bx * ay - ax * by;
}

function findEdgeOverlap(
    edgeAStart: Vector,
    edgeAEnd: Vector,
    edgeBStart: Vector,
    edgeBEnd: Vector
): [Vector, Vector] | null {
    const epsilon = 1e-6;

    const edgeADir = subVector(edgeAEnd, edgeAStart);
    const edgeBDir = subVector(edgeBEnd, edgeBStart);

    const crossProduct = edgeADir.Cross(edgeBDir);
    if (Math.abs(crossProduct.x) < epsilon &&
        Math.abs(crossProduct.y) < epsilon &&
        Math.abs(crossProduct.z) < epsilon) {

        const dotA = edgeADir.Dot(edgeADir);
        const dotB = edgeADir.Dot(edgeBDir);
        const t1 = divVector(edgeADir.Dot(subVector(edgeBStart, edgeAStart)) as Vector, dotA as Vector);
        const t2 = divVector(edgeADir.Dot(subVector(edgeBEnd, edgeAStart)) as Vector, dotA as Vector);

        const tMin = Math.max(0, Math.min(t1, t2));
        const tMax = Math.min(1, Math.max(t1, t2));

        if (tMin <= tMax) {
            const overlapStart = addVector(edgeAStart, mulVector(edgeADir, tMin as Vector));
            overlapStart.z = edgeAStart.z;
            const overlapEnd = addVector(edgeAStart, mulVector(edgeADir, tMax as Vector));
            overlapEnd.z = edgeAStart.z;
            return [overlapStart, overlapEnd];
        }
    }

    return null;
}

// Funnel this, funnel that, optimize path.
// http://digestingduck.blogspot.com/2010/03/simple-stupid-funnel-algorithm.html
function simpleStupidFunnelAlgorithm(path: NavArea[], startPos: Vector, endPos: Vector, margin: number): Vector[] {
    const points: Vector[] = [];
    points.push(startPos);

    let portalApex = startPos;
    let portalLeft = startPos;
    let portalRight = startPos;

    let apexIndex = 0;
    let leftIndex = 0;
    let rightIndex = 0;

    for (let i = 1; i < path.length; ++i) {
        const currentArea = path[i - 1];
        const nextArea = path[i];

        const connectionDir = currentArea.getConnectionDirectionByID(nextArea.getID())!;

        let leftMargin = Vector();
        let rightMargin = Vector();

        let leftCorner: number = 0;
        let rightCorner: number = 0;
        if (connectionDir === NavDir.North) {
            leftCorner = 1;
            rightCorner = 0;
            leftMargin = Vector(-margin, 0, 0);
            rightMargin = Vector(margin, 0, 0);
        } else if (connectionDir === NavDir.South) {
            leftCorner = 3;
            rightCorner = 2;
            leftMargin = Vector(margin, 0, 0);
            rightMargin = Vector(-margin, 0, 0);
        } else if (connectionDir === NavDir.East) {
            leftCorner = 2;
            rightCorner = 1;
            leftMargin = Vector(0, -margin, 0);
            rightMargin = Vector(0, margin, 0);
        } else if (connectionDir === NavDir.West) {
            leftCorner = 0;
            rightCorner = 3;
            leftMargin = Vector(0, margin, 0);
            rightMargin = Vector(0, -margin, 0);
        }

        let left = addVector(currentArea.getCorner(leftCorner), leftMargin);
        let right = addVector(currentArea.getCorner(rightCorner), rightMargin);

        const opConnectionDir = nextArea.getConnectionDirectionByID(currentArea.getID())!;
        let opLeftCorner: number = 0;
        let opRightCorner: number = 0;
        if (opConnectionDir === NavDir.North) {
            opLeftCorner = 1;
            opRightCorner = 0;
            leftMargin = Vector(-margin, 0, 0);
            rightMargin = Vector(margin, 0, 0);
        } else if (opConnectionDir === NavDir.South) {
            opLeftCorner = 3;
            opRightCorner = 2;
            leftMargin = Vector(margin, 0, 0);
            rightMargin = Vector(-margin, 0, 0);
        } else if (opConnectionDir === NavDir.East) {
            opLeftCorner = 2;
            opRightCorner = 1;
            leftMargin = Vector(0, -margin, 0);
            rightMargin = Vector(0, margin, 0);
        } else if (opConnectionDir === NavDir.West) {
            opLeftCorner = 0;
            opRightCorner = 3;
            leftMargin = Vector(0, margin, 0);
            rightMargin = Vector(0, -margin, 0);
        }

        const opLeft = addVector(nextArea.getCorner(opLeftCorner), leftMargin);
        const opRight = addVector(nextArea.getCorner(opRightCorner), rightMargin);

        const overlappedEdge = findEdgeOverlap(left, right, opLeft, opRight);
        if (overlappedEdge?.length === 2) {
            const overlappedLeft = overlappedEdge[0];
            const overlappedRight = overlappedEdge[1];
            left = overlappedLeft;
            right = overlappedRight;
        } else {
            const edgeA = VectorDistance(left, right);
            const edgeB = VectorDistance(opLeft, opRight);
            if (edgeA > edgeB) {
                left = opLeft;
                right = opRight;
            }
        }

        // Update right vertex
        if (triArea2(portalApex, portalRight, right) <= 0.0) {
            if ((portalApex === portalRight) || triArea2(portalApex, portalLeft, right) > 0.0) {
                // Tighten the funnel
                portalRight = right;
                rightIndex = i;
            } else {
                // Right crossed left, insert left to path and restart scan from portal left point
                points.push(portalLeft);
                // Make current left the new apex
                portalApex = portalLeft;
                apexIndex = leftIndex;
                // Reset portal
                portalLeft = portalApex;
                portalRight = portalApex;
                leftIndex = apexIndex;
                rightIndex = apexIndex;
                // Restart scan
                i = apexIndex;
                continue;
            }
        }

        // Update left vertex
        if (triArea2(portalApex, portalLeft, left) >= 0.0) {
            if ((portalApex === portalLeft) || triArea2(portalApex, portalRight, left) < 0.0) {
                // Tighten the funnel
                portalLeft = left;
                leftIndex = i;
            } else {
                // Left crossed right, insert right to path and restart scan from portal right point
                points.push(portalRight);
                // Make current right the new apex
                portalApex = portalRight;
                apexIndex = rightIndex;
                // Reset portal
                portalLeft = portalApex;
                portalRight = portalApex;
                leftIndex = apexIndex;
                rightIndex = apexIndex;
                // Restart scan
                i = apexIndex;
                continue;
            }
        }
    }

    // Append last point to path
    points.push(endPos);

    // If no funneled path found, return ugly path
    if (points.length === 2) {
        const uglyPath = path.map(area => area.getCenter());
        if (uglyPath.length >= 2) {
            uglyPath[0] = startPos;
            uglyPath[uglyPath.length - 1] = endPos;
        }

        return uglyPath;
    }

    return points;
}

function reconstructPath(startPos: Vector, endPos: Vector, endNode: PathNode): NavArea[] {
    const path: NavArea[] = [];
    let currentNode: PathNode | null = endNode;

    while (currentNode !== null) {
        path.unshift(currentNode.area);
        currentNode = currentNode.parent;
    }

    return path;
}

export function findPath(startPos: Vector, endPos: Vector, margin: number = 10): Vector[] {
    let startArea = TheNavMesh.getAreaByPosition(startPos);
    let endArea = TheNavMesh.getAreaByPosition(endPos);

    if (!startArea) {
        startArea = TheNavMesh.getClosestArea(startPos);
    }
    if (!endArea) {
        endArea = TheNavMesh.getClosestArea(endPos);
    }

    if (!startArea || !endArea) {
        return [];
    }

    if (startArea === endArea) {
        return [startPos, endPos];
    }

    const openSet = new Set<number>();
    const closedSet = new Set<number>();
    const gScores = new Map<number, number>();
    const fScores = new Map<number, number>();
    const cameFrom = new Map<number, PathNode>();

    const startAreaID = startArea.getID()
    const endAreaID = endArea.getID()
    openSet.add(startAreaID);
    gScores.set(startAreaID, 0);
    fScores.set(startAreaID, heuristic(startArea, endArea));

    while (openSet.size > 0) {
        let currentAreaID: number = -1;
        let currentArea: NavArea | null = null;
        let currentFScore = Infinity;

        for (const areaID of openSet) {
            const area = TheNavMesh.getAreaByID(areaID)!;
            const fScore = fScores.get(areaID) || Infinity;
            if (fScore < currentFScore) {
                currentAreaID = areaID;
                currentArea = area;
                currentFScore = fScore;
            }
        }

        if (!currentArea) {
            break;
        }

        if (currentAreaID === endAreaID) {
            const endNode: PathNode = {
                area: endArea,
                parent: cameFrom.get(endAreaID) || null,
                gScore: gScores.get(endAreaID) || 0,
                hScore: 0,
                fScore: currentFScore,
            };

            const path = reconstructPath(startPos, endPos, endNode);
            return simpleStupidFunnelAlgorithm(path, startPos, endPos, margin);
        }

        openSet.delete(currentAreaID);
        closedSet.add(currentAreaID);

        for (let dir = 0; dir < NAV_DIRECTION_COUNT; dir++) {
            const connections = currentArea.getConnections(dir);

            for (const neighbor of connections) {
                const neighborArea = neighbor.area;
                const neighborAreaID = neighborArea.getID();
                if (closedSet.has(neighborAreaID)) {
                    continue;
                }

                const tentativeGScore = (gScores.get(currentAreaID) || 0) + VectorDistance(currentArea.getCenter(), neighborArea.getCenter());

                if (!openSet.has(neighborAreaID)) {
                    openSet.add(neighborAreaID);
                } else if (tentativeGScore >= (gScores.get(neighborAreaID) || 0)) {
                    continue;
                }

                cameFrom.set(neighborAreaID, {
                    area: currentArea,
                    parent: cameFrom.get(currentAreaID) || null,
                    gScore: tentativeGScore,
                    hScore: heuristic(neighborArea, endArea),
                    fScore: tentativeGScore + heuristic(neighborArea, endArea)
                });

                gScores.set(neighborAreaID, tentativeGScore);
                fScores.set(neighborAreaID, tentativeGScore + heuristic(neighborArea, endArea));
            }
        }
    }

    return [];
}
