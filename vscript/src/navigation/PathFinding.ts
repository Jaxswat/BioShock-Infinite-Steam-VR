import { NavArea, NavAreaConnection } from "./NavData";

interface PathNode {
    areaID: number;
    position: Vector;
    parent: PathNode | null;
}

function heuristic(a: Vector, b: Vector): number {
    return VectorDistance(a, b);
}

export function findPath(startPos: Vector, endPos: Vector, navMesh: NavArea[]): PathNode[] {
    const startArea = findAreaForPosition(startPos, navMesh);
    const endArea = findAreaForPosition(endPos, navMesh);

    if (!startArea || !endArea) {
        return [];
    }

    if (startArea.id === endArea.id) {
        return [
            { areaID: startArea.id, position: startPos, parent: null },
            { areaID: endArea.id, position: endPos, parent: null },
        ];
    }

    const openSet: PathNode[] = [];
    const closedSet: PathNode[] = [];

    const startNode: PathNode = {
        areaID: startArea.id,
        position: startPos,
        parent: null,
    };

    openSet.push(startNode);

    while (openSet.length > 0) {
        const currentNode = openSet.reduce((prev, current) => (heuristic(prev.position, endPos) < heuristic(current.position, endPos) ? prev : current));
        const currentArea = navMesh.find((area) => area.id === currentNode.areaID);

        if (currentArea?.id === endArea.id) {
            const path: PathNode[] = [];
            let current: PathNode | null = currentNode;
            while (current) {
                path.unshift(current);
                current = current.parent;
            }
            path.push({ areaID: endArea.id, position: endPos, parent: path[path.length - 1] });
            return optimizePath(path, navMesh);
        }

        openSet.splice(openSet.indexOf(currentNode), 1);
        closedSet.push(currentNode);

        for (let i = 0; i < currentArea!.connections.length; i++) {
            const connections = currentArea!.connections[i];
            for (const connection of connections) {
                const neighborArea = navMesh.find((area) => area.id === connection.areaID);
                if (!neighborArea) continue;

                const entryPoint = findEntryPoint(currentNode.position, currentArea!, neighborArea, connection.edgeIndex);
                const neighborNode: PathNode = {
                    areaID: neighborArea.id,
                    position: entryPoint,
                    parent: currentNode,
                };

                if (closedSet.some((node) => node.areaID === neighborNode.areaID)) {
                    continue;
                }

                if (!openSet.some((node) => node.areaID === neighborNode.areaID)) {
                    openSet.push(neighborNode);
                }
            }
        }
    }

    return [];
}

function findAreaForPosition(position: Vector, navMesh: NavArea[]): NavArea | undefined {
    return navMesh.find((area) => isPointInPolygon(position, area.polygons));
}

function findEntryPoint(currentPosition: Vector, fromArea: NavArea, toArea: NavArea, edgeIndex: number): Vector {
    const fromEdge = [fromArea.polygons[edgeIndex], fromArea.polygons[(edgeIndex + 1) % fromArea.polygons.length]];

    let closestDistance = Infinity;
    let closestPoint = Vector();

    for (let i = 0; i < toArea.polygons.length; i++) {
        const toEdge = [toArea.polygons[i], toArea.polygons[(i + 1) % toArea.polygons.length]];
        const projectedPoint = projectPointOnLineSegment(currentPosition, fromEdge[0], fromEdge[1]);
        const entryPoint = projectPointOnLineSegment(projectedPoint, toEdge[0], toEdge[1]);
        const distance = VectorDistance(currentPosition, entryPoint);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestPoint = entryPoint;
        }
    }

    return closestPoint;
}

function projectPointOnLineSegment(point: Vector, lineStart: Vector, lineEnd: Vector): Vector {
    const lineDirection = subVector(lineEnd, lineStart).Normalized();
    const projectedDistance = subVector(point, lineStart).Dot(lineDirection);
    const clampedDistance = Math.max(0, Math.min(projectedDistance, VectorDistance(lineStart, lineEnd)));
    return addVector(lineStart, mulVector(lineDirection, clampedDistance as Vector));
}

function isPointInPolygon(point: Vector, polygon: Vector[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x;
        const yi = polygon[i].y;
        const xj = polygon[j].x;
        const yj = polygon[j].y;

        const intersect = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
}

function optimizePath(path: PathNode[], navMesh: NavArea[]): PathNode[] {
    const optimizedPath: PathNode[] = [path[0]];

    for (let i = 1; i < path.length - 1; i++) {
        const currentNode = path[i];
        const nextNode = path[i + 1];

        if (currentNode.areaID === nextNode.areaID) {
            continue;
        }

        const currentArea = navMesh.find((area) => area.id === currentNode.areaID);
        const nextArea = navMesh.find((area) => area.id === nextNode.areaID);

        if (currentArea && nextArea) {
            const connection = currentArea.connections.flat().find((conn) => conn.areaID === nextArea.id);
            if (connection) {
                const entryPoint = findEntryPoint(currentNode.position, currentArea, nextArea, connection.edgeIndex);
                const exitPoint = findExitPoint(entryPoint, nextArea, nextNode.position);
                optimizedPath.push({ areaID: nextArea.id, position: entryPoint, parent: optimizedPath[optimizedPath.length - 1] });
                optimizedPath.push({ areaID: nextArea.id, position: exitPoint, parent: optimizedPath[optimizedPath.length - 1] });
            }
        }
    }

    optimizedPath.push(path[path.length - 1]);

    return optimizedPath;
}

function findExitPoint(entryPoint: Vector, area: NavArea, targetPosition: Vector): Vector {
    let closestDistance = Infinity;
    let closestPoint = Vector();

    for (let i = 0; i < area.polygons.length; i++) {
        const edge = [area.polygons[i], area.polygons[(i + 1) % area.polygons.length]];
        const projectedPoint = projectPointOnLineSegment(targetPosition, edge[0], edge[1]);
        const distance = VectorDistance(entryPoint, projectedPoint);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestPoint = projectedPoint;
        }
    }

    return closestPoint;
}