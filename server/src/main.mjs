import { ServerApplication } from './application/ServerApplication.mjs';

ServerApplication.run(process.env.SERVER_PORT, process.env.SERVER_HOST);
