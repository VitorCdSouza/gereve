import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import { list as listUsers, updateRole as updateUserRole } from '../controllers/user.controller';

export const userRouter = Router();

userRouter.get('/', authenticate, authorize(UserRole.ADMIN), listUsers);

userRouter.patch('/:id/role', authenticate, authorize(UserRole.ADMIN), updateUserRole);
