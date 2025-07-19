import 'dotenv/config';

import { createServer } from 'node:http';
import { getHealthCheckHandler } from './handlers/getHealthCheckHandler.mjs';
import { postPaymentHandler } from './handlers/postPaymentHandler.mjs';
import { getPaymentsSummaryHandler } from './handlers/getPaymentsSummaryHandler.mjs';
import { notAllowed } from './utils/notAllowed.mjs';
import { notFound } from './utils/notFound.mjs';

const routes = new Map();
routes.set('GET:/health-check', getHealthCheckHandler);
routes.set('GET:/payments-summary', getPaymentsSummaryHandler);
routes.set('POST:/payment', postPaymentHandler);

const server = createServer(async (request, response) => {
  const key = `${request.method}:${request.url}`;
  const handler = routes.get(key);

  if (handler) {
    await handler(request, response);
  } else {
    const urlExists = [...routes.keys()].some((k) => k.endsWith(`:${request.url}`));
    return urlExists ? notAllowed(response) : notFound(response);
  }
});

const port = process.env.SERVER_PORT || 8080;
const host = process.env.SERVER_HOST || '127.0.0.1';

server.listen(port, host, () => console.log('server is running at 8080'));
