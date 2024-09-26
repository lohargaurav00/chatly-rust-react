use actix::prelude::*;
use futures::executor;
use log::info;
use serde::{Deserialize, Serialize};
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;

use std::{
    collections::{HashMap, HashSet},
    fmt::Display,
};

use crate::{
    api::handlers::rooms::{create_room, get_rooms_with_members_ids},
    models::NewRoom,
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
    pub id: Uuid,
    pub msg: String,
    pub room: i32,
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

#[derive(Message, Deserialize, Serialize, Debug)]
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

#[derive(Debug)]
pub struct ChatServer {
    sessions: HashMap<Uuid, Recipient<Message>>,
    // sessions_rooms: HashMap<String, CreateRoom>,
    rooms: HashMap<i32, HashSet<Uuid>>,
    db_pool: Option<PgPool>,
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct Error {
    pub id: Uuid,
    pub chat_type: String,
    pub message: String,
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
            println!("Room does not exist : {}", room);
        }
    }
}

impl Actor for ChatServer {
    type Context = Context<Self>;
}

impl Handler<AddRoom> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: AddRoom, _: &mut Self::Context) -> Self::Result {
        self.rooms.entry(msg.room_id).or_default().insert(msg.id);
        info!("new room: {:?}", self.rooms );
    }
}

impl Handler<Connect> for ChatServer {
    type Result = String;

    fn handle(&mut self, msg: Connect, _: &mut Self::Context) -> Self::Result {
        let id = msg.id;
        let db_pool = msg.db_pool.clone();
        self.db_pool = Some(msg.db_pool.clone());
        self.sessions.insert(id, msg.addr.clone());

        // self.send_message(
        //     &0,
        //     &json!({
        //         "id": id,
        //         "chat_type": "message",
        //         "message": "Welcome to Main Room!"
        //     })
        //     .to_string(),
        //     None,
        // );

        let rooms_result = executor::block_on(get_rooms_with_members_ids(&db_pool));

        let rooms = match rooms_result {
            Ok(rooms) => rooms,
            Err(e) => {
                println!("Failed to fetch rooms: {:?}", e);
                vec![]
            }
        };

        for room in rooms.iter() {
            let entry = self.rooms.entry(room.id).or_insert_with(HashSet::new);
            room.members.iter().for_each(|id| {
                entry.insert(*id);
            });
        }

        println!("sessions: {:?}, rooms : {:?}", self.sessions, self.rooms);
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
        let room_id = msg.room;

        if let Some(_) = self.rooms.get(&room_id) {
            self.send_message(&room_id, &msg.msg, None)
        }
    }
}

impl Handler<CreateRoom> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: CreateRoom, ctx: &mut Self::Context) -> Self::Result {
        // TODO: create room to database and get the room id
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
                        // If room creation succeeds, send AddRoom message
                        let add_room_result = addr
                            .send(AddRoom {
                                id: user_id.clone(),
                                room_id: room.id,
                            })
                            .await;

                        if let Err(err) = add_room_result {
                            println!("Failed to add room: {:?}", err);
                        }
                    }
                    Err(err) => {
                        println!("Failed to create room: {:?}", err);
                    }
                }
            }
            .into_actor(self),
        );
    }

    // let room_result = executor::block_on(create_room(db_pool, room));

    // let room = match room_result {
    //     Ok(room) => room,
    //     Err(_) => (),
    // };
    // TODO: add the room to the rooms hashmap

    // self.rooms
    //     .entry(msg.room_id.clone())
    //     .or_insert_with(HashSet::new)
    //     .insert(msg_id);

    // self.sessions_rooms.insert(msg.room_id.to_string(), msg);
    // println!(
    //     "sessions: {:?}, rooms : {:?}, session_rooms: {:?} ",
    //     self.sessions, self.rooms, self.sessions_rooms
    // );
}

impl Handler<JoinRoom> for ChatServer {
    type Result = ();

    fn handle(&mut self, msg: JoinRoom, _: &mut Self::Context) -> Self::Result {
        let is_room_exist = self.rooms.contains_key(&msg.room_id);
        if is_room_exist {
            self.send_message(
                &msg.room_id,
                &json!({
                    "id": msg.id,
                    "chat_type": "message",
                    "message": format!("{} Joined the room", msg.id)
                })
                .to_string(),
                None,
            );

            if let Some(room_members) = self.rooms.get_mut(&msg.room_id) {
                room_members.insert(msg.id);
            }
        } else {
            if let Some(addr) = self.sessions.get(&msg.id) {
                addr.do_send(Message(
                    Error {
                        id: msg.id,
                        chat_type: "error".to_string(),
                        message: format!("Room does not exist with {} this id", msg.room_id),
                    }
                    .to_string(),
                ));
            }
        }
    }
}
