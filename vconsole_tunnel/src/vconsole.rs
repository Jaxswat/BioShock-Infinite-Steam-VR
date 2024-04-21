use std::fmt;
use std::fmt::Write;
use bytes::{Buf, BufMut, BytesMut};
use tokio::io;
use tokio_util::codec::{Decoder, Encoder};
use crate::vtunnel::{encode_vtunnel_message, VTunnelMessage};

// This thing is included with all messages, no idea why. Probably a version number or something.
pub const VCONSOLE_BYTE: u8 = 0xD3;

#[derive(PartialEq, Eq)]
pub struct PacketType(u32);

impl PacketType {
    // Contains print data.
    // First 30 bytes are unknown, but likely contain channel/color/log level information.
    // Last 2 bytes are newline + NUL.
    pub const PRINT: PacketType = PacketType(u32::from_be_bytes(*b"PRNT"));
    // Contains app info like the game's executable path.
    // First 87 bytes are unknown. After that it's the executable path string + NUL.
    pub const APP_INFO: PacketType = PacketType(u32::from_be_bytes(*b"AINF"));
    // Contains addon info like the addon's name.
    // First 6 bytes are unknown, but byte 4 seems to be a boolean set to true.
    // After this it's just the addon name string + NUL.
    pub const ADDON: PacketType = PacketType(u32::from_be_bytes(*b"ADON"));
    // Contains channel info. First 28 bytes are unknown, and then every 58 bytes is channel names/data like "VScript" and "RenderSystem"
    // Channel names seem to have a fixed size with a max length of 32 bytes + NUL (though most channels don't use this length).
    pub const CHANNEL: PacketType = PacketType(u32::from_be_bytes(*b"CHAN"));
    // Contains convar info. These seem to always be exactly 93 bytes long.
    // First 2 bytes are empty.
    // Next bytes are a string with the name of the convar (NUL terminated).
    // All bytes after that appear to be ACTUAL garbage. Like, it's printing off some random memory.
    // For example, I'll sometimes see some print() messages mixed in.
    pub const CONVAR: PacketType = PacketType(u32::from_be_bytes(*b"CVAR"));
    // Config variable/value. Similar to CONVAR, this seems to have a fixed size of 81 bytes.
    // First 2 bytes are empty. Contains a lot of junk.
    pub const CONFIG_VAR: PacketType = PacketType(u32::from_be_bytes(*b"CFGV"));


    // PPCR is some kind of connection test? Pipe created?
    // Packet seems to have fixed size of 49 bytes.
    // First 6 bytes are always 0, 1, 1, 0, 1, 0.
    // Next 9 bytes are "PipeTest" + NUL (string)
    // Next 23 bytes are "From 'Localhost:29009'" + NUL (string)
    // I also tried connecting with 127.0.0.1 and this section changed to garbage. As if it only writes when connecting to localhost.
    // Last byte is garbage.
    pub const PPCR: PacketType = PacketType(u32::from_be_bytes(*b"PPCR"));

    // VConsole Focus? Looks like it contains 2 empty bytes and a boolean.
    // Whenever I focus the window it's true, whenever I unfocus it's false.
    // The VConsole client seems to send this frequently when focused to keep the game from pausing.
    pub const FOCUSED: PacketType = PacketType(u32::from_be_bytes(*b"VFCS"));

    // Console command. First 2 bytes are empty. Contains the command string + NUL.
    pub const COMMAND: PacketType = PacketType(u32::from_be_bytes(*b"CMND"));

    pub fn from_bytes(bytes: [u8; 4]) -> PacketType {
        PacketType(u32::from_be_bytes(bytes))
    }

    pub fn to_string(&self) -> String {
        String::from_utf8_lossy(&self.0.to_be_bytes()).into_owned()
    }
}

impl fmt::Display for PacketType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.to_string())
    }
}

impl fmt::Debug for PacketType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "PacketType({})", self.to_string())
    }
}

/**
 * Packet
 *
 * 5 bytes - Packet type + NUL
 * 1 byte - Unknown, but always set to 0xD3 (211)
 * 4 bytes - Packet length big-endian u32
 * N bytes - Payload
 */
#[derive(Debug)]
pub struct Packet {
    pub packet_type: PacketType,
    pub _unknown: u8,
    pub data: Vec<u8>,
}

impl Packet {
    pub const MIN_HEADER_SIZE: usize = 5 + 1 + 4;

