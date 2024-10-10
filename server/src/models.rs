// src/models.rs

use serde::{self, Deserialize, Serialize};
use serde_json::Value;
use sqlx::FromRow;
use uuid::Uuid;

//#Models for the database tables

// #User model
#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    #[serde(rename = "username")]
    pub user_name: String,
    pub email: String,
    pub password: String,
    pub image: Option<String>,
    pub created_at: i64,
    pub updated_at: Option<i64>,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct UserWithRooms {
    pub id: Uuid,
    pub name: String,
    #[serde(rename = "username")]
    pub user_name: String,
    pub email: String,
    pub password: String,
    pub image: Option<String>,
    pub created_at: i64,
    pub updated_at: Option<i64>,
    pub rooms: Vec<Room>,
}

// #Room model
#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct NewRoom {
    pub name: String,
    pub created_by: Uuid,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct Room {
    pub id: i32,
    pub name: String,
    pub last_message: Option<String>,
    pub created_by: Uuid,
    pub created_at: i64,
    pub updated_at: Option<i64>,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct RoomWithMembers {
    pub id: i32,
    pub name: String,
    pub last_message: Option<String>,
    pub created_by: Uuid,
    pub created_at: i64,
    pub updated_at: Option<i64>,
    pub members: Option<Value>,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct RoomWithMembersIds {
    pub id: i32,
    pub name: String,
    pub last_message: Option<String>,
    pub created_by: Uuid,
    pub created_at: i64,
    pub updated_at: Option<i64>,
    pub members: Vec<Uuid>,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct JoinRoom {
    pub id: Uuid,
    pub room_id: i32,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct AddRoomMessage {
    pub message: String,
    pub room_id: i32,
    pub sent_by: Uuid,
    pub id : Option<Uuid>,
    pub created_at : Option<i64>
}

#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct RoomMessage {
    pub id: Uuid,
    pub message: String,
    pub room_id: i32,
    pub sent_by: Uuid,
    pub created_at: i64,
    pub updated_at: Option<i64>,
    pub message_type: String,
    pub is_read: bool,
    pub is_edited: bool,
    pub reply_to: Option<Uuid>,
    pub deleted_at: Option<i64>,
    pub status: i32,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct UpdateRoomMessage {
    pub message: String,
    pub id: Uuid,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct GetRoomsMessages {
    pub room_id: i32,
    pub page: Option<i64>,
    pub page_size : Option<i64>
}