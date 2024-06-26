use steamvr_nav_tools::nav_parser::{bake, parser};

fn main() {
    println!("Reading nav data...");
    let mut nav_file = parser::open("battleship_bay.nav").unwrap();
    nav_file.compress_area_ids();

    println!("Baking nav data for TypeScript...");
    let baked_data = bake::bake_nav_data_for_typescript(nav_file);

    println!("Writing nav data to file...");
    std::fs::write("battleship_bay_nav.ts", baked_data).unwrap();
}
