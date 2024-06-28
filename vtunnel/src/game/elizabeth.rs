use bsi_tools_lib::math::Vector3;
use crate::vtunnel::{VTunnelDeserializable, VTunnelMessage};

#[derive(Debug)]
pub struct Elizabeth {
    pub position: Vector3,
    pub rotation: Vector3,
    pub current_state: String,
}

impl Elizabeth {
    pub const MINS: Vector3 = Vector3{ x: -9.998732, y: -18.859135, z: -0.057327 };
    pub const MAXS: Vector3 = Vector3{ x: 9.537852, y: 18.859135, z: 66.952141 };

    pub fn new() -> Elizabeth {
        Elizabeth {
            position: Vector3::new(0.0, 0.0, 0.0),
            rotation: Vector3::new(0.0, 0.0, 0.0),
            current_state: String::new(),
        }
    }
}

impl VTunnelDeserializable for Elizabeth {
    fn apply_vtunnel_message(&mut self, msg: &VTunnelMessage) {
        self.position = msg.data[0].get_vector3().unwrap();
        self.rotation = msg.data[1].get_vector3().unwrap();
        self.current_state = msg.data[2].get_string().unwrap().to_string();
    }
}
