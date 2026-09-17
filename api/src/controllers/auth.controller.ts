import { ParamsDictionary } from 'express-serve-static-core';
import { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service';
import { LoginUserInput, RegisterUserInput } from '../schemas/auth.schema';

type RegisterRequest = Request<ParamsDictionary, unknown, RegisterUserInput>;
type LoginRequest = Request<ParamsDictionary, unknown, LoginUserInput>;

export async function register(req: RegisterRequest, res: Response): Promise<void> {
    const createdUser = await registerUser(req.body);

    res.status(201).json(createdUser);
}

export async function login(req: LoginRequest, res: Response): Promise<void> {
    const loginResult = await loginUser(req.body);

    res.status(200).json(loginResult);
}
