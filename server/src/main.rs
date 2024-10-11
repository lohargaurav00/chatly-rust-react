use actix::Actor;
use actix_cors::Cors;
use actix_web::{middleware, web, App, HttpServer};
use dotenv::dotenv;
use routes::{greet, ws_handler};
use sqlx::postgres::PgPoolOptions;
use std::env;

mod api;
mod models;
mod routes;
mod server;
mod session;
mod utils;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let port = env::var("PORT")
        .expect("PORT must be set")
        .parse::<u16>()
        .unwrap();
    let db_pool = match PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
    {
        Ok(pool) => {
            println!("✅ Connection to the database is successful!");
            pool
        }
        Err(err) => {
            println!("🔥 Failed to connect to the database: {:?}", err);
            std::process::exit(1);
        }
    };

    let server = server::ChatServer::new().start();

    HttpServer::new(move || {
        let cors = Cors::permissive();
        App::new()
            .app_data(web::Data::new(db_pool.clone()))
            .app_data(web::Data::new(server.clone()))
            .wrap(middleware::Logger::default())
            .wrap(cors)
            .service(greet)
            .route("/ws/{user_id}", web::get().to(ws_handler))
            .configure(api::init_routes)
    })
    .bind(("0.0.0.0", port))?
    .workers(2)
    .run()
    .await
}
