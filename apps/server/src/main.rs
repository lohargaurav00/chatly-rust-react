mod redis;
mod socket_handlers;

use axum::{routing::get, Router};
use dotenv::dotenv;
use socketioxide::{extract::SocketRef, SocketIo};
use std::{env, sync::Arc};
use tokio::net::TcpListener;
use tokio::sync::Mutex;
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tracing::info;
use tracing_subscriber::FmtSubscriber;

use redis::Redis;
use socket_handlers::SocketHandlers;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // a builder for `FmtSubscriber`.
    tracing::subscriber::set_global_default(FmtSubscriber::default())?;

    info!("Starting server...");

    dotenv().ok();

    // Initialize Socket.IO
    let (layer, io) = SocketIo::new_layer();

    // Initialize Redis
    let redis = Arc::new(Mutex::new(Redis::new().await?));


    io.ns("/", |socket: SocketRef| async move {
        info!("Socket connected to ns: {:?}, id: {:?}", socket.ns(), socket.id);
        SocketHandlers::handle_sockets(socket, redis).await;
    });

    // Set up Axum
    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .layer(
            ServiceBuilder::new()
                .layer(CorsLayer::permissive())
                .layer(layer),
        );

    // Start the Axum server
    let port = env::var("PORT").unwrap_or_else(|_| "8000".to_string());
    let url = format!("0.0.0.0:{}", port);
    let listener = TcpListener::bind(&url).await?;
    axum::serve(listener, app.into_make_service()).await?;

    Ok(())
}
