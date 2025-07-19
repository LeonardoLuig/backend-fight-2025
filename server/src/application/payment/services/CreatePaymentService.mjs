export class CreatePaymentService {
  constructor(paymentRepository, paymentProcessor) {
    this._paymentRepository = paymentRepository;
    this._paymentProcessor = paymentProcessor;
  }

  async execute(payload) {}
}
