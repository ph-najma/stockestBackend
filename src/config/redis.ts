import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";
dotenv.config();
let client: RedisClientType<any, any>;

const connectRedis = async () => {
  try {
    client = createClient({
      url: process.env.REDIS_URL,
    });

    client.on("error", (err) => console.error("Redis Client Error", err));

    await client.connect();
    console.log("Redis connected successfully!");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    throw error;
  }
};

export { connectRedis, client };
