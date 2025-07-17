import { v4 } from 'uuid';

export enum PaymentProcessorEnum {
  DEFAULT = 'default',
  FALLBACK = 'fallback',
}

export class Payment {
  public readonly correlationId: string;
  public readonly amount: number;
  public readonly processor: PaymentProcessorEnum;

  constructor(amount: number, processor: PaymentProcessorEnum) {
    this.correlationId = v4();
    this.amount = amount;
    this.processor = processor;
  }
}
