use actix_web::{get, App, HttpResponse, HttpServer, Responder};

#[get("/")]
async fn greet() -> impl Responder {
    HttpResponse::Ok().body("Hello World")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(greet))
        .bind(("127.0.0.1", 8000))?
        .run()
        .await
}
