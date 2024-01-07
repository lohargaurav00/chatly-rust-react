use axum::{
    routing::get,
    Router,
};
use tokio::net::TcpListener;
use dotenv::dotenv;
use std::env;
use socketioxide::{
    extract::{AckSender, SocketRef, Bin, Data},
    SocketIo,
};
use serde_json::Value;
use tracing::info;
// use tracing_subscriber::FmtSubscriber;


#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {

    // tracing::subscriber::set_global_default(FmtSubscriber::default())?;
    dotenv().ok();

    let port = env::var("PORT").unwrap_or_else(|_| "8000".to_string());
    let url = format!("0.0.0.0:{}", port);

    let (layer, io) = SocketIo::new_layer();

    io.ns("/", |socket: SocketRef, Data(data): Data<Value>|{
        info!("Socket.IO connected: {:?} {:?}", socket.ns(), socket.id);
        socket.emit("msg", "Hello from socket");
    });

    let app = Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .layer(layer);

    let lister = TcpListener::bind(url).await?;
    axum::serve(lister, app).await?;

    Ok(())
}