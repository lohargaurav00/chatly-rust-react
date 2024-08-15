// src/models.rs

use serde::{Deserialize, Serialize};
use sqlx::{prelude::FromRow};
use uuid::Uuid;

#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct Room {
    pub id: String,
    pub name: String,
    pub last_message: String,
    pub participant_ids: String,
    pub created_at: String,
}

#[derive(Debug, Default, Serialize, Deserialize, Clone, PartialEq, FromRow)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub password: String,
    pub profile_photo: Option<String>,
    // pub created_at: chrono::unix::Utc,
    // pub updated_at: Option< chrono::unix::Utc>,
}
