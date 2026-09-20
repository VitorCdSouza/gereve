import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import {
    create as createEvent,
    getById as getEventById,
    list as listEvent,
    remove as removeEvent,
    update as updateEvent,
} from '../controllers/event.controller';
import {
    create as createReservation,
    listByEvent as listEventReservations,
} from '../controllers/reservation.controller';
import { upload as uploadAttachment } from '../controllers/attachment.controller';
import { upload } from '../config/upload';

export const eventRouter = Router();

eventRouter.get('/', listEvent);

eventRouter.get('/:id', getEventById);

eventRouter.post('/', authenticate, authorize(UserRole.ORGANIZER, UserRole.ADMIN), createEvent);

eventRouter.patch('/:id', authenticate, authorize(UserRole.ORGANIZER, UserRole.ADMIN), updateEvent);

eventRouter.delete(
    '/:id',
    authenticate,
    authorize(UserRole.ORGANIZER, UserRole.ADMIN),
    removeEvent,
);

eventRouter.post(
    '/:id/reservations',
    authenticate,
    authorize(UserRole.CUSTOMER),
    createReservation,
);

eventRouter.get(
    '/:id/reservations',
    authenticate,
    authorize(UserRole.ORGANIZER, UserRole.ADMIN),
    listEventReservations,
);

eventRouter.post(
    '/:id/attachments',
    authenticate,
    authorize(UserRole.ORGANIZER, UserRole.ADMIN),
    upload.single('file'),
    uploadAttachment,
);
