import 'dotenv/config';

import { Writable } from 'node:stream';
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

const paymentProcessor = new Writable({
  objectMode: true,
  write(chunk, _, done) {
    try {
      const data = JSON.parse(chunk);
      console.log(`[Worker] processing payment ${JSON.stringify(data)}`);

      done();
    } catch (error) {
      console.error(error);
      done(error);
    }
  },
});

async function worker() {
  while (true) {
    const task = await redis.LPOP('paymentProcessorQueue');
    if (task) {
      paymentProcessor.write(task);
    }
  }
}

worker();
