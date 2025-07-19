import { MongoClient } from 'mongodb';

let client;
let isConnected = false;

export async function getMongoClient() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL);
  }

  if (!isConnected) {
    await client.connect();
    isConnected = true;
  }

  return client;
}
