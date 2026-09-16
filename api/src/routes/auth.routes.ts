import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { registerUserSchema } from '../schemas/auth.schema';
import { register } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', validate(registerUserSchema), register);
