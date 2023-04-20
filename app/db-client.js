import { createClient } from "redis";

const client =
  createClient();
  // TODO: Pass in config values if/when not using default local Redis server.

client
  .connect()
  .then(() => console.info("Connected to Redis"))
  .catch((err) => console.error("Error connecting to Redis:", err));

process.on("SIGINT", async () => {
  console.info("Gracefully shutting down the Redis client.");
  await client.quit();
  process.exit(0);
});

export default client;
