export interface NavArea {
    // Area ID
    id: number;
    // Area Attributes. Not used for now.
    attributes: number;
    // The shape of the area. For now most areas have 4 vertices that form a quad.
    polygons: Vector[];
    // The other areas that this area is connected to.
    // Outer array is always 4 elements long: North, East, South, West.
    // Inner array contains all connections in that direction.
    connections: NavAreaConnection[][];
}

export interface NavAreaConnection {
    // The ID of the area this connection leads to.
    areaID: number;
    // The index of the edge of the area this connection leads to.
    edgeIndex: number;
}
