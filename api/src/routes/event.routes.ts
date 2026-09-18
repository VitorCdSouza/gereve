import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { validate } from '../middlewares/validate';
import { createEventSchema } from '../schemas/event.schema';
import { create } from '../controllers/event.controller';

export const eventRouter = Router();

eventRouter.post(
    '/',
    authenticate,
    authorize(UserRole.ORGANIZER, UserRole.ADMIN),
    validate(createEventSchema),
    create,
);
