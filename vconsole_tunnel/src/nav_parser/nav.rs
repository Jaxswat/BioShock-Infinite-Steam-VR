use crate::math::Vector3;

/// Magic prefix for nav files.
/// Edit: Had to swap endianness and just realized Valve was being goofy...Feed face!
pub const MAGIC_PREFIX: u32 = 0xFEEDFACE;

/// Nav file version for SteamVR Home.
pub const STEAM_VR_HOME_NAV_VERSION: u32 = 30;

/// Nav file subversion for SteamVR Home.
pub const STEAM_VR_HOME_NAV_SUB_VERSION: u32 = 0;

/// NavMesh has all the info about the nav file.
/// Valve docs were decent, but SteamVR Home uses a new version of the nav file (Version 30)
/// Had to reverse engineer some of the new polygon based nav data.
#[derive(Debug, Default)]
pub struct NavData {
    pub magic: u32,
    pub version: u32,
    pub sub_version: u32,
    pub is_analyzed: bool,
    pub place_count: u16,
    pub has_unnamed_areas: bool,
    pub area_count: u32,
    pub nav_areas: Vec<NavArea>,
}

/// NavArea has all the info about the nav area.
/// Half-Life: Alyx appears to be using Recast for navigation
/// SteamVR Home is still using the old Source engine nav file format, with the addition of polygon based nav data.
/// Areas are no longer limited to planes, they are now defined by a list of vertices.
/// Each area has a list of connections to other areas, and each connection contains a reference to the edge.
#[derive(Debug, Default)]
pub struct NavArea {
    /// ID of the area. Starts at 1.
    pub id: u32,
    /// Attributes of the area. Might be able to repurpose these for custom attributes.
    pub attributes: u32,
    pub polygon_count: u32,
    pub polygons: Vec<Vector3>,
    /// Connections to other areas.
    /// Array index goes clockwise: NORTH, EAST, SOUTH, WEST
    pub connections: [NavAreaConnection; NAV_CONNECTION_DIRECTIONS],
}

/// Number of directions that a nav area can connect to.
/// Clockwise: NORTH, EAST, SOUTH, WEST
pub const NAV_CONNECTION_DIRECTIONS: usize = 4;

#[derive(Debug, Default)]
pub struct NavAreaConnection {
    pub connection_count: u32,
    pub connections: Vec<NavAreaConnectionData>,
}

#[derive(Debug, Default)]
pub struct NavAreaConnectionData {
    /// The area ID that this connection is connected to.
    pub area_id: u32,
    /// The edge index that this connection is connected to.
    /// This could also be the polygon index.
    pub edge_index: u32,
}
