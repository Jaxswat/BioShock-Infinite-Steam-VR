export interface NavArea {
    // Area ID
    id: number;
    // Area Attributes. Not used for now.
    attributes: number;
    // The shape of the area. For now most areas have 4 vertices that form a quad.
    // They're in this order: NW = 0, SW = 1, SE = 2, NE = 3.
    polygons: Vector[];
    // The other areas that this area is connected to.
    // Outer array is always 4 elements long: North, East, South, West.
    // Inner array contains all connections in the respective direction.
    connections: NavAreaConnection[][];
}

// Points to an Area and includes which edge is connected.
export interface NavAreaConnection {
    // The area ID that the parent area is connected to.
    areaID: number;
    // The edge index that is connected to the parent area.
    // Same ordering as NavArea.polygons
    edgeIndex: number;
}
