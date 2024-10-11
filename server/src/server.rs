use actix::prelude::*;

use log::{info, warn};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;

use std::{
    collections::{HashMap, HashSet},
    fmt::Display,
};

use crate::{
    api::handlers::{
        messages::message,
        rooms::{create_room, get_rooms_with_members_ids, join_room_fn},
    },
    models::{AddRoomMessage, JoinRoom as ModelJoinRoom, NewRoom},
};

#[derive(Message)]
#[rtype(result = "()")]
pub struct Message(pub String);

#[derive(Message)]
#[rtype(result = "String")]
pub struct Connect {
    pub id: Uuid,
    pub addr: Recipient<Message>,
    pub db_pool: PgPool,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct ClientMessage {
    // pub id: Uuid,
    pub msg: String,
    pub room: i32,
    pub add_message: Option<AddRoomMessage>,
}

#[derive(Message)]
#[rtype(result = "()")]
pub struct Disconnect {
    pub id: Uuid,
}

#[derive(Message, Debug, Default, Deserialize, Serialize)]
#[rtype(result = "()")]
pub struct CreateRoom {
    pub id: Uuid,
    pub name: String,
}

#[derive(Message, Deserialize, Serialize, Debug, Clone)]
#[rtype(result = "()")]
pub struct JoinRoom {
    pub id: Uuid,
    pub room_id: i32,
}

#[derive(Message, Deserialize, Serialize, Debug)]
#[rtype(result = "()")]
pub struct AddRoom {
    pub id: Uuid,
    pub room_id: i32,
}

#[derive(Message, Deserialize, Serialize, Debug, Clone)]
#[rtype(result = "()")]
pub struct AddRoomBulk {
    pub room_id: i32,
    pub member_ids: Vec<Uuid>,
}

#[derive(Debug)]
pub struct ChatServer {
    sessions: HashMap<Uuid, Recipient<Message>>,
    // sessions_rooms: HashMap<String, CreateRoom>,
    rooms: HashMap<i32, HashSet<Uuid>>,
    db_pool: Option<PgPool>,
}

#[derive(Message, Debug, Default, Serialize, Deserialize)]
#[rtype(result = "()")]
pub struct Error {
    pub id: Uuid,
    pub chat_type: String,
    pub message: String,
}

#[derive(Message, Debug, Clone, Serialize)]
#[rtype(result = "()")]
pub struct SendMessage {
    pub room_id: i32,
    pub msg: String,
    pub skip_id: Option<Uuid>,
}

#[derive(Message, Debug, Clone, Serialize)]
#[rtype(result = "()")]
pub struct Info {
    id: Uuid,
    msg: String,
}

impl Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{}", json!(self))
    }
}

impl ChatServer {
    pub fn new() -> Self {
        ChatServer {
            sessions: HashMap::new(),
            // sessions_rooms: HashMap::new(),
            rooms: HashMap::new(),
            db_pool: None,
        }
    }

    fn send_message(&self, room: &i32, msg: &str, skip_id: Option<Uuid>) {
        if let Some(members) = self.rooms.get(room) {
            members.iter().for_each(|id| {
                if Some(*id) != skip_id {
                    if let Some(addr) = self.sessions.get(id) {
                        addr.do_send(Message(msg.to_owned()));
                    }
                };
            });
        } else {
            info!("Room does not exist : {}", room);
        }
    }
}

impl Actor for ChatServer {
    type Context = Context<Self>;
}

impl Handler<AddRoom> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: AddRoom, _: &mut Self::Context) -> Self::Result {
        self.rooms
            .entry(msg.room_id)
            .and_modify(|members| {
                members.insert(msg.id);
            })
            .or_insert_with(|| {
                let mut members = HashSet::new();
                members.insert(msg.id);
                members
            });
        info!("updated rooms: {:?}", self.rooms);
    }
}

impl Handler<AddRoomBulk> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: AddRoomBulk, _: &mut Self::Context) -> Self::Result {
        self.rooms
            .entry(msg.room_id)
            .or_insert_with(HashSet::new)
            .extend(msg.member_ids);

        info!("sessions: {:?}, rooms : {:?}", self.sessions, self.rooms);
    }
}

impl Handler<Error> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: Error, _: &mut Self::Context) -> Self::Result {
        if let Some(addr) = self.sessions.get_mut(&msg.id) {
            addr.do_send(Message(msg.to_string()));
        }
    }
}

impl Handler<SendMessage> for ChatServer {
    type Result = ();
    fn handle(&mut self, msg: SendMessage, _: &mut Self::Context) -> Self::Result {
        self.send_message(&msg.room_id, &msg.msg, msg.skip_id);
    }
}

impl Handler<Info> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: Info, _: &mut Self::Context) -> Self::Result {
        if let Some(addr) = self.sessions.get_mut(&msg.id) {
            addr.do_send(Message(msg.msg));
        }
    }
}