    // Return the raw printed string without newline.
    pub fn get_print_data(&self) -> String {
        String::from_utf8_lossy(&self.data[30..self.data.len() - 2]).into_owned()
    }

    pub fn get_app_info_executable(&self) -> String {
        String::from_utf8_lossy(&self.data[87..self.data.len() - 1]).into_owned()
    }

    pub fn get_addon_name(&self) -> String {
        String::from_utf8_lossy(&self.data[6..self.data.len() - 1]).into_owned()
    }

    pub fn get_channel_data(&self) -> Vec<String> {
        let mut channels: Vec<String> = vec![];
        let mut i = 28;
        while i < self.data.len() {
            if i + 33 >= self.data.len() {
                break;
            }

            let null_index = self.data[i..].iter().position(|&b| b == 0).unwrap_or(33);
            let channel = String::from_utf8_lossy(&self.data[i..i + null_index]);
            channels.push(channel.into_owned());
            i += 58;
        }

        channels
    }

    pub fn get_convar_name(&self) -> String {
        let null_index = self.data[2..].iter().position(|&b| b == 0).unwrap_or(self.data.len());
        String::from_utf8_lossy(&self.data[2..null_index + 2]).into_owned()
    }

    pub fn get_config_var_name(&self) -> String {
        let null_index = self.data[2..].iter().position(|&b| b == 0).unwrap_or(self.data.len());
        String::from_utf8_lossy(&self.data[2..null_index + 2]).into_owned()
    }
}

pub struct PacketCodec;

impl Encoder<Packet> for PacketCodec {
    type Error = io::Error;

    fn encode(&mut self, item: Packet, dst: &mut BytesMut) -> Result<(), Self::Error> {
        if item.packet_type == PacketType::COMMAND {
            let packet_size = Packet::MIN_HEADER_SIZE + item.data.len();
            if dst.remaining_mut() < packet_size {
                dst.reserve(packet_size);
            }

            dst.put_u32(item.packet_type.0);
            dst.put_u8(0); // NUL
            dst.put_u8(VCONSOLE_BYTE);
            dst.put_u32(packet_size as u32);
            dst.put_slice(&item.data);
        }

        Ok(())
    }
}

impl Decoder for PacketCodec {
    type Item = Packet;
    type Error = io::Error;

    fn decode(&mut self, src: &mut BytesMut) -> Result<Option<Self::Item>, Self::Error> {
        if src.len() < Packet::MIN_HEADER_SIZE {
            return Ok(None);
        }

        let packet_type = PacketType::from_bytes([src[0], src[1], src[2], src[3]]);
        // src[4] is NUL
        let unknown = src[5];
        let packet_length = u32::from_be_bytes([src[6], src[7], src[8], src[9]]) as usize;

        if src.len() < packet_length {
            return Ok(None);
        }

        let payload = src[Packet::MIN_HEADER_SIZE..packet_length].to_vec();

        src.advance(packet_length);

        Ok(Some(Packet {
            packet_type,
            _unknown: unknown,
            data: payload,
        }))
    }
}

pub struct CommandPacket {
    command: String,
}

impl CommandPacket {

    pub fn new(command: String) -> CommandPacket {
        CommandPacket { command }
    }

    pub fn to_packet(&self) -> Packet {
        let mut packet = Packet {
            packet_type: PacketType::COMMAND,
            _unknown: VCONSOLE_BYTE,
            data: vec![],
        };

        packet.data.push(0); // 2 empty bytes
        packet.data.push(0);
        packet.data.extend_from_slice(self.command.as_bytes());
        packet.data.push(0); // NUL

        packet
    }
}

pub struct VTunnelMessagePacket {
    vmsg: VTunnelMessage,
}

impl VTunnelMessagePacket {
    pub fn new(vmsg: VTunnelMessage) -> VTunnelMessagePacket {
        VTunnelMessagePacket { vmsg }
    }

    pub fn to_packet(&self) -> Packet {
        let mut packet = Packet {
            packet_type: PacketType::COMMAND,
            _unknown: VCONSOLE_BYTE,
            data: vec![],
        };

        let encoded_msg = encode_vtunnel_message(&self.vmsg);
        let mut command = String::new();
        command.write_str("vtunnel_receive \"").unwrap();
        command.write_str(encoded_msg.as_str()).unwrap();
        command.write_str("\"").unwrap();

        packet.data.push(0); // 2 empty bytes
        packet.data.push(0);
        packet.data.extend_from_slice(command.as_bytes());
        packet.data.push(0); // NUL

        packet
    }
}