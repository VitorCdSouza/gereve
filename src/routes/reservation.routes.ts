import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import {
    cancel as cancelReservation,
    listMine as listMyReservations,
} from '../controllers/reservation.controller';

export const reservationRouter = Router();

reservationRouter.get('/me', authenticate, listMyReservations);

reservationRouter.patch('/:id/cancel', authenticate, cancelReservation);
