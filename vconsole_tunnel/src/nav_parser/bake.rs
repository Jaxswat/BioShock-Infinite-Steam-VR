use crate::nav_parser::nav::NavFile;

/// Bake the nav data into a TypeScript file.
pub fn bake_nav_data_for_typescript(nav_file: NavFile) -> String {
    let mut output = String::new();
    output.push_str("// CODE GENERATED NAV MESH DATA. DO NOT EDIT.\n\n");
    output.push_str("import {NavArea} from \"./NavData\";\n");
    output.push_str("const NAV_MESH: NavArea[] = [\n");

    for nav_area in nav_file.nav_areas.iter() {
        output.push_str("\t{\n");
        output.push_str(&format!("\t\tid: {},\n", nav_area.id));
        output.push_str(&format!("\t\tattributes: {},\n", nav_area.attributes));
        output.push_str("\t\tpolygon: [\n");
        output.push_str("\t\t\t");
        for polygon in nav_area.polygon.iter() {
            output.push_str(&format!("Vector({}, {}, {}), ", polygon.x, polygon.y, polygon.z));
        }
        output.push_str("\n");
        output.push_str("\t\t],\n");
        output.push_str("\t\tconnections: [\n");
        for connections in nav_area.connections.iter() {
            output.push_str("\t\t\t[\n");
            for connection in connections.iter() {
                output.push_str("\t\t\t\t{\n");
                output.push_str(&format!("\t\t\t\t\tareaID: {}, edgeIndex: {}\n", connection.area_id, connection.edge_index));
                output.push_str("\t\t\t\t},\n");
            }
            output.push_str("\t\t\t],\n");
        }
        output.push_str("\t\t],\n");
        output.push_str("\t},\n");
    }
    output.push_str("];\n\n");
    output.push_str("export default NAV_MESH;\n");

    output
}