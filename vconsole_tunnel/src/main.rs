mod vconsole;
mod math;
mod vtunnel;
mod game;

use std::sync::{Arc};
use tokio::io::AsyncWriteExt;
use tokio::net::TcpStream;
use tokio_stream::StreamExt;
use tokio_util::codec::{Framed};
use crate::game::elizabeth::Elizabeth;
use crate::game::player::{Player, PlayerInput};
use crate::vtunnel::{encode_vtunnel_message, VTunnelDeserializable, VTunnelMessage, VTunnelSerializable};
use futures::SinkExt;
use tokio::sync::{mpsc, Mutex};
use crate::game::commands::DrawDebugSphere;
use crate::math::Vector3;
use crate::vconsole::{Packet, PacketCodec};


#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let stream = TcpStream::connect("127.0.0.1:29009").await?;
    let framed = Framed::new(stream, vconsole::PacketCodec);
    let (mut sender, mut receiver) = mpsc::channel(100);

    let sender_clone = sender.clone();
    let framed_arc = Arc::new(Mutex::new(framed));
    let framed_clone = Arc::clone(&framed_arc);

    let mut state = ServerState::new(sender_clone);

    tokio::spawn(async move {
        while let Some(packet) = receiver.recv().await {
            let mut framed = framed_clone.lock().await;
            framed.send(packet).await.unwrap();
        }
    });

    loop {
        let mut framed = framed_arc.lock().await;
        let packet = framed.next().await;

        match packet {
            Some(Ok(packet)) => {
                state.handle_packet(packet).await;
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

struct ServerState {
    sender: mpsc::Sender<Packet>,

    program_args: String,
    addon_name: String,
    channels: Vec<String>,
    convars: Vec<String>,
    config_vars: Vec<String>,
    buffer_skipped: bool,
    packets_received: usize,

    last_server_time: f64,
    server_time: f64,
    liz: Elizabeth,
    player: Player,
}

impl ServerState {
    pub fn new(sender: mpsc::Sender<Packet>) -> ServerState {
        ServerState {
            sender,

            program_args: String::new(),
            addon_name: String::new(),
            channels: vec![],
            convars: vec![],
            config_vars: vec![],
            buffer_skipped: false,
            packets_received: 0,

            last_server_time: 0.0,
            server_time: 0.0,
            liz: Elizabeth::new(),
            player: Player::new(),
        }
    }

    pub fn print_initial_state(&self) {
        println!("Program args: {}", self.program_args);
        println!("Addon: {}", self.addon_name);
        println!("Channels: {:?}", self.channels.len());
        println!("Convars: {:?}", self.convars.len());
        println!("Config vars: {:?}", self.config_vars.len());
        println!("Packet count: {}", self.packets_received);
    }

    pub fn print_game_state(&self) {
        println!("Server time: {}", self.server_time);
        println!("Liz: {:?}", self.liz);
        println!("Player: {:?}", self.player);
    }

    pub async fn handle_packet(&mut self, packet: vconsole::Packet) {
        if self.packets_received == 4000 {
            self.buffer_skipped = true;
            self.print_initial_state();
        }

        match packet.packet_type {
            vconsole::PacketType::PRINT => {
                let print_data = packet.get_print_data();
                // if print_data.contains("End VConsole Buffered Messages") {
                //     self.buffer_skipped = true;
                //     self.last_server_time = 0.0; // reset on game reload
                // }

                if self.buffer_skipped {
                    let msg = vtunnel::parse_vtunnel_message(&print_data);
                    if msg.is_some() {
                        let msg = msg.unwrap();

                        match msg.name.as_str() {
                            "liz_state" => self.liz.apply_vtunnel_message(&msg),
                            "player_state" => self.player.apply_vtunnel_message(&msg),
                            "player_input" => {
                                let mut input = PlayerInput::new();
                                input.apply_vtunnel_message(&msg);

                                let current_trigger = input.trigger == 1.0;
                                if current_trigger != self.player.last_trigger && current_trigger && input.trace_hit {
                                    let is_floor = input.trace_normal.dot(&Vector3::new(0.0, 0.0, 1.0)) > 0.5;
                                    let color = if is_floor {
                                        Vector3::new(0.0, 255.0, 0.0)
                                    } else {
                                        Vector3::new(255.0, 0.0, 0.0)
                                    };

                                    let vmsg = DrawDebugSphere {
                                        position: input.trace_position.clone(),
                                        color,
                                        color_alpha: 1.0,
                                        radius: 5.0,
                                        z_test: false,
                                        duration_seconds: 5.0,
                                    }.serialize();

                                    self.sender.send(vconsole::VTunnelMessagePacket::new(vmsg).to_packet()).await.unwrap();
                                }
                                self.player.last_trigger = current_trigger;

                                if input.hand == 0 {
                                    self.player.input_left_hand = input;
                                } else {
                                    self.player.input_right_hand = input;
                                }
                            }
                            "world_state" => self.server_time = msg.data[0].get_float().unwrap_or_default(),
                            _ => {}
                        }

                        if self.server_time - self.last_server_time > 1.0 {
                            self.print_game_state();
                            self.last_server_time = self.server_time;
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
