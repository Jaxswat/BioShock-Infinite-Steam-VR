use vconsole_tunnel::nav_parser::{bake, parser};

fn main() {
    println!("Reading nav data...");
    let nav_file = parser::open("battleship_bay.nav").unwrap();

    println!("Baking nav data for TypeScript...");
    let baked_data = bake::bake_nav_data_for_typescript(nav_file);

    println!("Writing nav data to file...");
    std::fs::write("battleship_bay_nav.ts", baked_data).unwrap();
}
