use crate::math::Vector3;
use crate::vtunnel::{VTunnelDeserializable, VTunnelMessage};

#[derive(Debug)]
pub struct Elizabeth {
    pub position: Vector3,
    pub rotation: Vector3,
    pub current_state: String,
}

impl Elizabeth {
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
