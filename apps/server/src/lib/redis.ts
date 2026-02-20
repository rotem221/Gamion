import { createClient } from "redis";

export type RedisClient = ReturnType<typeof createClient>;

let client: RedisClient | null = null;

export async function getRedisClient(): Promise<RedisClient> {
  if (client) return client;

  const url = process.env.REDIS_URL || "redis://localhost:6379";
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
