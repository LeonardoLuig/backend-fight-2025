export function notFound(response) {
  response.writeHead(404);
  response.end('Not found');
}

export function notAllowed(response) {
  response.writeHead(405, { 'Content-Type': 'text/plain' });
  response.end('Method Not Allowed');
}
