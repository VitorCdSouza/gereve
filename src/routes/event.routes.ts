import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import {
    createEventSchema,
    eventIdParamsSchema,
    listEventsQuerySchema,
    updateEventSchema,
} from '../schemas/event.schema';
import {
    create as createEvent,
    getById as getEventById,
    list as listEvent,
    remove as removeEvent,
    update as updateEvent,
} from '../controllers/event.controller';
import { create as createReservation } from '../controllers/reservation.controller';

export const eventRouter = Router();

eventRouter.get('/', validateQuery(listEventsQuerySchema), listEvent);

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

// #endregion
