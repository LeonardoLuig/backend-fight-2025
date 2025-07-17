import { Logger } from '@core/common/logger/Logger';
import { CreatePaymentRequestBody, GetPaymentSummaryRequestQuery } from '@core/common/types';
import cors from '@fastify/cors';
import Fastify from 'fastify';
import 'dotenv/config';

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
});

fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (_, body, done) {
  try {
    const json = JSON.parse(body as string) as Record<string, unknown>;
    done(null, json);
  } catch (err) {
    done(err as Error, undefined);
  }
});

fastify.get('/health-check', (_, reply) => {
  reply.send({ message: 'Http Server is running' });
});

fastify.post('/payments', async (request, reply) => {
  const payment = request.body as CreatePaymentRequestBody;
  reply.send({ correlationId: payment.correlationId });
});

fastify.get('/payments', async (request, reply) => {
  const query = request.query as GetPaymentSummaryRequestQuery;
  reply.send({ from: query.from, to: query.to });
});

fastify.listen({ port: process.env.API_PORT as unknown as number }, (err, address) => {
  if (err) {
    Logger.log(`[API][ERROR]: ${err}`);
    process.exit(1);
  }

  Logger.log(`[API]: Http Server is running on address: ${address}`);
});
