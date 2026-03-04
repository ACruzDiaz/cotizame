import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/ErrorHandler';
import { router } from './router';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1', router);

app.use(errorHandler);

export { app };
