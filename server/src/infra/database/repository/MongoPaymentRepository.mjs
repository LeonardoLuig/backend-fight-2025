import { Collection } from 'mongodb';

export class MongoPaymentRepository {
  constructor(collection) {
    this._collection = collection;
  }

  async getPaymentsSummary(by) {
    const result = await this._collection
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: by.from,
              $lt: by.to,
            },
          },
        },
        {
          $group: {
            _id: '$processor.key',
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

  async addPayment(payment) {
    await this._collection.insertOne(payment);
  }
}
