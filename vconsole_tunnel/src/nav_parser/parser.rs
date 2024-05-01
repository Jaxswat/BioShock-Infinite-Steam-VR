use std::fs::File;
use std::io::{BufReader, Seek, SeekFrom};
use std::path::Path;
use std::process::exit;
use crate::math::Vector3;
use crate::nav_parser::nav::{MAGIC_PREFIX, NavArea, NavAreaConnectionData, NavFile, STEAM_VR_HOME_NAV_SUB_VERSION, STEAM_VR_HOME_NAV_VERSION};
use crate::nav_parser::read::*;

pub fn open(path: &str) -> Option<NavFile> {
    let mut nav_file = NavFile::default();

    let nav_file_path = Path::new(path);
    let file = File::open(&nav_file_path).unwrap_or_else(|err| {
        eprintln!("Failed to open nav file: {}", err);
        exit(1);
    });
    let mut reader = BufReader::new(file);

    nav_file.magic = read_u32(&mut reader).unwrap();
    if nav_file.magic != MAGIC_PREFIX {
        eprintln!("Invalid nav magic number: 0x{:X} expected: 0x{:X}", nav_file.magic, MAGIC_PREFIX);
        return None;
    }

    nav_file.version = read_u32(&mut reader).unwrap();
    if nav_file.version != STEAM_VR_HOME_NAV_VERSION {
        eprintln!("Unexpected nav file version: {}, expected: {}", nav_file.version, STEAM_VR_HOME_NAV_VERSION);
        return None;
    }

    nav_file.sub_version = read_u32(&mut reader).unwrap();
    if nav_file.sub_version != STEAM_VR_HOME_NAV_SUB_VERSION {
        eprintln!("Unexpected nav file subversion: {}, expected: {}", nav_file.sub_version, STEAM_VR_HOME_NAV_SUB_VERSION);
        return None;
    }

    nav_file.is_analyzed = read_u8(&mut reader).unwrap() == 1;
    nav_file.place_count = read_u16(&mut reader).unwrap();
    nav_file.has_unnamed_areas = read_u8(&mut reader).unwrap() == 1;

    let area_count = read_u32(&mut reader).unwrap();
    nav_file.nav_areas.reserve(area_count as usize);

    for i in 0..area_count {
        let mut nav_area = NavArea::default();
        nav_area.id = read_u32(&mut reader).unwrap();
        nav_area.attributes = read_u32(&mut reader).unwrap();
        reader.seek(SeekFrom::Current(5)).unwrap(); // Skip unknown data (it's usually empty)

        let polygon_count = read_u32(&mut reader).unwrap();
        for _ in 0..polygon_count {
            let x = read_f32(&mut reader).unwrap() as f64;
            let y = read_f32(&mut reader).unwrap() as f64;
            let z = read_f32(&mut reader).unwrap() as f64;
            nav_area.polygon.push(Vector3::new(x, y, z));
        }

        reader.seek(SeekFrom::Current(4)).unwrap(); // Skip unknown data (it's also usually empty)

        for connections in nav_area.connections.iter_mut() {
            let connection_count = read_u32(&mut reader).unwrap();
            connections.reserve(connection_count as usize);

            for _ in 0..connection_count {
                let mut connection_data = NavAreaConnectionData::default();
                connection_data.area_id = read_u32(&mut reader).unwrap();
                connection_data.edge_index = read_u32(&mut reader).unwrap();
                connections.push(connection_data);
            }
        }

        nav_file.nav_areas.push(nav_area);

        // Skip unknown data
        // I think this contains info for ladders and such, but I don't care about that.
        // If your nav has ladders it will likely break the parser when it tries to read the next area.
        // Based on the nav text format, there's still two directions for ladders (UP/DOWN).
        // Nobody is climbing ladders in SteamVR Home though...
        reader.seek(SeekFrom::Current(13)).unwrap();
    }

    // There's some other junk at the end of this file which I don't care about.

    Some(nav_file)
}

#[cfg(test)]
mod tests {
    use crate::nav_parser::nav::NAV_DIRECTIONS;
    use super::*;

    #[test]
    fn test_open() {
        let nav_file = open("battleship_bay.nav");
        assert_eq!(nav_file.is_some(), true);

        let nav_file = nav_file.unwrap();
        assert_eq!(nav_file.magic, MAGIC_PREFIX);
        assert_eq!(nav_file.version, STEAM_VR_HOME_NAV_VERSION);
        assert_eq!(nav_file.sub_version, STEAM_VR_HOME_NAV_SUB_VERSION);
        assert_eq!(nav_file.is_analyzed, true);
        assert_eq!(nav_file.place_count, 0);
        assert_eq!(nav_file.has_unnamed_areas, true);
        assert_eq!(nav_file.nav_areas.len(), 2105);

        // If you can read to the end of the file, you probably did alright
        let nav_area = &nav_file.nav_areas[2105 - 1];
        assert_eq!(nav_area.id, 3350);
        assert_eq!(nav_area.attributes, 0);
        assert_eq!(nav_area.polygon.len(), 4);
        assert_eq!(nav_area.connections.len(), NAV_DIRECTIONS);

        let connections = &nav_area.connections[0];
        assert_eq!(connections.len(), 1);
    }
}
