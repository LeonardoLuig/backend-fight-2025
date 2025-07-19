export async function getPaymentsSummaryHandler(request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ message: 'this is payment summary route' }));
}
