use actix_web::{get, http::StatusCode, post, web, HttpResponse};
use sqlx::PgPool;

use crate::{
    models::{NewRoom, Room},
    utils::helpers::{handle_response, Status},
};

#[post("create-room")]
pub async fn create_room(db_pool: web::Data<PgPool>, room: web::Json<NewRoom>) -> HttpResponse {
    let room = NewRoom {
        name: room.name.clone(),
        created_by: room.created_by,
    };

    let result = sqlx::query_as!(
        Room,
        r#"
        INSERT INTO rooms (name, created_by)
        VALUES ($1, $2)
        RETURNING id, name, last_message, created_by, created_at, updated_at
        "#,
        room.name,
        room.created_by,
    )
    .fetch_one(db_pool.get_ref())
    .await;

    match result {
        Ok(room) => handle_response(
            StatusCode::CREATED,
            Status::Ok,
            "Room created successfully",
            Some(room),
        ),
        Err(e) => handle_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            Status::Error,
            &format!("Failed to create room: {:?}", e),
            Some(()),
        ),
    }
}

#[get("rooms")]
pub async fn get_rooms(db_pool: web::Data<PgPool>) -> HttpResponse {
    let rooms_result = sqlx::query_as::<_, Room>("SELECT * FROM rooms")
        .fetch_all(db_pool.get_ref())
        .await;

    match rooms_result {
        Ok(rooms) => handle_response(
            StatusCode::OK,
            Status::Ok,
            "Rooms fetched successfully",
            Some(rooms),
        ),
        Err(e) => handle_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            Status::Error,
            &format!("Failed to fetch rooms: {:?}", e),
            Some(()),
        ),
    }
}

#[get("room/{id}")]
pub async fn get_room_by_id(db_pool: web::Data<PgPool>, id: web::Path<i64>) -> HttpResponse {
    let room_result = sqlx::query_as::<_, Room>(r#"SELECT * FROM rooms WHERE id = $1"#)
        .bind(id.into_inner())
        .fetch_one(db_pool.get_ref())
        .await;

    match room_result {
        Ok(room) => handle_response(
            StatusCode::OK,
            Status::Ok,
            "Room fetched successfully",
            Some(room),
        ),
        Err(e) => handle_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            Status::Error,
            &format!("Failed to fetch room: {:?}", e),
            Some(()),
        ),
    }
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(create_room);
    cfg.service(get_rooms);
    cfg.service(get_room_by_id);
}
