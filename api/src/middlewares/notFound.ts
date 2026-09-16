import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';

export function notFound(req: Request, res: Response, next: NextFunction): void {
    const message = `Rota não encontrada: ${req.method} ${req.originalUrl}`;

    next(new AppError(message, 404, 'ROUTE_NOT_FOUND'));
}
