use chrono::Local;
use futures_util::StreamExt as _;
use serde_json::{json, Value};
use socketioxide::extract::{Data, SocketRef};
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::time::Duration;
use tracing::{error, info};

use crate::redis::Redis;

#[derive(serde::Deserialize, Debug)]
pub struct Message {
    #[serde(rename = "roomId")]
    room_id: String,
    message: String,
}

pub struct SocketHandlers;

impl SocketHandlers {
    pub async fn handle_sockets(socket: SocketRef, redis: Arc<Mutex<Redis>>) {
        let redis_clone = Arc::clone(&redis);
        socket.on(
            "join-room",
            move |socket: SocketRef, Data::<String>(room)| {
                let redis_clone = Arc::clone(&redis_clone);
                async move {
                    handle_join_room(socket, room, redis_clone).await;
                }
            },
        );

        let redis_clone = Arc::clone(&redis);

        socket.on(
            "send-message",
            move |socket: SocketRef, Data::<Value>(message)| {
                let redis_clone = Arc::clone(&redis_clone);
                async move {
                    handle_send_message(socket, message, redis_clone).await;
                }
            },
        );

        let redis_clone = Arc::clone(&redis);
        if let Err(err) =
            redis_subscription_handler(redis_clone, socket, Duration::from_secs(1)).await
        {
            error!("Error in subscription handler: {}", err);
        }
    }
}

async fn handle_join_room(socket: SocketRef, room: String, redis: Arc<Mutex<Redis>>) {
    info!("Joining room: {:?}", room);

    if let Err(e) = socket.join(room.clone()) {
        error!("Error joining room: {:?}", e);
    }
    let message = json!({
        "room_id": room,
        "message": format!("{} joined the room", socket.id),
        "sender": "Server",
        "time": Local::now().to_string()
    });

    let str_msg = match serde_json::to_string(&message) {
        Ok(v) => v,
        Err(e) => {
            error!("Error parsing message: {:?}", e);
            return;
        }
    };

    let redis_guard = redis.lock().await;
    if let Err(e) = redis_guard.publish_message("Messages", &str_msg).await {
        error!("Error publishing message to Redis: {:?}", e);
    }
}

async fn handle_send_message(socket: SocketRef, message: Value, redis: Arc<Mutex<Redis>>) {
    info!("Message: {:?}", message);

    //parse message with serde_json
    let parsed_message: Message = match serde_json::from_value::<Message>(message.clone()) {
        Ok(v) => v,
        Err(e) => {
            error!("Error parsing message: {:?}", e);
            return;
        }
    };

    let message = json!({
        "room_id": parsed_message.room_id,
        "message": parsed_message.message,
        "sender": socket.id,
        "time": Local::now().to_string()
    });

    let str_msg = match serde_json::to_string(&message) {
        Ok(v) => v,
        Err(e) => {
            error!("Error parsing message: {:?}", e);
            return;
        }
    };

    let redis_guard = redis.lock().await;
    if let Err(e) = redis_guard.publish_message("Messages", &str_msg).await {
        error!("Error publishing message to Redis: {:?}", e);
    }
}
pub async fn redis_subscription_handler(
    redis: Arc<Mutex<Redis>>,
    socket: SocketRef,
    delay: Duration,
) -> Result<(), Box<dyn std::error::Error>> {
    let redis_guard = redis.lock().await;
    let mut pubsub = redis_guard
        .client
        .get_tokio_connection()
        .await
        .unwrap()
        .into_pubsub();
    let _ = pubsub.subscribe("Messages").await;

    // Spawn an asynchronous task
    tokio::spawn(async move {
        // Inside the spawned task, use a loop to continuously process messages
        while let Some(msg) = pubsub.on_message().next().await {
            // Parse the payload
            let payload: Value = match serde_json::from_str(&msg.get_payload::<String>().unwrap()) {
                Ok(payload) => payload,
                Err(err) => {
                    error!("Error parsing JSON payload: {}", err);
                    continue; // Skip to the next iteration if parsing fails
                }
            };
            info!("Received message: {:?}", payload);

            // Extract room_id from payload
            let room_id = match payload["room_id"].as_str() {
                Some(room_id) => room_id.to_string(),
                None => {
                    error!("Error: 'room_id' field missing in payload");
                    continue; // Skip to the next iteration if 'room_id' is missing
                }
            };

            // Emit the message to the socket
            socket.to(room_id).emit("message", payload).unwrap();

            // Introduce a delay between processing each message
            tokio::time::sleep(delay).await;
        }
    });

    Ok(())
}
