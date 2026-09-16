import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors({ origin: env.CORS_ORIGINS }));
app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

app.use(notFound);
app.use(errorHandler);

export default app;
