import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { MulterError } from 'multer';
import { AppError } from '../errors/AppError';
import { env } from '../config/env';
import { MAX_UPLOAD_SIZE_BYTES } from '../config/upload';

type ValidationIssue = {
    field: string;
    message: string;
};

type ErrorResponseBody = {
    error: {
        code: string;
        message: string;
        details?: ValidationIssue[];
    };
};

function toValidationIssues(error: ZodError): ValidationIssue[] {
    const issues = error.issues.map((issue) => {
        const field = issue.path.join('.');

        return { field, message: issue.message };
    });

    return issues;
}

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

    // recebido pelo validate.ts
    if (error instanceof ZodError) {
        const body: ErrorResponseBody = {
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Dados inválidos',
                details: toValidationIssues(error),
            },
        };

        res.status(400).json(body);
        return;
    }

    // recebe pelo prisma ao tentar inserir duplicado
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const body: ErrorResponseBody = {
            error: {
                code: 'RESOURCE_ALREADY_EXISTS',
                message: 'Já existe um registro com os dados informados',
            },
        };

        res.status(409).json(body);
        return;
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        const body: ErrorResponseBody = {
            error: {
                code: 'RESOURCE_NOT_FOUND',
                message: 'Registro não encontrado',
            },
        };

        res.status(404).json(body);
        return;
    }

    // recebido pelo authenticate, ao verificar o token
    if (error instanceof TokenExpiredError) {
        const body: ErrorResponseBody = {
            error: {
                code: 'TOKEN_EXPIRED',
                message: 'Token de autenticação expirado',
            },
        };

        res.status(401).json(body);
        return;
    }

    if (error instanceof JsonWebTokenError) {
        const body: ErrorResponseBody = {
            error: {
                code: 'INVALID_TOKEN',
                message: 'Token de autenticação inválido',
            },
        };

        res.status(401).json(body);
        return;
    }

    if (error instanceof MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            const body: ErrorResponseBody = {
                error: {
                    code: 'FILE_TOO_LARGE',
                    message: `Arquivo excede o tamanho máximo de ${MAX_UPLOAD_SIZE_BYTES} bytes`,
                },
            };

            res.status(413).json(body);
            return;
        }

        const body: ErrorResponseBody = {
            error: {
                code: 'INVALID_UPLOAD',
                message: 'Envio de arquivo inválido',
            },
        };

        res.status(400).json(body);
        return;
    }

    // erro de corpo invalido
    if (error instanceof SyntaxError && 'body' in error) {
        const body: ErrorResponseBody = {
            error: {
                code: 'INVALID_JSON',
                message: 'Corpo da requisição não é um JSON válido',
            },
        };

        res.status(400).json(body);
        return;
    }

    if (env.NODE_ENV !== 'test') {
        console.error('erro não tratado:', error);
    }

    const body: ErrorResponseBody = {
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Erro interno do servidor',
        },
    };

    res.status(500).json(body);
}
