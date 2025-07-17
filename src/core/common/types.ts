export interface CreatePaymentRequestBody {
  correlationId: string;
  amount: number;
}

export interface GetPaymentSummaryRequestQuery {
  from?: string;
  to?: string;
}
