use std::fmt::Write;
use crate::math::Vector3;

const VTUNNEL_PREFIX: &'static str = "$vt!";
const VTUNNEL_TYPE_PREFIX: char = ':';
const VTUNNEL_TYPE_SUFFIX: char = '!';


pub trait VTunnelDeserializable {
    fn apply_vtunnel_message(&mut self, msg: &VTunnelMessage);
}

pub trait VTunnelSerializable {
    fn serialize(&self) -> VTunnelMessage;
}

#[derive(Debug)]
pub enum VTunnelDataPart {
    String(String),
    Float(f64),
    Int(i64),
    Vector3(Vector3),
    Bool(bool),
}

impl VTunnelDataPart {
    pub fn get_string(&self) -> Option<&str> {
        if let VTunnelDataPart::String(val) = self {
            Some(val)
        } else {
            None
        }
    }

    pub fn get_float(&self) -> Option<f64> {
        if let VTunnelDataPart::Float(val) = self {
            Some(*val)
        } else {
            None
        }
    }

    pub fn get_int(&self) -> Option<i64> {
        if let VTunnelDataPart::Int(val) = self {
            Some(*val)
        } else {
            None
        }
    }


    pub fn get_vector3(&self) -> Option<Vector3> {
        if let VTunnelDataPart::Vector3(val) = self {
            Some(Vector3::new(val.x, val.y, val.z))
        } else {
            None
        }
    }

    pub fn get_bool(&self) -> Option<bool> {
        if let VTunnelDataPart::Bool(val) = self {
            Some(*val)
        } else {
            None
        }
    }
}

#[derive(Debug)]
pub struct VTunnelMessage {
    pub id: u64,
    pub name: String,
    pub data: Vec<VTunnelDataPart>,
}

impl VTunnelMessage {

    pub fn new(name: String) -> VTunnelMessage {
        VTunnelMessage {
            id: 0,
            name,
            data: Vec::new(),
        }
    }

    pub fn set_id(&mut self, id: u64) {
        self.id = id;
    }

    pub fn add_string(&mut self, data: String) {
        self.data.push(VTunnelDataPart::String(data));
    }

    pub fn add_float(&mut self, data: f64) {
        self.data.push(VTunnelDataPart::Float(data));
    }

    pub fn add_int(&mut self, data: i64) {
        self.data.push(VTunnelDataPart::Int(data));
    }

    pub fn add_vector3(&mut self, data: Vector3) {
        self.data.push(VTunnelDataPart::Vector3(data));
    }

    pub fn add_bool(&mut self, data: bool) {
        self.data.push(VTunnelDataPart::Bool(data));
    }
}

pub fn encode_vtunnel_message(vmsg: &VTunnelMessage) -> String {
    let mut data = String::new();
    data.write_str(VTUNNEL_PREFIX).unwrap();
    data.write_str(&vmsg.id.to_string()).unwrap();
    data.push(VTUNNEL_TYPE_SUFFIX);
    data.write_str(&vmsg.name).unwrap();
    data.push(VTUNNEL_TYPE_SUFFIX);

    for part in &vmsg.data {
        match part {
            VTunnelDataPart::String(val) => {
                data.write_str("s(").unwrap();
                data.write_str(&val.len().to_string()).unwrap();
                data.write_str(")").unwrap();
                data.write_str(&VTUNNEL_TYPE_PREFIX.to_string()).unwrap();
                data.write_str(&val).unwrap();
            }
            VTunnelDataPart::Float(val) => {
                data.write_str("f").unwrap();
                data.write_str(&VTUNNEL_TYPE_PREFIX.to_string()).unwrap();
                data.write_str(&val.to_string()).unwrap();
            }
            VTunnelDataPart::Int(val) => {
                data.write_str("i").unwrap();
                data.write_str(&VTUNNEL_TYPE_PREFIX.to_string()).unwrap();
                data.write_str(&val.to_string()).unwrap();
            }
            VTunnelDataPart::Vector3(val) => {
                data.write_str("v3").unwrap();
                data.write_str(&VTUNNEL_TYPE_PREFIX.to_string()).unwrap();
                data.write_str(&val.x.to_string()).unwrap();
                data.push(',');
                data.write_str(&val.y.to_string()).unwrap();
                data.push(',');
                data.write_str(&val.z.to_string()).unwrap();
            }
            VTunnelDataPart::Bool(val) => {
                data.write_str("b").unwrap();
                data.write_str(&VTUNNEL_TYPE_PREFIX.to_string()).unwrap();
                if *val {
                    data.write_char('1').unwrap();
                } else {
                    data.write_char('0').unwrap();
                }
            }
        }
        data.push(VTUNNEL_TYPE_SUFFIX);
    }

    data
}

