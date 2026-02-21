import { createClient } from "redis";

export type RedisClient = ReturnType<typeof createClient>;

let client: RedisClient | null = null;

export async function getRedisClient(): Promise<RedisClient | null> {
  if (client) return client;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.log("REDIS_URL not set — using in-memory state");
    return null;
  }

  client = createClient({ url });

  client.on("error", (err) => {
    console.error("Redis error:", err.message);
  });

  client.on("connect", () => {
    console.log("Connected to Redis");
  });

  await client.connect();
  return client;
}
