use actix::prelude::*;
use actix::{Actor, StreamHandler};
use actix_web_actors::ws;
use serde::{Deserialize, Serialize};
use serde_json;
use sqlx::PgPool;
use std::time::{Duration, Instant};
use uuid::Uuid;

use crate::server::{self, ClientMessage, CreateRoom, JoinRoom};

const HEARTBEAT: Duration = Duration::from_secs(5);
const CLINT_TIMEOUT: Duration = Duration::from_secs(10);

pub struct MyWs {
    pub id: Uuid,
    pub hb: Instant,
    pub addr: Addr<server::ChatServer>,
    pub db_pool: PgPool,
}

#[derive(Serialize, Deserialize, Debug)]
pub enum Mode {
    Chat,
    JoinRoom,
    CreateRoom,
}

#[derive(Serialize, Deserialize, Debug)]
struct ClientInteraction {
    id: Option<Uuid>,
    mode: Mode,
    message: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct ChatMessage {
    id: Option<Uuid>,
    chat_type: String,
    message: String,
    room_id: i32,
}

impl Actor for MyWs {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        self.hb(ctx);
        let addr = ctx.address();

        self.addr
            .send(server::Connect {
                id: self.id,
                addr: addr.recipient(),
                db_pool: self.db_pool.clone(),
            })
            .into_actor(self)
            .then(|res, act, ctx| {
                match res {
                    Ok(_res) => act.id = Uuid::parse_str(&_res).unwrap(),
                    _ => ctx.stop(),
                }
                fut::ready(())
            })
            .wait(ctx)
    }

    fn stopping(&mut self, _: &mut Self::Context) -> Running {
        self.addr.do_send(server::Disconnect { id: self.id });
        Running::Stop
    }
}

impl Handler<server::Message> for MyWs {
    type Result = ();
    fn handle(&mut self, msg: server::Message, ctx: &mut Self::Context) -> Self::Result {
        ctx.text(msg.0);
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for MyWs {
    fn handle(&mut self, item: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        let msg = match item {
            Err(_) => {
                ctx.stop();
                return;
            }
            Ok(msg) => msg,
        };

        match msg {
            ws::Message::Ping(msg) => {
                self.hb = Instant::now();
                ctx.pong(&msg)
            }
            ws::Message::Pong(_) => {
                self.hb = Instant::now();
            }
            ws::Message::Text(text) => {
                let json_msg = serde_json::from_str::<ClientInteraction>(&text.to_string());
                if let Err(err) = json_msg {
                    println!("{err}");
                    println!("Failed To Parse Message: {}", text);
                    return;
                }
                let inp_msg = json_msg.as_ref().unwrap();
                match inp_msg.mode {
                    Mode::JoinRoom => {
                        let inp = serde_json::from_str::<JoinRoom>(&inp_msg.message);
                        if let Err(err) = inp {
                            println!("{err}");
                            println!("Failed To Parse Message: {}", inp_msg.message);
                            return;
                        }
                        let inp_msg = inp.as_ref().unwrap();
                        self.addr.do_send(server::JoinRoom {
                            id: self.id,
                            room_id: inp_msg.room_id.clone(),
                        });
                        return;
                    }
                    Mode::CreateRoom => {
                        let inp = serde_json::from_str::<CreateRoom>(&inp_msg.message);
                        if let Err(err) = inp {
                            println!("{err}");
                            println!("Failed To Parse Message: {}", inp_msg.message);
                            return;
                        }
                        let inp_msg = inp.as_ref().unwrap();
                        self.addr.do_send(server::CreateRoom {
                            id: self.id,
                            name: inp_msg.name.clone(),
                        });
                        return;
                    }
                    Mode::Chat => {
                        let inp = serde_json::from_str::<ChatMessage>(&inp_msg.message);
                        if let Err(err) = inp {
                            println!("{err}");
                            println!("Failed To Parse Message: {}", inp_msg.message);
                            return;
                        }

                        let inp_msg = inp.as_ref().unwrap();

                        let chat_msg = ChatMessage {
                            id: Some(self.id),
                            chat_type: "message".to_string(),
                            message: inp_msg.message.clone(),
                            room_id: inp_msg.room_id.clone(),
                        };

                        let msg = serde_json::to_string(&chat_msg).unwrap();

                        self.addr.do_send(ClientMessage {
                            id: self.id,
                            msg,
                            room: inp_msg.room_id.clone(),
                        })
                    }
                }
            }
            ws::Message::Binary(bin) => ctx.binary(bin),
            ws::Message::Close(reason) => {
                ctx.close(reason);
                ctx.stop();
            }
            ws::Message::Continuation(_) => {
                ctx.stop();
            }
            ws::Message::Nop => (),
        }
    }
}

impl MyWs {
    fn hb(&self, ctx: &mut ws::WebsocketContext<Self>) {
        ctx.run_interval(HEARTBEAT, |act, ctx| {
            if Instant::now().duration_since(act.hb) > CLINT_TIMEOUT {
                act.addr.do_send(server::Disconnect { id: act.id });
                ctx.stop();
                return;
            }
            ctx.ping(b"ping")
        });
    }
}
