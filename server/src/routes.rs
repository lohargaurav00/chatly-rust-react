use actix::Addr;
use actix_web::{get, web, Error, HttpRequest, HttpResponse, Responder};
use actix_web_actors::ws;
use sqlx::PgPool;
use std::time::Instant;
use uuid::Uuid;

use crate::{server, session};

#[get("/")]
pub async fn greet() -> impl Responder {
    HttpResponse::Ok().body("Hello World")
}

pub async fn ws_handler(
    srv: web::Data<Addr<server::ChatServer>>,
    req: HttpRequest,
    stream: web::Payload,
    db_pool: web::Data<PgPool>,
) -> Result<HttpResponse, Error> {
    println!("starting socket...");
    let resp = ws::start(
        session::MyWs {
            id: Uuid::new_v4(),
            hb: Instant::now(),
            addr: srv.get_ref().clone(),
            db_pool: db_pool.get_ref().clone(),
        },
        &req,
        stream,
    );

    println!("response from server : {:?}", resp);
    match resp {
        Ok(response) => {
            println!("WebSocket connection established successfully.");
            Ok(response)
        }
        Err(e) => {
            eprintln!("Failed to start WebSocket connection: {:?}", e);
            Err(e)
        }
    }
}
