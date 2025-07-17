import { IPaymentRepository } from '@core/repository/IPaymentRepository';

export class PaymentProcessingService {
  constructor(private readonly paymentRepository: IPaymentRepository) {}
}
