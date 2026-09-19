import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate, validateParams } from '../middlewares/validate';
import { createEventSchema, eventIdParamsSchema, updateEventSchema } from '../schemas/event.schema';
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

export const eventRouter = Router();

eventRouter.get('/', listEvent);

eventRouter.get('/:id', validateParams(eventIdParamsSchema), getEventById);

// #region Eventos
eventRouter.post(
    '/',
    authenticate,
    authorize(UserRole.ORGANIZER, UserRole.ADMIN),
    validate(createEventSchema),
    createEvent,
);

eventRouter.patch(
    '/:id',
    authenticate,
    authorize(UserRole.ORGANIZER, UserRole.ADMIN),
    validateParams(eventIdParamsSchema),
    validate(updateEventSchema),
    updateEvent,
);

eventRouter.delete(
    '/:id',
    authenticate,
    authorize(UserRole.ORGANIZER, UserRole.ADMIN),
    validateParams(eventIdParamsSchema),
    removeEvent,
);

// #endregion

// #region Reservas

eventRouter.post(
    '/:id/reservations',
    authenticate,
    authorize(UserRole.CUSTOMER),
    validateParams(eventIdParamsSchema),
    createReservation,
);

eventRouter.get(
    '/:id/reservations',
    authenticate,
    authorize(UserRole.ORGANIZER, UserRole.ADMIN),
    validateParams(eventIdParamsSchema),
    listEventReservations,
);

// #endregion
