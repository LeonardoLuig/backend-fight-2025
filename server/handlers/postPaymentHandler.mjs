import { redis } from '../redis/redis-source.mjs';

export async function postPaymentHandler(request, response) {
  await redis.RPUSH('paymentProcessorQueue', JSON.stringify({ foo: 'bar' }));

  response.writeHead(200);
  response.end(JSON.stringify({ message: 'this is payment route' }));
}
