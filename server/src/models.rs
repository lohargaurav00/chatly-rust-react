// src/models.rs

use serde::{self, Deserialize, Serialize};
use sqlx::prelude::FromRow;
use uuid::Uuid;

#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct NewRoom {
    pub name: String,
    pub created_by: Uuid,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct Room {
    pub id: i64,
    pub name: String,
    pub last_message: Option<String>,
    pub created_by: Uuid,
    pub created_at: i64,
    pub updated_at: Option<i64>,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    #[serde(rename = "username")]
    pub user_name: String,
    pub email: String,
    pub password: String,
    pub profile_photo: Option<String>,
    pub created_at: i64,
    pub updated_at: Option<i64>,
}
