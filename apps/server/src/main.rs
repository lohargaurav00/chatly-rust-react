use axum::{routing::get, Router};
use dotenv::dotenv;
use serde_json::{Value, json};
use socketioxide::{
    extract::{Data, SocketRef},
    SocketIo,
};
use std::env;
use tracing::info;
use tokio::net::TcpListener;
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;

#[derive(serde::Deserialize, Debug)]
struct Message {
    #[serde(rename = "roomId")]
    room_id: String,
    message: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();

    // Initialize Socket.IO
    let (layer, io) = SocketIo::new_layer();

    // Define the Socket.IO namespace and its event handlers
    io.ns("/", |socket: SocketRef| {
        info!(
            "Socket connected to ns: {:?}, id: {:?}",
            socket.ns(),
            socket.id
        );
        socket.on(
            "join-room",
            |socket: SocketRef, Data::<String>(room)| async move {
                info!("Joining room: {:?}", room);
                socket.join(room.clone()).unwrap_or_else(|e| {
                    println!("Error: {:?}", e);
                });
                let _ = socket
                    .within(room)
                    .emit("joined-room", format!("{:?} Joined the room", socket.id));
            },
        );

        socket.on("send-message" ,|socket: SocketRef, Data::<Value>(message)| async move {
            info!("Message: {:?}", message);

            //parse message with serde_json
            let parsed_message: Message = match serde_json::from_value::<Message>(message.clone())
                {
                Ok(v) => v,
                Err(e) => {
                    println!("Error: {:?}", e);
                    return;
                }
            };

            let _ = socket
                .within(parsed_message.room_id)
                .emit("message", json!({
                    "message": parsed_message.message,
                    "sender": socket.id,
                    "time": chrono::Local::now().to_string()
                }));
        });
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
