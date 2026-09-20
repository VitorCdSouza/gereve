import { Request } from 'express';
import { Actor } from '../types/actor';
import { AppError } from '../errors/AppError';

export function getActor(req: Request): Actor {
    if (req.user === undefined) {
        throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
    }

    return req.user;
}
