import { NextFunction, Request, RequestHandler, Response } from 'express';
import { UserRole } from '@prisma/client';
import { AppError } from '../errors/AppError';
import { getActor } from '../lib/actor';

export function authorize(...allowedRoles: UserRole[]): RequestHandler {
    return function authorizeUserRole(req: Request, res: Response, next: NextFunction): void {
        const actor = getActor(req);

        const roleIsAllowed = allowedRoles.includes(actor.role);

        if (!roleIsAllowed) {
            throw new AppError(
                'Você não tem permissão para acessar este recurso',
                403,
                'FORBIDDEN',
            );
        }

        next();
    };
}
