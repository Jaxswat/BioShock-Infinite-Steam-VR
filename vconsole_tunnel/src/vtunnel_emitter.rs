use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration};
use tokio::sync::{mpsc, Mutex, oneshot, RwLock};
use tokio::time::timeout;
use crate::vconsole;
use crate::vconsole::Packet;
use crate::vtunnel::{VTunnelMessage, VTunnelMessageBatch, VTunnelSerializable};

pub struct VTunnelEmitter {
    sender: mpsc::Sender<Packet>,
    request_id_sequence: Arc<Mutex<u64>>,
    pending_requests: Arc<RwLock<HashMap<u64, oneshot::Sender<VTunnelMessage>>>>,
    default_timeout: Duration,
}

impl VTunnelEmitter {
    pub fn new(sender: mpsc::Sender<Packet>) -> VTunnelEmitter {
        VTunnelEmitter {
            sender,
            request_id_sequence: Arc::new(Mutex::new(0)),
            pending_requests: Arc::new(RwLock::new(HashMap::new())),
            default_timeout: Duration::from_secs(5),
        }
    }

    pub async fn send_vmsg(&self, vmsg: VTunnelMessage) {
        self.sender.send(vconsole::VTunnelMessagePacket::new(vmsg).to_packet()).await.unwrap();
    }

    pub async fn send<T: VTunnelSerializable + Send + 'static>(&self, msg: &T) {
        let vmsg = msg.serialize();
        self.sender.send(vconsole::VTunnelMessagePacket::new(vmsg).to_packet()).await.unwrap();
    }

    pub async fn send_batch(&self, batch: VTunnelMessageBatch) {
        let chunk_size = 5; // Command length limit seems to be 512, this might not always work depending on the payload size.
        let chunked_messages: Vec<Vec<VTunnelMessage>> = batch
            .messages
            .chunks(chunk_size)
            .map(|chunk| chunk.to_vec())
            .collect();

        for (_, messages) in chunked_messages.iter().enumerate() {
            let chunked_batch = VTunnelMessageBatch::new_from_vec(messages.to_vec());
            self.sender.send(vconsole::VTunnelMessageBatchPacket::new(chunked_batch).to_packet()).await.unwrap();
        }
    }

    pub async fn send_request<T: VTunnelSerializable + Send + 'static>(&self, msg: T) -> Result<VTunnelMessage, std::io::Error> {
        let mut vmsg = msg.serialize();
        let mut request_id = vmsg.id;
        if request_id == 0 {
            let mut request_id_sequence = self.request_id_sequence.lock().await;
            *request_id_sequence += 1;
            request_id = *request_id_sequence;
            vmsg.set_id(request_id);
        };

        let (sender, receiver) = oneshot::channel();
        {
            let mut pending_requests = self.pending_requests.write().await;
            pending_requests.insert(request_id, sender);
        }

        self.sender.send(vconsole::VTunnelMessagePacket::new(vmsg).to_packet()).await.unwrap();

        match timeout(self.default_timeout, receiver).await {
            Ok(result) => result.map_err(|_| std::io::Error::new(std::io::ErrorKind::Other, "Oneshot channel closed")),
            Err(_) => Err(std::io::Error::new(std::io::ErrorKind::TimedOut, "Request timed out")),
        }
    }

    pub async fn handle_reply(&self, vmsg: VTunnelMessage) {
        let mut pending_requests = self.pending_requests.write().await;
        let sender = pending_requests.remove(&vmsg.id);
        if let Some(sender) = sender {
            sender.send(vmsg).unwrap_or_default();
        }
    }
}
