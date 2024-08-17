use actix_web::{get, http::StatusCode, post, web, HttpResponse};
use sqlx::PgPool;

use crate::{
    models::{JoinRoom, NewRoom, Room, RoomWithMembers},
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

#[post("join-room")]
pub async fn join_room(db_pool: web::Data<PgPool>, join_room: web::Json<JoinRoom>) -> HttpResponse {
    let join_room = JoinRoom {
        id: join_room.id.clone(),
        room_id: join_room.room_id.clone(),
    };

    let join_result = sqlx::query_as!(
        RoomWithMembers,
        r#"
WITH inserted AS (
    INSERT INTO room_users (room_id, user_id)
    VALUES ($1, $2)
    RETURNING room_id, user_id
)
SELECT 
    r.id, 
    r.name, 
    r.last_message, 
    r.created_by, 
    r.created_at, 
    r.updated_at, 
    COALESCE(
        json_agg(row_to_json(u)),
        '[]'
    ) AS members
FROM rooms r
LEFT JOIN (
    SELECT ru.room_id, u.*
    FROM room_users ru
    JOIN users u ON u.id = ru.user_id
    WHERE ru.room_id IN (SELECT room_id FROM inserted)
    UNION ALL
    SELECT i.room_id, u.*
    FROM inserted i
    JOIN users u ON u.id = i.user_id
) u ON u.room_id = r.id
WHERE r.id IN (SELECT room_id FROM inserted)
GROUP BY r.id;

"#,
        join_room.room_id,
        join_room.id
    )
    .fetch_all(db_pool.get_ref())
    .await;

    match join_result {
        Ok(room) => handle_response(
            StatusCode::OK,
            Status::Ok,
            "Room joined successfully",
            Some(room),
        ),
        Err(e) => handle_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            Status::Error,
            &format!("Failed to join room: {:?}", e),
            Some(()),
        ),
    }
}

#[get("room-with-members/{id}")]
pub async fn get_room_with_members(db_pool: web::Data<PgPool>, id: web::Path<i32>) -> HttpResponse {
    let room_result = sqlx::query_as!(
        RoomWithMembers,
        r#"
    SELECT 
    r.*,
    COALESCE(
        json_agg(row_to_json(u)),
        '[]'
    ) AS members
FROM rooms r
LEFT JOIN room_users ru ON ru.room_id = r.id
LEFT JOIN users u ON u.id = ru.user_id
WHERE r.id = $1
GROUP BY r.id;
"#,
        id.into_inner()
    )
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
    cfg.service(join_room);
    cfg.service(get_room_with_members);
}
