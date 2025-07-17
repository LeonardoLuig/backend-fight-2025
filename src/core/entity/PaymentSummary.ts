import { PaymentProcessorEnum } from './Payment';

export class PaymentSummary {
  public readonly totalRequests: number;
  public readonly totalAmount: number;
  public readonly processor: PaymentProcessorEnum;

  constructor(totalRequests: number, totalAmount: number, processor: PaymentProcessorEnum) {
    this.totalRequests = totalRequests;
    this.totalAmount = totalAmount;
    this.processor = processor || 'default';
  }
}
