use std::sync::{Arc};
use tokio::net::TcpStream;
use tokio_stream::StreamExt;
use tokio_util::codec::{Framed};
use futures::SinkExt;
use tokio::sync::{mpsc, Mutex};
use vconsole_tunnel::{vconsole, vtunnel};
use vconsole_tunnel::game::elizabeth::Elizabeth;
use vconsole_tunnel::game::gadget::GadgetTool;
use vconsole_tunnel::game::player::{Player, PlayerInput};
use vconsole_tunnel::nav_builder::nav_builder::NavBuilderProgram;
use vconsole_tunnel::vconsole::Packet;
use vconsole_tunnel::vtunnel::{VTunnelDeserializable, VTunnelMessage, VTunnelSerializable};
use vconsole_tunnel::vtunnel_emitter::VTunnelEmitter;


#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let stream = TcpStream::connect("127.0.0.1:29009").await?;
    let framed = Framed::new(stream, vconsole::PacketCodec);
    let (inbox_sender, mut inbox_receiver) = mpsc::channel(1000);
    let (inbox_reply_sender, mut inbox_reply_receiver) = mpsc::channel(1000);
    let (outbox_sender, mut outbox_receiver) = mpsc::channel(1000);

    let framed_sender = Arc::new(Mutex::new(framed));
    let framed_receiver = Arc::clone(&framed_sender);

    // Request the client to request a handshake on connect (for when server starts after client is running)
    let handshake_vmsg = VTunnelMessage::new("vtunnel_request_handshake".to_string());
    outbox_sender.send(vconsole::VTunnelMessagePacket::new(handshake_vmsg).to_packet()).await.unwrap();


    let emitter = Arc::new(VTunnelEmitter::new(outbox_sender));
    let emitter_receiver = Arc::clone(&emitter);
    let mut console_state = ConsoleState::new(inbox_sender, inbox_reply_sender);
    let emitter_static: &'static VTunnelEmitter = unsafe { // No no no no no no no no no no no no no
        &*Arc::into_raw(emitter.clone())
    };
    let mut game_state = GameState::new(emitter_static).await;

    tokio::spawn(async move {
        while let Some(packet) = outbox_receiver.recv().await {
            let mut framed = framed_sender.lock().await;
            framed.send(packet).await.unwrap();
        }
    });

    tokio::spawn(async move {
        while let Some(vmsg) = inbox_receiver.recv().await {
            game_state.handle_vmsg(vmsg).await;
        }
    });

    tokio::spawn(async move {
        while let Some(vmsg) = inbox_reply_receiver.recv().await {
            emitter_receiver.handle_reply(vmsg).await;
        }
    });

    loop {
        let mut framed = framed_receiver.lock().await;
        let packet = framed.next().await;

        match packet {
            Some(Ok(packet)) => {
                console_state.handle_packet(packet).await;
            }
            Some(Err(err)) => {
                eprintln!("Error decoding packet: {:?}", err);
                break;
            }
            None => {
                println!("Connection closed by the server");
                break;
            }
        }
    }

    Ok(())
}

struct ConsoleState {
    inbox_sender: mpsc::Sender<VTunnelMessage>,
    inbox_reply_sender: mpsc::Sender<VTunnelMessage>,

    program_args: String,
    addon_name: String,
    channels: Vec<String>,
    convars: Vec<String>,
    config_vars: Vec<String>,
    packets_received: usize,
}

impl ConsoleState {
    pub fn new(inbox_sender: mpsc::Sender<VTunnelMessage>, inbox_reply_sender: mpsc::Sender<VTunnelMessage>) -> ConsoleState {
        ConsoleState {
            inbox_sender,
            inbox_reply_sender,

            program_args: String::new(),
            addon_name: String::new(),
            channels: vec![],
            convars: vec![],
            config_vars: vec![],
            packets_received: 0,
        }
    }

    pub fn print_state(&self) {
        println!("Program args: {}", self.program_args);
        println!("Addon: {}", self.addon_name);
        println!("Channels: {:?}", self.channels.len());
        println!("Convars: {:?}", self.convars.len());
        println!("Config vars: {:?}", self.config_vars.len());
        println!("Packet count: {}", self.packets_received);
    }

