import { createClient } from 'redis';

export const redisConnectionToken = Symbol('redisConnection');

const redisClient = new createClient({ url: process.env.REDIS_URL });
const redisConnection = await redisClient.connect();

globalThis.providers.set(redisConnectionToken, redisConnection);
