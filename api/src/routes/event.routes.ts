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
import { create, getById, list, remove, update } from '../controllers/event.controller';

export const eventRouter = Router();

eventRouter.get('/', validateQuery(listEventsQuerySchema), list);

eventRouter.get('/:id', validateParams(eventIdParamsSchema), getById);

eventRouter.post(
    '/',
    authenticate,
    authorize(UserRole.ORGANIZER, UserRole.ADMIN),
    validate(createEventSchema),
    create,
);

eventRouter.patch(
    '/:id',
    authenticate,
    authorize(UserRole.ORGANIZER, UserRole.ADMIN),
    validateParams(eventIdParamsSchema),
    validate(updateEventSchema),
    update,
);

eventRouter.delete(
    '/:id',
    authenticate,
    authorize(UserRole.ORGANIZER, UserRole.ADMIN),
    validateParams(eventIdParamsSchema),
    remove,
);
