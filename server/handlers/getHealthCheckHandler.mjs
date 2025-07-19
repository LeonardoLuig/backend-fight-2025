export async function getHealthCheckHandler(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ message: 'server is running' }));
}
