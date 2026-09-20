import { Request, Response } from 'express';
import { getAuthenticatedUser, loginUser, registerUser } from '../services/auth.service';
import { loginUserSchema, registerUserSchema } from '../schemas/auth.schema';
import { getActor } from '../lib/actor';

export async function register(req: Request, res: Response): Promise<void> {
    const body = registerUserSchema.parse(req.body);

    const createdUser = await registerUser(body);

    res.status(201).json(createdUser);
}

export async function login(req: Request, res: Response): Promise<void> {
    const body = loginUserSchema.parse(req.body);

    const loginResult = await loginUser(body);

    res.status(200).json(loginResult);
}

export async function me(req: Request, res: Response): Promise<void> {
    const actor = getActor(req);

    const authenticatedUser = await getAuthenticatedUser(actor.id);

    res.status(200).json(authenticatedUser);
}
