use crate::nav_parser::nav::NavData;

/// Bake the nav data into a TypeScript file.
pub fn bake_nav_data_for_typescript(nav_data: NavData) -> String {
    let mut output = String::new();
    output.push_str("// CODE GENERATED NAV MESH DATA. DO NOT EDIT.\n\n");
    output.push_str("import {NavArea} from \"./NavData\";\n");
    output.push_str("const NAV_MESH: NavArea[] = [\n");

    for nav_area in nav_data.nav_areas.iter() {
        output.push_str("\t{\n");
        output.push_str(&format!("\t\tid: {},\n", nav_area.id));
        output.push_str(&format!("\t\tattributes: {},\n", nav_area.attributes));
        output.push_str("\t\tpolygons: [\n");
        output.push_str("\t\t\t");
        for polygon in nav_area.polygons.iter() {
            output.push_str(&format!("Vector({}, {}, {}), ", polygon.x, polygon.y, polygon.z));
        }
        output.push_str("\n");
        output.push_str("\t\t],\n");
        output.push_str("\t\tconnections: [\n");
        for connection in nav_area.connections.iter() {
            output.push_str("\t\t\t[\n");
            for connection_data in connection.connections.iter() {
                output.push_str("\t\t\t\t{\n");
                output.push_str(&format!("\t\t\t\t\tareaID: {}, edgeIndex: {}\n", connection_data.area_id, connection_data.edge_index));
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