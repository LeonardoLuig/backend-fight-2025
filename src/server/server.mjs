import { createServer } from 'node:http';
import { parse as parseUrl } from 'node:url';
import { parse as parseQuery } from 'node:querystring';

const { addPayment, addToPaymentProcessingQueue, sendToPaymentProcessor, findPaymentsSummary, verifyProcessorServiceAvailability, PaymentProcessorEnum } = await import(
  '../shared.mjs'
);

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      if (chunk) {
        body += chunk;
      }
    });

    req.on('end', () => {
      try {
        const json = body ? JSON.parse(body) : {};
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

async function postPaymentsHandler(request) {
  const body = await parseBody(request);

  const payment = {
    correlationId: body.correlationId,
    amount: body.amount,
    requestedAt: new Date(),
  };

  try {
    const processorsAvaiability = {
      default: false,
      fallback: false,
    };

    processorsAvaiability.default = await verifyProcessorServiceAvailability(PaymentProcessorEnum.DEFAULT);
    if (!processorsAvaiability.default) {
      processorsAvaiability.fallback = await verifyProcessorServiceAvailability(PaymentProcessorEnum.FALLBACK);
      if (!processorsAvaiability.fallback) {
        throw new Error('No Payment processors available, adding to queue');
      }
    }

    if (body) {
      const processor = await sendToPaymentProcessor(payment, processorsAvaiability);
      if (!processor) {
        throw new Error('Error on send paymento to processor, adding to queue');
      }

      await addPayment({
        ...payment,
        processor: processor,
      });
    }
    // eslint-disable-next-line no-unused-vars
  } catch (_) {
    await addToPaymentProcessingQueue(payment);
  }
}

async function getPaymentsSummaryHandler(request) {
  const query = request.query || {};

  const from = query.from ? new Date(query.from).getTime() : null;
  const to = query.from ? new Date(query.to).getTime() : null;

  return await findPaymentsSummary({ from, to });
}

function notFound(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain' });
  response.end('Not found');
}

function notAllowed(response) {
  response.writeHead(405, { 'Content-Type': 'text/plain' });
  response.end('Method Not Allowed');
}

const routeHandlers = new Map();
routeHandlers.set('POST:/payments', postPaymentsHandler);
routeHandlers.set('GET:/payments-summary', getPaymentsSummaryHandler);
routeHandlers.set('GET:/health-check', getHealthCheckHandler);

const server = createServer(async (request, response) => {
  const url = parseUrl(request.url);
  const key = `${request.method}:${url.pathname}`;
  const handler = routeHandlers.get(key);

  request.query = parseQuery(url.query);

  if (handler) {
    const data = await handler(request);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(data));
  } else {
    const urlExists = [...routeHandlers.keys()].some((k) => k.endsWith(`:${request.url}`));
    return urlExists ? notAllowed(response) : notFound(response);
  }
});

const port = process.env.SERVER_PORT || 8080;
const host = process.env.SERVER_HOST || '127.0.0.1';
server.listen(port, host, () => console.log(`server is running at port: ${port}, host: ${host}`));
