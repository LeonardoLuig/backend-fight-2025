import { Payment, PaymentProcessorEnum } from '@core/entity/Payment';
import { PaymentSummary } from '@core/entity/PaymentSummary';
import { IPaymentRepository } from '@core/repository/IPaymentRepository';
import { MongoClient } from 'mongodb';

export class PaymentRepository implements IPaymentRepository {
  constructor(private readonly paymentDocument: MongoClient) {}

  addPayment(payment: Payment): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getPaymentsSummary(period: {
    from: string;
    to: string;
  }): Promise<Record<PaymentProcessorEnum, PaymentSummary>> {
    throw new Error('Method not implemented.');
  }
}
