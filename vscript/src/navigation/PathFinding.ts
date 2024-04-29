import {NavArea, NavAreaConnection} from "./NavData";

export function DebugDrawNavArea(area: NavArea, navMesh: NavArea[], durationSeconds: number): void {
    for (let i = 0; i < area.polygons.length; i++) {
        DebugDrawLine(area.polygons[i], area.polygons[(i + 1) % area.polygons.length], 0, 255, 0, false, durationSeconds);
    }

    for (let dir = 0; dir < area.connections.length; dir++) {
        DebugDrawText(addVector(area.polygons[dir], Vector(0, 0, 15)), "" + dir, false, durationSeconds);

        for (let i = 0; i < area.connections[dir].length; i++) {
            const connection = area.connections[dir][i];
            const neighbor = navMesh.find((area) => area.id === connection.areaID);
            if (!neighbor) continue;

            for (let i = 0; i < neighbor.polygons.length; i++) {
                DebugDrawLine(neighbor.polygons[i], neighbor.polygons[(i + 1) % neighbor.polygons.length], 255, 0, 0, false, durationSeconds);
            }
            
            const edgeIndex = connection.edgeIndex;
            const areaEdge = [area.polygons[edgeIndex], area.polygons[(edgeIndex + 1) % area.polygons.length]];
            const neighborEdge = [neighbor.polygons[edgeIndex], neighbor.polygons[(edgeIndex + 1) % neighbor.polygons.length]];
            DebugDrawLine(neighbor.polygons[edgeIndex], addVector(neighbor.polygons[edgeIndex], Vector(0, 0, 5)), 255, 0, 0, false, durationSeconds);
            DebugDrawText(addVector(neighbor.polygons[edgeIndex], Vector(0, 0, 5)), "" + edgeIndex, false, durationSeconds);
        }

    }
}


function isPointInPolygon(point: Vector, polygon: Vector[]): boolean {
    const zToleranceLow = point.z - 30;
    const zToleranceHigh = point.z + 100;

    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x;
        const yi = polygon[i].y;
        const zi = polygon[i].z;

        const xj = polygon[j].x;
        const yj = polygon[j].y;
        const zj = polygon[j].z;

        const intersect =
            ((yi > point.y) !== (yj > point.y)) &&
            (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi) &&
            (zi <= zToleranceHigh && zi >= zToleranceLow) &&
            (zj <= zToleranceHigh && zj >= zToleranceLow);

        if (intersect) {
            inside = !inside;
        }
    }
    return inside;
}

export function findAreaForPosition(position: Vector, navMesh: NavArea[]): NavArea | undefined {
    for (const area of navMesh) {
        if (isPointInPolygon(position, area.polygons)) {
            return area;
        }
    }
    return undefined;
}


interface NavNode {
    id: number;
    position: Vector;
    parent?: NavNode;
    g: number;
    h: number;
    f: number;
}

function getClosestPointOnEdge(edgeStart: Vector, edgeEnd: Vector, point: Vector): Vector {
    const edgeDirection = subVector(edgeEnd, edgeStart).Normalized();
    const edgeLength = VectorDistance(edgeStart, edgeEnd);
    const dotProduct = subVector(point, edgeStart).Dot(edgeDirection);
    const clampedDotProduct = Math.min(Math.max(dotProduct, 0), edgeLength);
    return addVector(edgeStart, mulVector(edgeDirection, Vector(clampedDotProduct, clampedDotProduct, clampedDotProduct)));
}

function getOptimalTransitionPoint(currentArea: NavArea, neighborArea: NavArea, direction: number, connection: NavAreaConnection, targetPosition: Vector): Vector {
    const currentEdgeStart = currentArea.polygons[direction];
    const currentEdgeEnd = currentArea.polygons[(direction + 1) % 4];

    const neighborEdgeIndex = connection.edgeIndex;
    const neighborEdgeStart = neighborArea.polygons[neighborEdgeIndex];
    const neighborEdgeEnd = neighborArea.polygons[(neighborEdgeIndex + 1) % 4];

    const currentEdgeMidpoint = addVector(currentEdgeStart, mulVector(subVector(currentEdgeEnd, currentEdgeStart), Vector(0.5, 0.5, 0.5)));
    const neighborEdgeMidpoint = addVector(neighborEdgeStart, mulVector(subVector(neighborEdgeEnd, neighborEdgeStart), Vector(0.5, 0.5, 0.5)));

    const pathDirection = subVector(targetPosition, currentEdgeMidpoint).Normalized();
    const projectedPoint = addVector(currentEdgeMidpoint, mulVector(pathDirection, Vector(VectorDistance(currentEdgeMidpoint, neighborEdgeMidpoint), VectorDistance(currentEdgeMidpoint, neighborEdgeMidpoint), VectorDistance(currentEdgeMidpoint, neighborEdgeMidpoint))));

    const transitionPoint = getClosestPointOnEdge(neighborEdgeStart, neighborEdgeEnd, projectedPoint);

    return transitionPoint;
}

function reconstructPath(currentNode: NavNode): Vector[] {
    const path: Vector[] = [];
    let node: NavNode | undefined = currentNode;

    while (node) {
        path.unshift(node.position);
        node = node.parent;
    }

    return path;
}

export function findPath(startPos: Vector, endPos: Vector, navMesh: NavArea[]): Vector[] {
    const startArea = findAreaForPosition(startPos, navMesh);
    const endArea = findAreaForPosition(endPos, navMesh);

    if (!startArea || !endArea) {
        return [];
    }

    if (startArea.id === endArea.id) {
        return [startPos, endPos];
    }

    const openSet: NavNode[] = [];
    const closedSet: NavNode[] = [];

    const startNode: NavNode = {
        id: startArea.id,
        position: startPos,
        g: 0,
        h: VectorDistance(startPos, endPos),
        f: VectorDistance(startPos, endPos),
    };

    openSet.push(startNode);

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const currentNode = openSet.shift()!;

        if (currentNode.id === endArea.id) {
            const path = reconstructPath(currentNode);
            path.push(endPos);
            return path;
        }

        closedSet.push(currentNode);

        const currentArea = navMesh.find((area) => area.id === currentNode.id)!;
        for (let i = 0; i < currentArea.connections.length; i++) {
            const connections = currentArea.connections[i];
            for (const connection of connections) {
                const neighborArea = navMesh.find((area) => area.id === connection.areaID)!;
                if (closedSet.some((node) => node.id === neighborArea.id)) {
                    continue;
                }

                const transitionPoint = getOptimalTransitionPoint(currentArea, neighborArea, i, connection, endPos);
                const gScore = currentNode.g + VectorDistance(currentNode.position, transitionPoint);
                const hScore = VectorDistance(transitionPoint, endPos);
                const fScore = gScore + hScore;

                const existingNode = openSet.find((node) => node.id === neighborArea.id);
                if (existingNode) {
                    if (gScore < existingNode.g) {
                        existingNode.position = transitionPoint;
                        existingNode.parent = currentNode;
                        existingNode.g = gScore;
                        existingNode.h = hScore;
                        existingNode.f = fScore;
                    }
                } else {
                    const neighborNode: NavNode = {
                        id: neighborArea.id,
                        position: transitionPoint,
                        parent: currentNode,
                        g: gScore,
                        h: hScore,
                        f: fScore,
                    };
                    openSet.push(neighborNode);
                }
            }
        }
    }

    return [];
}
