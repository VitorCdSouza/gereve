import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/token';
import { AppError } from '../errors/AppError';

const AUTHORIZATION_SCHEME = 'Bearer';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader === undefined) {
        throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
    }

    const [scheme, token] = authorizationHeader.split(' ');

    if (scheme !== AUTHORIZATION_SCHEME || token === undefined || token.length === 0) {
        throw new AppError('Token de autenticação malformado', 401, 'UNAUTHORIZED');
    }

    const payload = verifyAccessToken(token);

    req.user = { id: payload.sub, role: payload.role };
    next();
}
