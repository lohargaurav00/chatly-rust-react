use actix_web::{get, http::StatusCode, post, web, HttpResponse};
use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    models::{JoinRoom, NewRoom, Room, RoomWithMembers, RoomWithMembersIds},
    utils::helpers::{handle_response, Status},
};

#[post("create-room")]
pub async fn route_create_room(
    db_pool: web::Data<PgPool>,
    room: web::Json<NewRoom>,
) -> HttpResponse {
    let room = NewRoom {
        name: room.name.clone(),
        created_by: room.created_by.clone(),
    };

    let result = create_room(&db_pool, room).await;

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

pub async fn create_room(db_pool: &PgPool, room: NewRoom) -> Result<Room, sqlx::Error> {
    let result = sqlx::query_as!(
        Room,
        r#"
    WITH create_room AS (
    INSERT INTO rooms (name, created_by)
    VALUES ($1, $2)
    RETURNING id, name, last_message, created_by, created_at, updated_at
    ),
    insert_room_users AS (INSERT INTO room_users (room_id, user_id)
    SELECT id, created_by
    FROM create_room
    RETURNING *
    )
    SELECT * from create_room; 
        "#,
        room.name,
        room.created_by,
    )
    .fetch_one(db_pool)
    .await;

    result
}

#[get("rooms")]
pub async fn route_get_rooms(db_pool: web::Data<PgPool>) -> HttpResponse {
    let rooms_result = get_rooms(db_pool.get_ref()).await;
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

pub async fn get_rooms(db_pool: &PgPool) -> Result<Vec<Room>, sqlx::Error> {
    let rooms_result = sqlx::query_as::<_, Room>("SELECT * FROM rooms")
        .fetch_all(db_pool)
        .await;

    rooms_result
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

pub async fn join_room_fn(
    db_pool: &PgPool,
    join_room: JoinRoom,
) -> Result<RoomWithMembers, sqlx::Error> {
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
    .fetch_one(db_pool)
    .await;

    join_result
}

#[post("join-room")]
pub async fn route_join_room(
    db_pool: web::Data<PgPool>,
    join_room: web::Json<JoinRoom>,
) -> HttpResponse {
    let join_room = JoinRoom {
        id: join_room.id.clone(),
        room_id: join_room.room_id.clone(),
    };

    let join_result = join_room_fn(&db_pool, join_room).await;
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

pub async fn get_rooms_with_members_ids(
    db_pool: &PgPool,
) -> Result<Vec<RoomWithMembersIds>, sqlx::Error> {
    let rooms_result = sqlx::query_as::<_, RoomWithMembersIds>(
        r#"
        SELECT 
r.*,
COALESCE(
	array_agg(u.id),
	'{}'
) AS members
FROM rooms r
LEFT JOIN room_users ru ON ru.room_id = r.id
LEFT JOIN users u ON u.id = ru.user_id
GROUP BY r.id;
"#,
    )
    .fetch_all(db_pool)
    .await;

    rooms_result
}

#[get("/rooms-with-members-ids")]
pub async fn route_get_rooms_with_members_id(db_pool: web::Data<PgPool>) -> HttpResponse {
    let rooms_result = get_rooms_with_members_ids(db_pool.get_ref()).await;
    match rooms_result {
        Ok(rooms) => handle_response(
            StatusCode::OK,
            Status::Ok,
            "Room fetched successfully",
            Some(rooms),
        ),
        Err(e) => handle_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            Status::Error,
            &format!("Failed to fetch room: {:?}", e),
            Some(()),
        ),
    }
}

pub async fn get_user_rooms(db_pool: &PgPool, user_id: Uuid) -> Result<Vec<Room>, sqlx::Error> {
    let rooms_result = sqlx::query_as::<_, Room>(
        r#"
SELECT r.*
FROM room_users as ru
JOIN rooms as r ON ru.room_id = r.id
where ru.user_id = $1
    "#,
    )
    .bind(user_id)
    .fetch_all(db_pool)
    .await;

    rooms_result
}

#[get("/get-user-rooms/{user_id}")]
pub async fn route_get_user_rooms(
    db_pool: web::Data<PgPool>,
    user_id: web::Path<Uuid>,
) -> HttpResponse {
    let rooms_result = get_user_rooms(&db_pool, *user_id).await;

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
            &format!("Failed to fetched rooms {:?}", e),
            Some(()),
        ),
    }
}

pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(route_create_room);
    cfg.service(route_get_rooms);
    cfg.service(get_room_by_id);
cfg.service(route_join_room);
    cfg.service(get_room_with_members);
    cfg.service(route_get_rooms_with_members_id);
    cfg.service(route_get_user_rooms);
}
