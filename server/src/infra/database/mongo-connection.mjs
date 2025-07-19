import { MongoClient } from 'mongodb';

export const mongoConnectionToken = Symbol('mongoConnection');

const mongoClient = new MongoClient(process.env.MONGO_URL);
const mongoConnection = await mongoClient.connect();

globalThis.providers.set(mongoConnectionToken, mongoConnection);
