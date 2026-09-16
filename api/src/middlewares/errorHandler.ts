import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { env } from '../config/env';

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
