import { mongoConnectionToken } from '../../infra/database/mongo-connection.mjs';
import { MongoPaymentRepository } from '../../infra/database/repository/MongoPaymentRepository.mjs';
import { PaymentController } from './PaymentController.mjs';
import { CreatePaymentService } from './services/CreatePaymentService.mjs';
import { GetPaymentsSummaryService } from './services/GetPaymentsSummaryService.mjs';

const mongoConnection = globalThis.providers.get(mongoConnectionToken);
const mongoPaymentCollection = mongoConnection.db().collection('payments');

const paymentRepository = new MongoPaymentRepository(mongoPaymentCollection);

const createPaymentService = new CreatePaymentService(paymentRepository);
const getPaymentsSummaryService = new GetPaymentsSummaryService(paymentRepository);

const paymentController = new PaymentController(createPaymentService, getPaymentsSummaryService);

globalThis.routeHandlers.set('GET:/payments-summary', paymentController.getPaymentsSummaryHandler.bind(paymentController));
globalThis.routeHandlers.set('POST:/payment', paymentController.createPaymentHandler.bind(paymentController));
