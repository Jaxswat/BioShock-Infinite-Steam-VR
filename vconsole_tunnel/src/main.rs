mod vconsole;
mod math;
mod vtunnel;
mod game;
mod vtunnel_emitter;

use std::sync::{Arc};
use tokio::net::TcpStream;
use tokio_stream::StreamExt;
use tokio_util::codec::{Framed};
use crate::game::elizabeth::Elizabeth;
use crate::game::player::{Player, PlayerInput};
use crate::vtunnel::{VTunnelDeserializable, VTunnelMessage, VTunnelMessageBatch, VTunnelSerializable};
use futures::SinkExt;
use tokio::sync::{mpsc, Mutex};
use crate::game::commands::DrawDebugSphere;
use crate::game::trace::LineTrace;
use crate::math::Vector3;
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

    let emitter = Arc::new(VTunnelEmitter::new(outbox_sender));
    let emitter_receiver = Arc::clone(&emitter);
    let mut console_state = ConsoleState::new(inbox_sender, inbox_reply_sender);
    let mut game_state = GameState::new();

    tokio::spawn(async move {
        while let Some(packet) = outbox_receiver.recv().await {
            let mut framed = framed_sender.lock().await;
            framed.send(packet).await.unwrap();
        }
    });

    tokio::spawn(async move {
        while let Some(vmsg) = inbox_receiver.recv().await {
            game_state.handle_vmsg(&emitter, vmsg).await;
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
    pub fn new(inbox_sender: mpsc::Sender<VTunnelMessage>, inbox_reply_sender: mpsc::Sender<VTunnelMessage>,) -> ConsoleState {
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
}

impl GameState {
    pub fn new() -> GameState {
        GameState {
            last_server_time: 0.0,
            server_time: 0.0,
            liz: Elizabeth::new(),
            player: Player::new(),
        }
    }

    pub fn print_state(&self) {
        println!("Server time: {}", self.server_time);
        println!("Liz: {:?}", self.liz);
        println!("Player: {:?}", self.player);
    }

    pub async fn handle_vmsg(&mut self, emitter: &VTunnelEmitter, vmsg: VTunnelMessage) {
        match vmsg.name.as_str() {
            "liz_state" => self.liz.apply_vtunnel_message(&vmsg),
            "player_state" => self.player.apply_vtunnel_message(&vmsg),
            "player_input" => {
                let mut input = PlayerInput::new();
                input.apply_vtunnel_message(&vmsg);

                let current_trigger = input.trigger == 1.0;
                if current_trigger != self.player.last_trigger && current_trigger && input.trace_hit {
                    let mut trace = LineTrace::new(input.hand_position.clone(), input.trace_position.clone());
                    trace.ignore_entity_id = self.player.user_id;
                    let trace_result = trace.run(emitter).await;
                    if trace_result.is_ok() {
                        let trace_result = trace_result.unwrap();
                        println!("Trace result: {:?}", trace_result);
                    } else {
                        eprintln!("Error running trace: {:?}", trace_result.err());
                    }

                    let is_floor = input.trace_normal.dot(&Vector3::new(0.0, 0.0, 1.0)) > 0.5;
                    let color = if is_floor {
                        Vector3::new(0.0, 255.0, 0.0)
                    } else {
                        Vector3::new(255.0, 0.0, 0.0)
                    };

                    let mut vmsg_batch = VTunnelMessageBatch::new();
                    let offset = 50.0;
                    for x in 0..10 {
                        for y in 0..10 {
                            let draw_sphere = DrawDebugSphere {
                                position: Vector3::new(input.trace_position.x.floor() + (x as f64 * offset), input.trace_position.y.floor() + (y as f64 * offset), input.trace_position.z),
                                color: color.clone(),
                                color_alpha: 1.0,
                                radius: 5.0,
                                z_test: false,
                                duration_seconds: 5.0,
                            };

                            vmsg_batch.add_message(draw_sphere.serialize());
                        }
                    }

                    emitter.send_batch(vmsg_batch).await;
                }
                self.player.last_trigger = current_trigger;

                if input.hand == 0 {
                    self.player.input_left_hand = input;
                } else {
                    self.player.input_right_hand = input;
                }
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
