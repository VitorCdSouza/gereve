import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate, validateParams, validateQuery } from '../middlewares/validate';
import {
    createEventSchema,
    eventIdParamsSchema,
    listEventsQuerySchema,
} from '../schemas/event.schema';
import { create, getById, list } from '../controllers/event.controller';

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
