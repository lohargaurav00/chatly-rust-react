use actix_web::{http::StatusCode, HttpResponse};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Serialize, Deserialize, Debug)]
pub enum Status {
    Ok,
    Error,
}

pub fn handle_response<T: Serialize>(
    code: StatusCode,
    status: Status,
    message: &str,
    data: Option<T>
) -> HttpResponse {
    let body = match data {
        Some(data) => json!({ "status": status, "message": message, "data": data }),
        None => json!({ "status": status, "message": message }),
    };

    HttpResponse::build(code).json(body)
}


pub fn handle_response_with_count<T: Serialize>(
    code: StatusCode,
    status: Status,
    message: &str,
    data: Option<T>,
    count: i64
) -> HttpResponse {
    let body = match data {
        Some(data) => json!({ "status": status, "message": message, "data": data , "count": count}),
        None => json!({ "status": status, "message": message }),
    };

    HttpResponse::build(code).json(body)
}