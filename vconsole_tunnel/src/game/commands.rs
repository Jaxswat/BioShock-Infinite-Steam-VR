use crate::math::Vector3;
use crate::vtunnel::{VTunnelMessage, VTunnelSerializable};

pub struct DrawDebugSphere {
    pub position: Vector3,
    pub color: Vector3,
    pub color_alpha: f64,
    pub radius: f64,
    pub z_test: bool,
    pub duration_seconds: f64,
}

impl VTunnelSerializable for DrawDebugSphere {
    fn serialize(&self) -> VTunnelMessage {
        let mut vmsg = VTunnelMessage::new("draw_debug_sphere".to_string());
        vmsg.add_vector3(self.position.clone());
        vmsg.add_vector3(self.color.clone());
        vmsg.add_float(self.color_alpha.clone());
        vmsg.add_float(self.radius.clone());
        vmsg.add_bool(self.z_test.clone());
        vmsg.add_float(self.duration_seconds.clone());
        vmsg
    }
}
