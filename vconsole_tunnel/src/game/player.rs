use crate::math::Vector3;
use crate::vtunnel::{VTunnelDeserializable, VTunnelMessage};

#[derive(Debug)]
pub struct Player {
    pub steam_id: String,
    pub user_id: u64,
    pub name: String,
    pub position: Vector3,
    pub rotation: Vector3,
    pub input_left_hand: PlayerInput,
    pub input_right_hand: PlayerInput,
    pub last_trigger: bool,
}

impl Player {
    pub fn new() -> Player {
        Player {
            steam_id: String::new(),
            user_id: 0,
            name: String::new(),
            position: Vector3::new(0.0, 0.0, 0.0),
            rotation: Vector3::new(0.0, 0.0, 0.0),
            input_left_hand: PlayerInput::new(),
            input_right_hand: PlayerInput::new(),
            last_trigger: false,
        }
    }
}

impl VTunnelDeserializable for Player {
    fn apply_vtunnel_message(&mut self, msg: &VTunnelMessage) {
        self.steam_id = msg.data[0].get_string().unwrap().to_string();
        self.user_id = msg.data[1].get_int().unwrap() as u64;
        self.name = msg.data[2].get_string().unwrap().to_string();
        self.position = msg.data[3].get_vector3().unwrap();
        self.rotation = msg.data[4].get_vector3().unwrap();
    }
}

#[derive(Debug)]
pub struct PlayerInput {
    pub user_id: u64,
    pub hand: u8,

    pub hand_position: Vector3,
    pub hand_rotation: Vector3,
    pub trace_hit: bool,
    pub trace_fraction: f64,
    pub trace_normal: Vector3,
    pub trace_position: Vector3,

    pub buttons_down: u64,
    pub buttons_pressed: u64,
    pub buttons_released: u64,
    pub joystick_x: f64,
    pub joystick_y: f64,
    pub trackpad_x: f64,
    pub trackpad_y: f64,
    pub trigger: f64,
}

impl PlayerInput {
    pub fn new() -> PlayerInput {
        PlayerInput {
            user_id: 0,
            hand: 0,
            hand_position: Vector3::new(0.0, 0.0, 0.0),
            hand_rotation: Vector3::new(0.0, 0.0, 0.0),
            trace_hit: false,
            trace_fraction: 0.0,
            trace_normal: Vector3::new(0.0, 0.0, 0.0),
            trace_position: Vector3::new(0.0, 0.0, 0.0),
            buttons_down: 0,
            buttons_pressed: 0,
            buttons_released: 0,
            joystick_x: 0.0,
            joystick_y: 0.0,
            trackpad_x: 0.0,
            trackpad_y: 0.0,
            trigger: 0.0,
        }
    }
}

impl VTunnelDeserializable for PlayerInput {
    fn apply_vtunnel_message(&mut self, msg: &VTunnelMessage) {
        self.user_id = msg.data[0].get_int().unwrap() as u64;
        self.hand = msg.data[1].get_int().unwrap() as u8;
        self.hand_position = msg.data[2].get_vector3().unwrap();
        self.hand_rotation = msg.data[3].get_vector3().unwrap();
        self.trace_hit = msg.data[4].get_bool().unwrap();
        self.trace_fraction = msg.data[5].get_float().unwrap();
        self.trace_normal = msg.data[6].get_vector3().unwrap();
        self.trace_position = msg.data[7].get_vector3().unwrap();
        self.buttons_down = msg.data[8].get_int().unwrap() as u64;
        self.buttons_pressed = msg.data[9].get_int().unwrap() as u64;
        self.buttons_released = msg.data[10].get_int().unwrap() as u64;
        self.joystick_x = msg.data[11].get_float().unwrap();
        self.joystick_y = msg.data[12].get_float().unwrap();
        self.trackpad_x = msg.data[13].get_float().unwrap();
        self.trackpad_y = msg.data[14].get_float().unwrap();
        self.trigger = msg.data[15].get_float().unwrap();
    }
}
