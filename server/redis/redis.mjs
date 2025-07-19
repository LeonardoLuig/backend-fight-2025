import { createClient } from 'redis';

let client;
let isConnected = false;

export async function getRedisClient() {
  if (!client) {
    client = new createClient({ url: process.env.REDIS_URL });
  }

  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }

  return client;
}
