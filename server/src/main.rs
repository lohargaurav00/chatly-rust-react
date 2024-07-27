use actix::Actor;
use actix_cors::Cors;
use actix_web::{middleware, web, App, HttpServer};
use routes::{greet, ws_handler};

mod routes;
mod server;
mod session;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let server = server::ChatServer::new().start();

    HttpServer::new(move|| {
        let cors = Cors::permissive();
        App::new()
            .app_data(web::Data::new(server.clone()))
            .wrap(middleware::Logger::default())
            .wrap(cors)
            .service(greet)
            .route("/ws", web::get().to(ws_handler))
    })
    .bind(("127.0.0.1", 8000))?
    .workers(2)
    .run()
    .await
}