impl Handler<Connect> for ChatServer {
    type Result = String;

    fn handle(&mut self, msg: Connect, ctx: &mut Self::Context) -> Self::Result {
        let id = msg.id;
        let db_pool = msg.db_pool.clone();
        self.db_pool = Some(db_pool.clone());
        self.sessions.insert(id, msg.addr.clone());
        let addr = ctx.address();

        ctx.spawn(
            async move {
                let rooms_result = get_rooms_with_members_ids(&db_pool).await;
                match rooms_result {
                    Ok(rooms_data) => {
                        for room in rooms_data.iter() {
                            // Collect all member IDs for the room
                            let member_ids: Vec<Uuid> = room.members.clone();

                            // Create a bulk message for adding all members to the room
                            let room_to_add_bulk = AddRoomBulk {
                                room_id: room.id,
                                member_ids,
                            };

                            // Send a single message to the actor for bulk room addition
                            let add_room_result = addr.send(room_to_add_bulk.clone()).await;

                            if let Err(err) = add_room_result {
                                warn!(
                                    "Error: {:?} while adding room in bulk: {:?}",
                                    err, room_to_add_bulk
                                );
                            }
                        }
                    }
                    Err(e) => {
                        println!("Failed to fetch rooms: {:?}", e);
                    }
                };
            }
            .into_actor(self),
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
    fn handle(&mut self, msg: ClientMessage, ctx: &mut Self::Context) -> Self::Result {
        let room_id = msg.room;
        let db_pool = self.db_pool.clone().unwrap();

        if let Some(_) = self.rooms.get(&room_id) {
            let new_msg = json!({"chat_type": "message", "message": msg.msg }).to_string();
            self.send_message(&room_id, &new_msg, None)
        }

        if let Some(add_message) = msg.add_message {
            ctx.spawn(
                async move {
                    let _ = message(&db_pool, add_message).await;
                }
                .into_actor(self),
            );
        }
    }
}

impl Handler<CreateRoom> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: CreateRoom, ctx: &mut Self::Context) -> Self::Result {
        let db_pool = self.db_pool.clone();
        let room_name = msg.name.clone();
        let user_id = msg.id.clone();

        let addr = ctx.address();

        ctx.spawn(
            async move {
                let room = NewRoom {
                    name: room_name,
                    created_by: user_id.clone(),
                };

                // Attempt to create the room in the database
                let room_result = create_room(&db_pool.unwrap(), room).await;

                match room_result {
                    Ok(room) => {
                        let _ = addr.do_send(AddRoom {
                            id: user_id.clone(),
                            room_id: room.id,
                        });
                        addr.do_send(Info {
                            id: msg.id,
                            msg: json!({
                                "create_room": room,
                                "chat_type": "info",
                                "message": "Room Created Successfully"
                            })
                            .to_string(),
                        });
                    }
                    Err(err) => {
                        println!("Failed to create room: {:?}", err);
                    }
                }
            }
            .into_actor(self),
        );
    }
}

impl Handler<JoinRoom> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: JoinRoom, ctx: &mut Self::Context) -> Self::Result {
        let is_room_exist = self.rooms.contains_key(&msg.room_id);

        if is_room_exist {
            let db_pool = self.db_pool.clone().unwrap();
            let addr = ctx.address();

            ctx.spawn(
                async move {
                    let join_room = {
                        ModelJoinRoom {
                            id: msg.id.clone(),
                            room_id: msg.room_id.clone(),
                        }
                    };
                    let join_room_result = join_room_fn(&db_pool, join_room).await;

                    match join_room_result {
                        Ok(joined) => {
                            // If successful, add the user to the room
                            let _ = addr
                                .send(AddRoom {
                                    id: msg.id.clone(),
                                    room_id: msg.room_id.clone(),
                                })
                                .await;

                            addr.do_send(SendMessage {
                                room_id: msg.room_id,
                                msg: json!({
                                    "id": msg.id,
                                    "chat_type": "message",
                                    "message": format!("{} Joined the room", msg.id)
                                })
                                .to_string(),
                                skip_id: None,
                            });

                            addr.do_send(Info {
                                id: msg.id,
                                msg: json!({
                                    "join_room": joined,
                                    "chat_type": "info",
                                    "message": "Successfully joined room"
                                })
                                .to_string(),
                            });
                        }
                        Err(e) => {
                            addr.do_send(Error {
                                id: msg.id,
                                chat_type: "error".to_string(),
                                message: format!("Failed to join room: {}", e),
                            });
                        }
                    }
                }
                .into_actor(self),
            );
        } else {
            // Room doesn't exist, send an error message to the user
            if let Some(addr) = self.sessions.get(&msg.id) {
                addr.do_send(Message(
                    Error {
                        id: msg.id,
                        chat_type: "error".to_string(),
                        message: format!("Room does not exist with id {}", msg.room_id),
                    }
                    .to_string(),
                ));
            }
        }
    }
}
