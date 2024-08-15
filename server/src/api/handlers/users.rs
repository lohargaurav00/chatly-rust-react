use crate::{
    models::User,
    utils::helpers::{handle_response, Status},
};
use actix_web::{get, http::StatusCode, web, HttpResponse};
use sqlx::PgPool;

#[get("/users")]
pub async fn get_users(db_pool: web::Data<PgPool>) -> HttpResponse {
    let users_result = sqlx::query_as::<_, User>(r#"SELECT * FROM users"#)
        .fetch_all(db_pool.get_ref())
        .await;

    match users_result {
        Ok(users) => handle_response(
            StatusCode::OK,
            Status::Ok,
            "Users fetched successfully",
            Some(users),
        ),
        Err(e) => handle_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            Status::Error,
            &format!("Failed to fetch users: {:?}", e),
            Some(()),
        ),
    }
}

#[get("/users/{id}")]
pub async fn get_user_by_id(db_pool: web::Data<PgPool>, id: web::Path<i32>) -> HttpResponse {
    let user_result = sqlx::query_as::<_, User>(r#"SELECT * FROM users WHERE id = $1"#)
        .bind(id.into_inner())
        .fetch_one(db_pool.get_ref())
        .await;

    match user_result {
        Ok(user) => handle_response(
            StatusCode::OK,
            Status::Ok,
            "User fetched successfully",
            Some(user),
        ),
        Err(e) => handle_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            Status::Error,
            &format!("Failed to fetch user: {:?}", e),
            Some(()),
        ),
    }
}


pub fn init_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(get_users);
    cfg.service(get_user_by_id);
}