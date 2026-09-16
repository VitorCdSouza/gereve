import { ParamsDictionary } from 'express-serve-static-core';
import { Request, Response } from 'express';
import { registerUser } from '../services/auth.service';
import { RegisterUserInput } from '../schemas/auth.schema';

type RegisterRequest = Request<ParamsDictionary, unknown, RegisterUserInput>;

export async function register(req: RegisterRequest, res: Response): Promise<void> {
    const createdUser = await registerUser(req.body);

    res.status(201).json(createdUser);
}
