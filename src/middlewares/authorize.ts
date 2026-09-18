import { NextFunction, Request, RequestHandler, Response } from 'express';
import { UserRole } from '@prisma/client';
import { AppError } from '../errors/AppError';

export function authorize(...allowedRoles: UserRole[]): RequestHandler {
    return function authorizeUserRole(req: Request, res: Response, next: NextFunction): void {
        if (req.user === undefined) {
            throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
        }

        const roleIsAllowed = allowedRoles.includes(req.user.role);

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
