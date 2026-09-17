import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { authenticate } from '../middlewares/authenticate';
import { loginUserSchema, registerUserSchema } from '../schemas/auth.schema';
import { login, me, register } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', validate(registerUserSchema), register);
authRouter.post('/login', validate(loginUserSchema), login);
authRouter.get('/me', authenticate, me);
