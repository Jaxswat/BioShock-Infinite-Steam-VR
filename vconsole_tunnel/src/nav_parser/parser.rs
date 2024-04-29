use std::fs::File;
use std::io::{BufReader, Seek, SeekFrom};
use std::path::Path;
use std::process::exit;
use crate::math::Vector3;
use crate::nav_parser::nav::{MAGIC_PREFIX, NavArea, NavAreaConnectionData, NavData, STEAM_VR_HOME_NAV_SUB_VERSION, STEAM_VR_HOME_NAV_VERSION};
use crate::nav_parser::read::*;

pub fn open(path: &str) -> Option<NavData> {
    let mut nav_data = NavData::default();

    let nav_file_path = Path::new(path);
    let file = File::open(&nav_file_path).unwrap_or_else(|err| {
        eprintln!("Failed to open nav file: {}", err);
        exit(1);
    });
    let mut reader = BufReader::new(file);

    nav_data.magic = read_u32(&mut reader).unwrap();
    if nav_data.magic != MAGIC_PREFIX {
        eprintln!("Invalid nav magic number: 0x{:X} expected: 0x{:X}", nav_data.magic, MAGIC_PREFIX);
        return None;
    }

    nav_data.version = read_u32(&mut reader).unwrap();
    if nav_data.version != STEAM_VR_HOME_NAV_VERSION {
        eprintln!("Unexpected nav file version: {}, expected: {}", nav_data.version, STEAM_VR_HOME_NAV_VERSION);
        return None;
    }

    nav_data.sub_version = read_u32(&mut reader).unwrap();
    if nav_data.sub_version != STEAM_VR_HOME_NAV_SUB_VERSION {
        eprintln!("Unexpected nav file subversion: {}, expected: {}", nav_data.sub_version, STEAM_VR_HOME_NAV_SUB_VERSION);
        return None;
    }

    nav_data.is_analyzed = read_u8(&mut reader).unwrap() == 1;
    nav_data.place_count = read_u16(&mut reader).unwrap();
    nav_data.has_unnamed_areas = read_u8(&mut reader).unwrap() == 1;

    nav_data.area_count = read_u32(&mut reader).unwrap();
    nav_data.nav_areas.reserve(nav_data.area_count as usize);

    for i in 0..nav_data.area_count {
        let mut nav_area = NavArea::default();
        nav_area.id = read_u32(&mut reader).unwrap();
        nav_area.attributes = read_u32(&mut reader).unwrap();
        reader.seek(SeekFrom::Current(5)).unwrap(); // Skip unknown data (it's usually empty)

        nav_area.polygon_count = read_u32(&mut reader).unwrap();
        for _ in 0..nav_area.polygon_count {
            let x = read_f32(&mut reader).unwrap() as f64;
            let y = read_f32(&mut reader).unwrap() as f64;
            let z = read_f32(&mut reader).unwrap() as f64;
            nav_area.polygons.push(Vector3::new(x, y, z));
        }

        reader.seek(SeekFrom::Current(4)).unwrap(); // Skip unknown data (it's also usually empty)

        for connection in nav_area.connections.iter_mut() {
            connection.connection_count = read_u32(&mut reader).unwrap();
            connection.connections.reserve(connection.connection_count as usize);

            for _ in 0..connection.connection_count {
                let mut connection_data = NavAreaConnectionData::default();
                connection_data.area_id = read_u32(&mut reader).unwrap();
                connection_data.edge_index = read_u32(&mut reader).unwrap();
                connection.connections.push(connection_data);
            }
        }

        nav_data.nav_areas.push(nav_area);

        // Skip unknown data
        // I think this contains info for ladders and such, but I don't care about that.
        // If your nav has ladders it will likely break the parser when it tries to read the next area.
        // Based on the nav text format, there's still two directions for ladders (UP/DOWN).
        // Nobody is climbing ladders in SteamVR Home though...
        reader.seek(SeekFrom::Current(13)).unwrap();
    }

    // There's some other junk at the end of this file which I don't care about.

    Some(nav_data)
}

#[cfg(test)]
mod tests {
    use crate::nav_parser::nav::NAV_CONNECTION_DIRECTIONS;
    use super::*;

    #[test]
    fn test_open() {
        let nav_data = open("battleship_bay.nav");
        assert_eq!(nav_data.is_some(), true);

        let nav_data = nav_data.unwrap();
        assert_eq!(nav_data.magic, MAGIC_PREFIX);
        assert_eq!(nav_data.version, STEAM_VR_HOME_NAV_VERSION);
        assert_eq!(nav_data.sub_version, STEAM_VR_HOME_NAV_SUB_VERSION);
        assert_eq!(nav_data.is_analyzed, true);
        assert_eq!(nav_data.place_count, 0);
        assert_eq!(nav_data.has_unnamed_areas, true);
        assert_eq!(nav_data.area_count, 2105);
        assert_eq!(nav_data.nav_areas.len(), nav_data.area_count as usize);

        // If you can read to the end of the file, you probably did alright
        let nav_area = &nav_data.nav_areas[nav_data.area_count as usize - 1];
        assert_eq!(nav_area.id, 3350);
        assert_eq!(nav_area.attributes, 0);
        assert_eq!(nav_area.polygon_count, 4);
        assert_eq!(nav_area.polygons.len(), 4);
        assert_eq!(nav_area.connections.len(), NAV_CONNECTION_DIRECTIONS);

        let connection = &nav_area.connections[0];
        assert_eq!(connection.connection_count, 1);
        assert_eq!(connection.connections.len(), connection.connection_count as usize);
    }
}
