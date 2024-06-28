use bsi_tools_lib::format::format_float;
use crate::nav_parser::nav::{NAV_DIRECTIONS, NavFile};

/// Bake the nav data into a TypeScript file.
pub fn bake_nav_data_for_typescript(nav_file: NavFile) -> String {
    let mut output = String::new();
    output.push_str("// CODE GENERATED NAV MESH DATA. DO NOT EDIT.\n\n");
    output.push_str("import {TheNavMesh as n} from \"../NavMesh\";\n");
    output.push_str("import {NavArea, newNavArea as a} from \"../NavArea\";\n");
    output.push_str("const p = (area: NavArea) => n.addArea(area);\n");

    for nav_area in nav_file.nav_areas.iter() {
        let mut polygon_output = String::new();
        let mut poly_iter = nav_area.polygon.iter().peekable();
        while let Some(vertex) = poly_iter.next() {
            polygon_output.push_str(&format!("{},{},{}", format_float(vertex.x), format_float(vertex.y), format_float(vertex.z)));

            if poly_iter.peek().is_some() {
                polygon_output.push_str(",")
            }
        }

        let mut connections_output = String::new();
        for dir in 0..NAV_DIRECTIONS {
            connections_output.push_str("[");
            let mut connections_iter = nav_area.connections[dir].iter().peekable();
            while let Some(connection) = connections_iter.next() {
                connections_output.push_str(&format!("[{},{}]", connection.area_id, connection.edge_index));

                if connections_iter.peek().is_some() {
                    connections_output.push_str(",")
                }
            }

            connections_output.push_str("]");
            if dir < NAV_DIRECTIONS - 1 {
                connections_output.push_str(",");
            }
        }

        output.push_str(&format!("p(a({},{},{}))\n", nav_area.id, polygon_output, connections_output));
    }

    output.push_str("n.applyAreaReferences();\n");

    output
}