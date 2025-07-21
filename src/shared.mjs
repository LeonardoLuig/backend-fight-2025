import { MongoClient } from 'mongodb';
import { createClient } from 'redis';

// --------------------------------------> Enums
export const PaymentProcessorEnum = Object.freeze({
  DEFAULT: 'default',
  FALLBACK: 'fallback',
});

export const paymentProcessorServiceEnum = {
  [PaymentProcessorEnum.DEFAULT]: process.env.PAYMENT_PROCESSOR_URL_DEFAULT,
  [PaymentProcessorEnum.FALLBACK]: process.env.PAYMENT_PROCESSOR_URL_FALLBACK,
};

// --------------------------------------> Mongo
const mongoClient = new MongoClient(process.env.MONGO_URL);
await mongoClient.connect();

const paymentCollection = mongoClient.db('backend-fight-2025').collection('payments');

export async function addPayment(payment) {
  try {
    await paymentCollection.insertOne({
      processor: payment.processor || PaymentProcessorEnum.DEFAULT,
      correlationId: payment.correlationId,
      amount: payment.amount,
      createdAt: new Date(),
    });

    return true;
  } catch (err) {
    console.error(`[addPayment] error: ${err}`);
    await addToPaymentProcessingQueue(payment);

    return false;
  }
}

export async function findPaymentsSummary(by = {}) {
  const $match = {};

  const createdAtMatch = {};
  if (by.from) createdAtMatch.$gte = new Date(by.from);
  if (by.to) createdAtMatch.$lt = new Date(by.to);

  if (Object.keys(createdAtMatch).length) {
    $match.createdAt = createdAtMatch;
  }

  const result = await paymentCollection
    .aggregate([
      {
        $match: $match,
      },
      {
        $group: {
          _id: '$processor',
          totalRequests: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          key: '$_id',
          totalRequests: 1,
          totalAmount: 1,
        },
      },
    ])
    .toArray();

  return result.reduce((acc, item) => {
    acc[item.key] = {
      totalRequests: item.totalRequests,
      totalAmount: item.totalAmount,
    };
    return acc;
  }, {});
}

// --------------------------------------> Redis
const redisClient = createClient({ url: process.env.REDIS_URL });
await redisClient.connect();

export async function addToPaymentProcessingQueue(payment, stage = 0) {
  const payload = JSON.stringify({
    data: payment,
    stage: stage,
    retryCount: 0,
  });

  await redisClient.LPUSH('paymentProcessingQueue', payload);
}

export async function getFromPaymentProcessingQueue() {
  return await redisClient.LPOP('paymentProcessingQueue');
}

// --------------------------------------> External Payment Processor
export async function getAvailablePaymentProcessor() {
  const paymentProcessorHandler = async (processor = PaymentProcessorEnum.DEFAULT) => {
    const cacheKey = `processor:${processor}`;
    let isAvailable = await redisClient.get(cacheKey);

    if (isAvailable === 'true') {
      return processor;
    } else if (isAvailable === null) {
      isAvailable = await fetch(`${paymentProcessorServiceEnum[processor]}/health-server`)
        .then((res) => res.json())
        .then((json) => json.failing)
        .catch(() => false);

      await redisClient.set(cacheKey, isAvailable, { expiration: { type: 'EX', value: '5' } });

      if (isAvailable) {
        return processor;
      }
    }

    return null;
  };

  let processor = await paymentProcessorHandler(PaymentProcessorEnum.DEFAULT);
  if (!processor) {
    processor = await paymentProcessorHandler(PaymentProcessorEnum.FALLBACK);
  }

  return processor;
}

export async function sendToPaymentProcessor(payment) {
  try {
    const processor = await getAvailablePaymentProcessor();
    await fetch(`${paymentProcessorServiceEnum[processor]}/payment`, {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  } catch (err) {
    console.log(err);
    addToPaymentProcessingQueue(payment, 1);
  }
}
