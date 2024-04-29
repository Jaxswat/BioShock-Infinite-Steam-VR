interface NavArea {
    id: number;
    attributes: number;
    polygons: Vector[];
    connections: NavAreaConnection[][]; // Outer array is always 4 elements long: North, East, South, West.
}

interface NavAreaConnection {
    areaID: number;
    edgeIndex: number;
}
