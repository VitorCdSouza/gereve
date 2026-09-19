import express, { Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { authRouter } from './routes/auth.routes';
import { eventRouter } from './routes/event.routes';
import { reservationRouter } from './routes/reservation.routes';
import { attachmentRouter } from './routes/attachment.routes';
import { userRouter } from './routes/user.routes';
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

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/events', eventRouter);
app.use('/reservations', reservationRouter);
app.use('/attachments', attachmentRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
