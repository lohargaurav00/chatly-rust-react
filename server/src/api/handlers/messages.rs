use actix_web::{http::StatusCode, post, web, HttpResponse, Result};
use sqlx::PgPool;

use crate::{
    models::{AddRoomMessage, RoomMessage},
    utils::helpers::{handle_response, Status},
};

pub async fn message(db_pool: &PgPool, msg: AddRoomMessage) -> Result<RoomMessage, sqlx::Error> {
    let message_result = sqlx::query_as::<_, RoomMessage>(
        r#"
        INSERT INTO room_messages (message, room_id, sent_by)
        VALUES ($1, $2, $3) 
        RETURNING *
        "#,
    )
    .bind(msg.message)
    .bind(msg.room_id)
    .bind(msg.sent_by)
    .fetch_one(db_pool)
    .await;

    message_result
}

#[post("/message")]
pub async fn route_message(
    db_pool: web::Data<PgPool>,
    msg: web::Json<AddRoomMessage>,
) -> HttpResponse {
    let message_result = message(db_pool.get_ref(), msg.into_inner()).await;

    match message_result {
        Ok(message) => handle_response(
            StatusCode::OK,
            Status::Ok,
            "message added successfully",
            Some(message),
        ),
        Err(e) => handle_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            Status::Error,
            &format!("Failed to add message: {:?}", e),
            Some(()),
        ),
    }
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(route_message);
}
