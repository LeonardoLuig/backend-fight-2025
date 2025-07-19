export function notAllowed(response) {
  response.writeHead(405, { 'Content-Type': 'text/plain' });
  response.end('Method Not Allowed');
}
