use actix_web::{delete, get, http::StatusCode, post, put, web, HttpResponse, Result};
use sqlx::PgPool;

use crate::{
    models::{AddRoomMessage, GetRoomsMessages, RoomMessage, UpdateRoomMessage},
    utils::helpers::{handle_response, handle_response_with_count, Status},
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

pub async fn update_message(
    db_pool: &PgPool,
    msg: UpdateRoomMessage,
) -> Result<RoomMessage, sqlx::Error> {
    let message_result = sqlx::query_as::<_, RoomMessage>(
        r#"
        UPDATE room_messages 
        SET message = $1 , is_edited = true
        WHERE id = $2
        RETURNING *
        "#,
    )
    .bind(msg.message)
    .bind(msg.id)
    .fetch_one(db_pool)
    .await;

    message_result
}

#[put("/update-message")]
pub async fn route_update_message(
    db_pool: web::Data<PgPool>,
    msg: web::Json<UpdateRoomMessage>,
) -> HttpResponse {
    let message_result = update_message(db_pool.get_ref(), msg.into_inner()).await;

    match message_result {
        Ok(message) => handle_response(
            StatusCode::OK,
            Status::Ok,
            "message updated successfully",
            Some(message),
        ),
        Err(e) => handle_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            Status::Error,
            &format!("Failed to update message: {:?}", e),
            Some(()),
        ),
    }
}

pub async fn delete_message(db_pool: &PgPool, id: i64) -> Result<RoomMessage, sqlx::Error> {
    let message_result = sqlx::query_as::<_, RoomMessage>(
        r#"
        UPDATE room_messages 
        SET status = 2
        WHERE id = $1
        RETURNING *
        "#,
    )
    .bind(id)
    .fetch_one(db_pool)
    .await;

    message_result
}

#[delete("/delete-message/{id}")]
pub async fn route_delete_message(db_pool: web::Data<PgPool>, id: web::Path<i64>) -> HttpResponse {
    let message_result = delete_message(db_pool.get_ref(), *id).await;

    match message_result {
        Ok(message) => handle_response(
            StatusCode::OK,
            Status::Ok,
            "message deleted successfully",
            Some(message),
        ),
        Err(e) => handle_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            Status::Error,
            &format!("Failed to delete message: {:?}", e),
            Some(()),
        ),
    }
}

pub struct GetRoomMessagesResult {
    pub messages: Vec<RoomMessage>,
    pub count: i64,
}

pub async fn get_messages_by_room_id(
    db_pool: &PgPool,
    data: GetRoomsMessages,
) -> Result<GetRoomMessagesResult, sqlx::Error> {
    let (limit, offset) = match (data.page_size, data.page) {
        (Some(limit), Some(page)) => (limit as i64, (page - 1)  as i64 * limit as i64),
        _ => (100, 0 as i64),
    };

    // Fetch messages with pagination
    let messages = sqlx::query_as::<_, RoomMessage>(
        r#"
        SELECT * FROM room_messages 
        WHERE room_id = $1 AND status = 1
        LIMIT $2 OFFSET $3
        "#,
    )
    .bind(data.room_id)
    .bind(limit)
    .bind(offset)
    .fetch_all(db_pool)
    .await?;

    // Fetch total count of messages in the room
    let count: i64 = sqlx::query_scalar(
        r#"
        SELECT COUNT(*) FROM room_messages
        WHERE room_id = $1 AND status = 1
        "#,
    )
    .bind(data.room_id)
    .fetch_one(db_pool)
    .await?;

    Ok(GetRoomMessagesResult { messages, count })
}

#[get("/messages-by-room-id")]
pub async fn route_get_messages_by_room_id(
    db_pool: web::Data<PgPool>,
    data: web::Query<GetRoomsMessages>,
) -> HttpResponse {
    let message_result = get_messages_by_room_id(db_pool.get_ref(), data.into_inner()).await;

    match message_result {
        Ok(message) => handle_response_with_count(
            StatusCode::OK,
            Status::Ok,
            "Fetched room messages successfully",
            Some(message.messages),
            message.count,
        ),
        Err(e) => handle_response_with_count(
            StatusCode::INTERNAL_SERVER_ERROR,
            Status::Error,
            &format!("Failed to fetch room messages: {:?}", e),
            Some(()),
            0,
        ),
    }
}
pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(route_message);
    cfg.service(route_update_message);
    cfg.service(route_delete_message);
    cfg.service(route_get_messages_by_room_id);
}
