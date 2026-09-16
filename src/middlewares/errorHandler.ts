import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { env } from '../config/env';

type ErrorResponseBody = {
    error: {
        code: string;
        message: string;
    };
};

export function errorHandler(
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    // erro mandado por outro lugar, como no notFound
    if (error instanceof AppError) {
        const body: ErrorResponseBody = {
            error: {
                code: error.code,
                message: error.message,
            },
        };

        res.status(error.statusCode).json(body);
        return;
    }

    // erro de corpo invalido
    if (error instanceof SyntaxError && 'body' in error) {
        res.status(400).json({
            error: {
                code: 'INVALID_JSON',
                message: 'Corpo da requisição não é um JSON válido',
            },
        });
        return;
    }

    if (env.NODE_ENV !== 'test') {
        console.error('erro não tratado:', error);
    }

    res.status(500).json({
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Erro interno do servidor',
        },
    });
}
