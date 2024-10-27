pub mod clip {
    use std::collections::HashMap;

    #[derive(Debug)]
    pub struct Clip {
        pub asset_name: String,
        pub asset_folder: String,
        pub speech_tag: String,
        pub speech_type: String,
        pub sentiment: String,
        pub intensity: String,
        pub animate: bool,
    }

    pub type ClipsMap = HashMap<String, Clip>;
}