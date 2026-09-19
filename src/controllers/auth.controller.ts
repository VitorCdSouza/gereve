import { Request, Response } from 'express';
import { getAuthenticatedUser, loginUser, registerUser } from '../services/auth.service';
import { loginUserSchema, registerUserSchema } from '../schemas/auth.schema';
import { AppError } from '../errors/AppError';

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
    if (req.user === undefined) {
        throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
    }

    const authenticatedUser = await getAuthenticatedUser(req.user.id);

    res.status(200).json(authenticatedUser);
}
