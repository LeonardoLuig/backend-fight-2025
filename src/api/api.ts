import Fastify from "fastify";
import { PaymentRequest } from "../core/common/types";

const fastify = Fastify({
  logger: true,
});

fastify.post('/payments', async (request, reply) => {
  const payment = request.body as PaymentRequest;
  reply.send({ correlationId: payment.correlationId });
});