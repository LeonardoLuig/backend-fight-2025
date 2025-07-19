import { getMongoClient } from './mongo.mjs';

export class PaymentRepository {
  #collection;
  constructor(collection) {
    this.#collection = collection;
  }
}