    pub async fn handle_packet(&mut self, packet: Packet) {
        if self.packets_received == 4000 {
            self.print_state();
        }

        match packet.packet_type {
            vconsole::PacketType::PRINT => {
                let print_data = packet.get_print_data();
                let vmsg = vtunnel::parse_vtunnel_message(&print_data);
                if vmsg.is_some() {
                    let vmsg = vmsg.unwrap();
                    if vmsg.id == 0 {
                        self.inbox_sender.send(vmsg).await.unwrap();
                    } else {
                        self.inbox_reply_sender.send(vmsg).await.unwrap();
                    }
                } else {
                    println!("{}", print_data);
                }
            }
            vconsole::PacketType::APP_INFO => {
                self.program_args = packet.get_app_info_executable();
            }
            vconsole::PacketType::ADDON => {
                self.addon_name = packet.get_addon_name();
            }
            vconsole::PacketType::CHANNEL => {
                self.channels = packet.get_channel_data();
            }
            vconsole::PacketType::CONVAR => {
                self.convars.push(packet.get_convar_name());
            }
            vconsole::PacketType::CONFIG_VAR => {
                self.config_vars.push(packet.get_config_var_name());
            }
            _ => {
                println!("Unknown packet {}: size: {}", packet.packet_type.to_string(), packet.data.len());
            }
        }

        self.packets_received += 1;
    }
}

struct GameState {
    session_id: u32,
    session_ready: bool,

    emitter: &'static VTunnelEmitter,
    last_server_time: f64,
    server_time: f64,
    liz: Elizabeth,
    player: Player,
    gadget_tool: GadgetTool,
}

impl GameState {
    pub async fn new(emitter: &'static VTunnelEmitter) -> GameState {
        let gadget_tool = GadgetTool::new(NavBuilderProgram::new(emitter).await);

        GameState {
            session_id: 0,
            session_ready: false,

            emitter,
            last_server_time: 0.0,
            server_time: 0.0,
            liz: Elizabeth::new(),
            player: Player::new(),
            gadget_tool,
        }
    }

    pub fn print_state(&self) {
        println!("Server time: {}", self.server_time);
        println!("Liz: {:?}", self.liz);
        println!("Player: {:?}", self.player);
    }

    pub async fn handle_vmsg(&mut self, vmsg: VTunnelMessage) {
        let msg_name = vmsg.name.as_str();

        // Handle when client requests handshake (for when client starts after server is running)
        if msg_name == "vtunnel_request_handshake" {
            self.session_ready = false;
            self.session_id = rand::random::<u32>();

            let handshake_response = self.emitter.send_request::<VTunnelHandshake>(VTunnelHandshake::new(self.session_id)).await;
            match handshake_response {
                Ok(_) => {
                    self.session_ready = true;
                    let mut connected_vmsg = VTunnelMessage::new("vtunnel_connected".to_string());
                    connected_vmsg.set_id(self.session_id as u64);
                    self.emitter.send_vmsg(connected_vmsg).await;
                }
                Err(err) => {
                    println!("VTunnel handshake failed... {} {:?}", self.session_id, err);
                }
            }
            return;
        }

        // Block all messages until client is ready
        if !self.session_ready {
            return;
        }

        match msg_name {
            "liz_state" => self.liz.apply_vtunnel_message(&vmsg),
            "player_state" => self.player.apply_vtunnel_message(&vmsg),
            "player_input" => {
                let mut input = PlayerInput::new();
                input.apply_vtunnel_message(&vmsg);
                self.gadget_tool.input(input).await;
            }
            "gadget_activated" => {
                self.gadget_tool.activate().await;
            }
            "gadget_deactivated" => {
                self.gadget_tool.deactivate().await;
            }
            "world_state" => self.server_time = vmsg.data[0].get_float().unwrap_or_default(),
            _ => {}
        }

        if self.server_time - self.last_server_time > 1.0 {
            // self.print_state();
            self.last_server_time = self.server_time;
        }
    }
}

#[derive(Debug)]
pub struct VTunnelHandshake {
    pub session_id: u32,
}

impl VTunnelHandshake {
    pub fn new(session_id: u32) -> VTunnelHandshake {
        VTunnelHandshake {
            session_id,
        }
    }
}

impl VTunnelSerializable for VTunnelHandshake {
    fn serialize(&self) -> VTunnelMessage {
        let mut vmsg = VTunnelMessage::new("vtunnel_handshake".to_string());
        vmsg.set_id(self.session_id as u64);
        vmsg
    }
}
