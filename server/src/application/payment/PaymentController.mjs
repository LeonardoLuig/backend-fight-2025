export class PaymentController {
  constructor(createPaymentService, getPaymentsSummaryService) {
    this._createPaymentService = createPaymentService;
    this._getPaymentsSummaryService = getPaymentsSummaryService;
  }

  async createPaymentHandler(request, response) {
    await this._createPaymentService.execute();

    response.writeHead(200);
    response.end(JSON.stringify({ message: 'success.' }));
  }

  async getPaymentsSummaryHandler(request, response) {
    const paymentsSummary = await this._getPaymentsSummaryService.execute();

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'success.', data: paymentsSummary }));
  }
}
