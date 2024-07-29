use actix::prelude::*;
use serde_json::json;
use uuid::Uuid;

use std::collections::{HashMap, HashSet};

#[derive(Message)]
#[rtype(result = "()")]
pub struct Message(pub String);

#[derive(Message)]
#[rtype(result = "String")]
pub struct Connect {
    pub addr: Recipient<Message>,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct ClientMessage {
    pub id: Uuid,
    pub msg: String,
    pub room: String,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct Disconnect {
    pub id: Uuid,
}

// #[derive(Message)]
// #[rtype(result = "()")]
// pub struct Room {
//     pub id: usize,
// }

#[derive(Debug)]
pub struct ChatServer {
    sessions: HashMap<Uuid, Recipient<Message>>,
    rooms: HashMap<String, HashSet<Uuid>>,
}

impl ChatServer {
    pub fn new() -> Self {
        ChatServer {
            sessions: HashMap::new(),
            rooms: HashMap::new(),
        }
    }

    fn send_message(&self, room: &str, msg: &str, skip_id: Option<Uuid>) {
        if let Some(members) = self.rooms.get(room) {
            members.iter().for_each(|id| {
                if Some(*id) != skip_id {
                    if let Some(addr) = self.sessions.get(id) {
                        addr.do_send(Message(msg.to_owned()));
                    }
                };
            });
        }
    }
}

impl Actor for ChatServer {
    type Context = Context<Self>;
}

impl Handler<Connect> for ChatServer {
    type Result = String;

    fn handle(&mut self, msg: Connect, _: &mut Self::Context) -> Self::Result {
        let id = Uuid::new_v4();
        self.sessions.insert(id, msg.addr.clone());
        self.rooms
            .entry("main".to_string())
            .or_insert_with(HashSet::new)
            .insert(id);

        self.send_message(
            "main",
            &json!({
                "id": id,
                "chat_type": "message",
                "message": "Welcome to Main Room!"
            })
            .to_string(),
            None,
        );
        id.to_string()
    }
}

impl Handler<Disconnect> for ChatServer {
    type Result = ();
    fn handle(&mut self, msg: Disconnect, _: &mut Self::Context) -> Self::Result {
        self.sessions.remove(&msg.id);
        println!("User {} disconnected", msg.id);
    }
}

impl Handler<ClientMessage> for ChatServer {
    type Result = ();
    fn handle(&mut self, msg: ClientMessage, _: &mut Self::Context) -> Self::Result {
        self.send_message(&msg.room, &msg.msg, None)
    }
}
