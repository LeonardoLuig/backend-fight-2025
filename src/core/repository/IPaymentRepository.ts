import { Payment, PaymentProcessorEnum } from '@core/entity/Payment';
import { PaymentSummary } from '@core/entity/PaymentSummary';

export interface IPaymentRepository {
  addPayment(payment: Payment): Promise<void>;
  getPaymentsSummary(period: {
    from: string;
    to: string;
  }): Promise<Record<PaymentProcessorEnum, PaymentSummary>>;
}
