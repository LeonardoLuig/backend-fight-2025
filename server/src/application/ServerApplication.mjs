import { createServer } from 'node:http';
import { notAllowed, notFound } from '../../server-utils.mjs';

export class ServerApplication {
  constructor(port, host) {
    this.port = port || 8080;
    this.host = host || '127.0.0.1';

    this.app = createServer(async (request, response) => {
      await import('./payment/route-handlers.mjs');

      const key = `${request.method}:${request.url}`;
      const handler = globalThis.routeHandlers.get(key);

      if (handler) {
        await handler(request, response);
      } else {
        const urlExists = [...globalThis.routeHandlers.keys()].some((k) => k.endsWith(`:${request.url}`));
        return urlExists ? notAllowed(response) : notFound(response);
      }
    });
  }

  listen() {
    this.app.listen(this.port, this.host, () => console.log(`server is running at ${this.port}`));
  }

  static run(port, host) {
    globalThis.routeHandlers = new Map();
    globalThis.providers = new Map();

    const serverApplication = new ServerApplication(port, host);
    serverApplication.listen();
  }
}
