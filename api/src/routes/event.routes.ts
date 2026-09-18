import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate, validateQuery } from '../middlewares/validate';
import { createEventSchema, listEventsQuerySchema } from '../schemas/event.schema';
import { create, list } from '../controllers/event.controller';

export const eventRouter = Router();

eventRouter.get('/', validateQuery(listEventsQuerySchema), list);

eventRouter.post(
    '/',
    authenticate,
    authorize(UserRole.ORGANIZER, UserRole.ADMIN),
    validate(createEventSchema),
    create,
);
