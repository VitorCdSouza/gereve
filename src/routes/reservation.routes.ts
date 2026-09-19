import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { listMine as listMyReservations } from '../controllers/reservation.controller';

export const reservationRouter = Router();

reservationRouter.get('/me', authenticate, listMyReservations);
