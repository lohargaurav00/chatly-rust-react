extern crate redis;

use std::env;
use redis::AsyncCommands;
use tracing::info;


pub struct Redis {
    client: redis::Client,
    connection: redis::aio::Connection,
}

impl Redis {
    pub async fn new() -> Result<Self, redis::RedisError> {
        let redis_url = env::var("REDIS_URL").expect("REDIS_URL not set");
        let client = redis::Client::open(redis_url)?;
        let connection = client.get_tokio_connection().await?;
        info!("Connected to Redis");
        Ok(Self { client, connection })
    }

    pub async fn publish_message(&self, channel: &str, message:&str ) -> redis::RedisResult<()> {
        let mut connection = self.client.get_tokio_connection().await?;
        connection.publish(channel, message).await?;
        Ok(())
    }

    pub async fn subscribe_to_channel(&self, channel: &str) -> redis::RedisResult<()> {
        let mut pubsub = self.client.get_tokio_connection().await?.into_pubsub();
        pubsub.subscribe(channel).await?;
        Ok(())
    }

    
}