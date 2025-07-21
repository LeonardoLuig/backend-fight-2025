import { createServer } from 'node:http';

import { addPayment, addToPaymentProcessingQueue, findPaymentsSummary, sendToPaymentProcessor } from '../shared.mjs';

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const json = JSON.parse(body);
        resolve(json);
      } catch (e) {
        reject(e);
      }
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

function getHealthCheckHandler(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ message: `server is running` }));
}

async function postPaymentHandler(request, response) {
  const body = request.body;

  if (body) {
    const isDone = await addPayment(body);
    // if (isDone) {
    //   await sendToPaymentProcessor(body);
    // } else {
    //   await addToPaymentProcessingQueue(body);
    // }
  }

  response.writeHead(202, { 'Content-Type': 'application/json' });
  response.end();
}

async function getPaymentsSummaryHandler(request, response) {
  const query = request.query || {};

  const paymentsSummary = await findPaymentsSummary({
    from: query.from,
    to: query.to,
  });

  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(paymentsSummary));
}

function notFound(response) {
  response.writeHead(404);
  response.end('Not found');
}

function notAllowed(response) {
  response.writeHead(405, { 'Content-Type': 'text/plain' });
  response.end('Method Not Allowed');
}

const routeHandlers = new Map();
routeHandlers.set('POST:/payment', postPaymentHandler);
routeHandlers.set('GET:/payments-summary', getPaymentsSummaryHandler);
routeHandlers.set('GET:/health-check', getHealthCheckHandler);

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const key = `${request.method}:${url.pathname}`;
  const handler = routeHandlers.get(key);

  if (request.method === 'POST') {
    request.body = await parseBody(request);
  }

  if (handler) {
    await handler(request, response);
  } else {
    const urlExists = [...routeHandlers.keys()].some((k) => k.endsWith(`:${request.url}`));
    return urlExists ? notAllowed(response) : notFound(response);
  }
});

const port = process.env.SERVER_PORT || 8080;
const host = process.env.SERVER_HOST || '127.0.0.1';
server.listen(port, host, () => console.log(`server is running at port: ${port}, host: ${host}`));
