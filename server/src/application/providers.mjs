import { redisConnection, redisConnectionToken } from '../infra/cache/redis-connection.mjs';
import { mongoConnection, mongoConnectionToken } from '../infra/database/mongo-connection.mjs';

globalThis.providers.set(redisConnectionToken, redisConnection);
globalThis.providers.set(mongoConnectionToken, mongoConnection);
