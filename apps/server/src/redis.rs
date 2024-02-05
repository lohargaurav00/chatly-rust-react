extern crate redis;

use std::env;
use redis::AsyncCommands;
use tracing::info;


pub struct Redis {
   pub client: redis::Client,
}

impl Redis {
    pub async fn new() -> Result<Self, redis::RedisError> {
        let redis_url = env::var("REDIS_URL").expect("REDIS_URL not set");
        let client = redis::Client::open(redis_url)?;
        info!("Connected to Redis");
        Ok(Self { client })
    }

    pub async fn publish_message(&self, channel: &str, message:&str ) -> redis::RedisResult<()> {
        let mut connection = self.client.get_tokio_connection().await?;
        connection.publish(channel, message).await?;
        Ok(())
    }
}