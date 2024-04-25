mod vconsole;
mod math;
mod vtunnel;
mod game;
mod vtunnel_emitter;
mod nav_builder;

use std::sync::{Arc};
use tokio::net::TcpStream;
use tokio_stream::StreamExt;
use tokio_util::codec::{Framed};
use crate::game::elizabeth::Elizabeth;
use crate::game::player::{Player, PlayerInput};
use crate::vtunnel::{VTunnelDeserializable, VTunnelMessage, VTunnelSerializable};
use futures::SinkExt;
use tokio::sync::{mpsc, Mutex};
use crate::game::gadget::{GadgetProgram, GadgetTool};
use crate::nav_builder::nav_builder::NavBuilderProgram;
use crate::vconsole::{Packet};
use crate::vtunnel_emitter::VTunnelEmitter;


#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let stream = TcpStream::connect("127.0.0.1:29009").await?;
    let framed = Framed::new(stream, vconsole::PacketCodec);
    let (inbox_sender, mut inbox_receiver) = mpsc::channel(1000);
    let (inbox_reply_sender, mut inbox_reply_receiver) = mpsc::channel(1000);
    let (outbox_sender, mut outbox_receiver) = mpsc::channel(1000);

    let framed_sender = Arc::new(Mutex::new(framed));
    let framed_receiver = Arc::clone(&framed_sender);

    outbox_sender.send(vconsole::VTunnelMessagePacket::new(VTunnelMessage::new("vtunnel_connected".to_string())).to_packet()).await.unwrap();

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
    buffer_skipped: bool,
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
            buffer_skipped: false,
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
            self.buffer_skipped = true;
            self.print_state();
        }

        match packet.packet_type {
            vconsole::PacketType::PRINT => {
                let print_data = packet.get_print_data();
                // if print_data.contains("End VConsole Buffered Messages") {
                //     self.buffer_skipped = true;
                //     self.last_server_time = 0.0; // reset on game reload
                // }

                if self.buffer_skipped {
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
    last_server_time: f64,
    server_time: f64,
    liz: Elizabeth,
    player: Player,
    gadget_tool: GadgetTool,
}

impl GameState {
    pub async fn new(emitter: &'static VTunnelEmitter) -> GameState {
        let mut gadget_tool = GadgetTool::new(NavBuilderProgram::new(emitter));

        GameState {
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
        match vmsg.name.as_str() {
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
