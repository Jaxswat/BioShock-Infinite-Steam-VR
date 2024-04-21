use crate::math::Vector3;
use crate::vtunnel::{VTunnelDeserializable, VTunnelMessage};

#[derive(Debug)]
pub struct Player {
    pub steam_id: String,
    pub name: String,
    pub position: Vector3,
    pub rotation: Vector3,
}

impl Player {
    pub fn new() -> Player {
        Player {
            steam_id: String::new(),
            name: String::new(),
            position: Vector3::new(0.0, 0.0, 0.0),
            rotation: Vector3::new(0.0, 0.0, 0.0),
        }
    }
}

impl VTunnelDeserializable for Player {
    fn apply_vtunnel_message(&mut self, msg: &VTunnelMessage) {
        self.steam_id = msg.data[0].get_string().unwrap().to_string();
        self.name = msg.data[1].get_string().unwrap().to_string();
        self.position = msg.data[2].get_vector3().unwrap();
        self.rotation = msg.data[3].get_vector3().unwrap();
    }
}

