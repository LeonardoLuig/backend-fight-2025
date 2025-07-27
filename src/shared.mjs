/* eslint-disable no-unused-vars */
/* eslint-disable eqeqeq */
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

export const PaymentProcessorEnum = Object.freeze({
  DEFAULT: 'default',
  FALLBACK: 'fallback',
});

export const paymentProcessorServiceEnum = Object.freeze({
  [PaymentProcessorEnum.DEFAULT]: process.env.PAYMENT_PROCESSOR_URL_DEFAULT,
  [PaymentProcessorEnum.FALLBACK]: process.env.PAYMENT_PROCESSOR_URL_FALLBACK,
});

export async function addPayment(payment) {
  return await redisClient.zAdd(`payments:${payment.processor}`, {
    score: +payment.requestedAt,
    value: JSON.stringify({
      correlationId: payment.correlationId,
      amount: payment.amount,
    }),
  });
}

export async function findPaymentsSummary(by = {}) {
  const defaultKey = `payments:${PaymentProcessorEnum.DEFAULT}`;
  const fallbackKey = `payments:${PaymentProcessorEnum.FALLBACK}`;

  let paymentsDefault = [];
  let paymentsFallback = [];

  if (by.from || by.to) {
    const defaultRange = await redisClient.zRangeByScore(defaultKey, by.from ?? '-inf', by.to ?? '+inf');
    const fallbackRange = await redisClient.zRangeByScore(fallbackKey, by.from ?? '-inf', by.to ?? '+inf');

    paymentsDefault = defaultRange.map(JSON.parse);
    paymentsFallback = fallbackRange.map(JSON.parse);
  } else {
    const defaultRange = await redisClient.zRange(defaultKey, 0, -1);
    const fallbackRange = await redisClient.zRange(fallbackKey, 0, -1);

    paymentsDefault = defaultRange.map(JSON.parse);
    paymentsFallback = fallbackRange.map(JSON.parse);
  }

  return {
    default: {
      totalRequests: paymentsDefault.length,
      totalAmount: paymentsDefault.reduce((acc, val) => acc + parseFloat(val.amount), 0),
    },
    fallback: {
      totalRequests: paymentsFallback.length,
      totalAmount: paymentsFallback.reduce((acc, val) => acc + parseFloat(val.amount), 0),
    },
  };
}

const queue = 'paymentProcessingQueue';

export async function addToPaymentProcessingQueue(payment, retryCount = 1) {
  const payload = JSON.stringify({
    ...payment,
    retryCount,
  });

  if (retryCount <= 5) {
    await redisClient.LPUSH(queue, payload);
  }
}

export async function getFromPaymentProcessingQueue() {
  return redisClient.LPOP(queue);
}

const cacheKey = 'processor-service';

export async function addToProcessorServiceCache(paymentProcessor, value) {
  const key = `${cacheKey}:${paymentProcessor}`;
  await redisClient.set(key, `${value}`, { expiration: { type: 'EX', value: 10 } });
}

export async function getFromProcessorServiceCache(paymentProcessor) {
  const key = `${cacheKey}:${paymentProcessor}`;
  const value = await redisClient.get(key);

  if (value === null) {
    return null;
  }

  return value === 'true';
}

export async function verifyProcessorServiceAvailability(paymentProcessor) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 100);

  let available = await getFromProcessorServiceCache(paymentProcessor);
  if (available == null) {
    try {
      const processorService = paymentProcessorServiceEnum[paymentProcessor];

      const response = await fetch(`${processorService}/payments/service-health`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const json = await response.json();

      available = !json.failing;
      clearTimeout(timeout);
    } catch (_) {
      available = false;
      clearTimeout(timeout);
    }
  }

  await addToProcessorServiceCache(paymentProcessor, available);
  return available;
}

export async function sendToPaymentProcessor(payment, processorsAvaiability, timeoutInMS = 100) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutInMS);

  let processor = PaymentProcessorEnum.DEFAULT;
  if (!processorsAvaiability.default) {
    processor = PaymentProcessorEnum.FALLBACK;
  }

  try {
    const processorService = paymentProcessorServiceEnum[processor];
    const response = await fetch(`${processorService}/payments`, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payment),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    clearTimeout(timeout);
    return processor;
  } catch (_) {
    clearTimeout(timeout);
  }
}
