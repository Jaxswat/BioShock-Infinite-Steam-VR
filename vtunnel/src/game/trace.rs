use bsi_tools_lib::math::Vector3;
use crate::vtunnel::{VTunnelDeserializable, VTunnelMessage, VTunnelSerializable};
use crate::vtunnel_emitter::VTunnelEmitter;

/**
 * Trace mask
 */
#[derive(Debug, Clone, Copy)]
pub enum TraceMask {
    TraceMaskPlayerSolid = 33636363, // From L4D2 script API, may not be correct for Source 2.
}


/**
 * Stores the results of a trace
 */
#[derive(Debug)]
pub struct TraceResult {
    pub hit: bool,
    pub hit_position: Vector3,
    pub hit_normal: Vector3,
    pub hit_entity_id: u64,
    pub start_in_solid: bool,
    pub fraction: f64,
}

impl TraceResult {
    pub fn new() -> Self {
        TraceResult {
            hit: false,
            hit_position: Vector3::new(0.0, 0.0, 0.0),
            hit_normal: Vector3::new(0.0, 0.0, 0.0),
            hit_entity_id: 0,
            start_in_solid: false,
            fraction: 0.0,
        }
    }
}

impl VTunnelDeserializable for TraceResult {
    fn apply_vtunnel_message(&mut self, msg: &VTunnelMessage) {
        self.hit = msg.data[0].get_bool().unwrap();
        self.hit_position = msg.data[1].get_vector3().unwrap();
        self.hit_normal = msg.data[2].get_vector3().unwrap();
        self.hit_entity_id = msg.data[3].get_int().unwrap() as u64;
        self.start_in_solid = msg.data[4].get_bool().unwrap();
        self.fraction = msg.data[5].get_float().unwrap();
    }
}

/**
 * Performs a line trace between two points.
 */
#[derive(Debug)]
pub struct LineTrace {
    pub start_position: Vector3,
    pub end_position: Vector3,
    pub mask: TraceMask,
    pub ignore_entity_id: u64,
    pub draw_debug: bool,
}

impl VTunnelSerializable for LineTrace {
    fn serialize(&self) -> VTunnelMessage {
        let mut vmsg = VTunnelMessage::new("line_trace".to_string());
        vmsg.add_vector3(self.start_position.clone());
        vmsg.add_vector3(self.end_position.clone());
        vmsg.add_int(self.mask as i64);
        vmsg.add_int(self.ignore_entity_id as i64);
        vmsg.add_bool(self.draw_debug);
        vmsg
    }
}

impl LineTrace {
    pub fn new(start_position: Vector3, end_position: Vector3) -> Self {
        LineTrace {
            start_position,
            end_position,
            mask: TraceMask::TraceMaskPlayerSolid,
            ignore_entity_id: 0,
            draw_debug: false,
        }
    }

    /**
     * Runs the trace and returns the result.
     */
    pub async fn run(self, emitter: &VTunnelEmitter) -> Result<TraceResult, std::io::Error> {
        let vmsg = emitter.send_request::<LineTrace>(self).await?;
        let mut result = TraceResult::new();
        result.apply_vtunnel_message(&vmsg);
        Ok(result)
    }
}


/**
 * Performs a box/hull trace between two points.
 */
#[derive(Debug)]
pub struct BoxTrace {
    pub start_position: Vector3,
    pub end_position: Vector3,
    pub mins: Vector3,
    pub maxs: Vector3,
    pub mask: TraceMask,
    pub ignore_entity_id: u64,
    pub draw_debug: bool,
}

impl VTunnelSerializable for crate::game::trace::BoxTrace {
    fn serialize(&self) -> VTunnelMessage {
        let mut vmsg = VTunnelMessage::new("box_trace".to_string());
        vmsg.add_vector3(self.start_position.clone());
        vmsg.add_vector3(self.end_position.clone());
        vmsg.add_vector3(self.mins.clone());
        vmsg.add_vector3(self.maxs.clone());
        vmsg.add_int(self.mask as i64);
        vmsg.add_int(self.ignore_entity_id as i64);
        vmsg.add_bool(self.draw_debug);
        vmsg
    }
}

impl BoxTrace {
    pub fn new(start_position: Vector3, end_position: Vector3, mins: Vector3, maxs: Vector3) -> Self {
        BoxTrace {
            start_position,
            end_position,
            mins,
            maxs,
            mask: TraceMask::TraceMaskPlayerSolid,
            ignore_entity_id: 0,
            draw_debug: false,
        }
    }

    /**
     * Runs the trace and returns the result.
     */
    pub async fn run(self, emitter: &VTunnelEmitter) -> Result<TraceResult, std::io::Error> {
        let vmsg = emitter.send_request::<BoxTrace>(self).await?;
        let mut result = TraceResult::new();
        result.apply_vtunnel_message(&vmsg);
        Ok(result)
    }
}