export function notFound(response) {
  response.writeHead(404);
  response.end('Not found');
}
