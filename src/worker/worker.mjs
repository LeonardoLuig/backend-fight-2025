/* eslint-disable no-unused-vars */
import 'dotenv/config';
import { setTimeout as delay } from 'node:timers/promises';
import { Writable } from 'node:stream';

const { addPayment, verifyProcessorServiceAvailability, getFromPaymentProcessingQueue, sendToPaymentProcessor, addToPaymentProcessingQueue, PaymentProcessorEnum } = await import(
  '../shared.mjs'
);

const paymentProcessor = new Writable({
  objectMode: true,
  async write(payment, _, done) {
    try {
      const processorsAvaiability = {
        default: false,
        fallback: false,
      };

      processorsAvaiability.default = await verifyProcessorServiceAvailability(PaymentProcessorEnum.DEFAULT);
      processorsAvaiability.fallback = await verifyProcessorServiceAvailability(PaymentProcessorEnum.FALLBACK);

      if (!processorsAvaiability.default && !processorsAvaiability.fallback) {
        throw new Error('No Payment processors available, adding to queue');
      }

      const processor = await sendToPaymentProcessor(payment, processorsAvaiability, 1000);

      if (!processor) {
        throw new Error('Error on send paymento to processor, adding to queue');
      }

      await addPayment({
        processor: processor,
        correlationId: payment.correlationId,
        requestedAt: new Date(),
        amount: payment.amount,
      });

      done();
    } catch (_) {
      await addToPaymentProcessingQueue(payment, payment.retryCount + 1);
      done();
    }
  },
});

async function worker() {
  console.log('🚀 Worker is running...');

  while (true) {
    try {
      const task = await getFromPaymentProcessingQueue();
      if (!task) {
        await delay(100);
        continue;
      }

      const parsed = typeof task === 'string' ? JSON.parse(task) : task;

      paymentProcessor.write(parsed);
    } catch (err) {
      await delay(1000);
    }
  }
}

worker();