pub fn parse_vtunnel_message(raw_msg: &String) -> Option<VTunnelMessage> {
    if !raw_msg.starts_with(VTUNNEL_PREFIX) {
        return None;
    }

    let raw_msg_chars: Vec<_> = raw_msg.chars().collect();
    let mut index = VTUNNEL_PREFIX.len(); // trim prefix

    let id_index = raw_msg_chars[index..].iter().position(|c| *c == VTUNNEL_TYPE_SUFFIX).unwrap_or_default(); // id
    let msg_id_str: String = raw_msg_chars[index..index + id_index].iter().collect();
    let msg_id = msg_id_str.parse::<u64>().unwrap_or_default();
    index += id_index + 1; // trim the delimiter after id

    let name_index = raw_msg_chars[index..].iter().position(|c| *c == VTUNNEL_TYPE_SUFFIX).unwrap_or_default(); // name
    let msg_name = raw_msg_chars[index..index + name_index].iter().collect();
    index += name_index + 1; // trim the delimiter after name
    let mut vmsg = VTunnelMessage::new(msg_name);
    vmsg.set_id(msg_id);

    let mut str_len = 0;
    let mut data_type = String::new();
    let mut data = String::new();
    while index < raw_msg_chars.len() {
        let c = raw_msg_chars[index];

        if data_type == "" {
            if c == VTUNNEL_TYPE_PREFIX {
                data_type = data.clone();
                if data_type.starts_with("s(") && data_type.ends_with(")") {
                    str_len = data_type[2..data_type.len() - 1].parse::<usize>().unwrap_or_default();
                    data_type = "s".to_string();
                }

                data = String::new();
                index += 1; // trim the type delimiter

                continue;
            }

            data.push(c);
            index += 1;
            continue;
        }

        match data_type.as_str() {
            "s" => {
                vmsg.data.push(VTunnelDataPart::String(raw_msg_chars[index..index + str_len].iter().collect()));
                index += str_len;
            }
            "f" => {
                let end_index = raw_msg_chars[index..].iter().position(|&b| b == VTUNNEL_TYPE_SUFFIX).unwrap_or_default();
                data = raw_msg[index..index + end_index].to_string();
                vmsg.data.push(VTunnelDataPart::Float(data.parse::<f64>().unwrap()));
                index += end_index;
            }
            "i" => {
                let end_index = raw_msg_chars[index..].iter().position(|&b| b == VTUNNEL_TYPE_SUFFIX).unwrap_or_default();
                data = raw_msg[index..index + end_index].to_string();
                vmsg.data.push(VTunnelDataPart::Int(data.parse::<i64>().unwrap()));
                index += end_index;
            }
            "v3" => {
                let end_index = raw_msg_chars[index..].iter().position(|&b| b == VTUNNEL_TYPE_SUFFIX).unwrap_or_default();
                data = raw_msg[index..index + end_index].to_string();
                let mut vec3_data = data.split(',');
                let x = vec3_data.next().unwrap().parse::<f64>().unwrap();
                let y = vec3_data.next().unwrap().parse::<f64>().unwrap();
                let z = vec3_data.next().unwrap().parse::<f64>().unwrap();
                vmsg.data.push(VTunnelDataPart::Vector3(Vector3::new(x, y, z)));
                index += end_index;
            }
            "b" => {
                let end_index = raw_msg_chars[index..].iter().position(|&b| b == VTUNNEL_TYPE_SUFFIX).unwrap_or_default();
                data = raw_msg[index..index + end_index].to_string();
                vmsg.data.push(VTunnelDataPart::Bool(data.parse::<u8>().unwrap() == 1));
                index += end_index;
            }
            _ => {
                eprintln!("Unknown VTunnel data type: {}", data_type);
            }
        }

        data_type = String::new();
        data = String::new();
        index += 1; // trim the type delimiter
    }

    Some(vmsg)
}

#[cfg(test)]
mod tests {
    use crate::vtunnel::{encode_vtunnel_message, parse_vtunnel_message};

    fn float_equal(a: f64, b: f64) -> bool {
        (a - b).abs() < 1e-6
    }

    #[test]
    fn test_parse_vtunnel_message_everything() {
        let test_payload = "$vt!69!test!s(5):hello!f:3.141592!i:8192!v3:3.14,5.92,0.314!s(0):!f:-3.14!i:-69!b:1!b:0!".to_string();
        let output = parse_vtunnel_message(&test_payload);

        assert!(output.is_some());
        let output = output.unwrap();
        assert_eq!(output.id, 69);
        assert_eq!(output.name, "test");
        assert_eq!(output.data.len(), 9);

        assert_eq!(output.data[0].get_string().unwrap(), "hello");
        assert!(float_equal(output.data[1].get_float().unwrap(), std::f64::consts::PI));
        assert_eq!(output.data[2].get_int().unwrap(), 8192);
        let vec3 = output.data[3].get_vector3().unwrap();
        assert!(float_equal(vec3.x, 3.14));
        assert!(float_equal(vec3.y, 5.92));
        assert!(float_equal(vec3.z, 0.314));
        assert_eq!(output.data[4].get_string().unwrap(), "");
        assert!(float_equal(output.data[5].get_float().unwrap(), -3.14));
        assert_eq!(output.data[6].get_int().unwrap(), -69);
        assert_eq!(output.data[7].get_bool().unwrap(), true);
        assert_eq!(output.data[8].get_bool().unwrap(), false);
    }

    #[test]
    fn test_parse_vtunnel_message_empty() {
        let test_payload = "$vt!0!test!".to_string();
        let output = parse_vtunnel_message(&test_payload);

        assert!(output.is_some());
        let output = output.unwrap();
        assert_eq!(output.id, 0);
        assert_eq!(output.name, "test");
        assert_eq!(output.data.len(), 0);
    }

    #[test]
    fn test_decode_encode_vtunnel_message() {
        let input = "$vt!69!test!s(5):hello!f:3.141592!i:8192!v3:3.14,5.92,0.314!s(0):!f:-3.14!i:-69!b:1!b:0!".to_string();
        let decoded = parse_vtunnel_message(&input);
        assert!(decoded.is_some());
        let encoded = encode_vtunnel_message(&decoded.unwrap());
        assert_eq!(input, encoded);
        println!("Matched: \n{}\n==\n{}", input, encoded);
    }
}