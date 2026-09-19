import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ZodType } from 'zod';

export function validate(bodySchema: ZodType): RequestHandler {
    return function validateRequestBody(req: Request, res: Response, next: NextFunction): void {
        const validatedBody: unknown = bodySchema.parse(req.body);

        req.body = validatedBody;
        next();
    };
}

export function validateQuery<QueryType>(
    querySchema: ZodType<QueryType>,
): RequestHandler<ParamsDictionary, unknown, unknown, QueryType> {
    return function validateRequestQuery(
        req: Request<ParamsDictionary, unknown, unknown, QueryType>,
        res: Response,
        next: NextFunction,
    ): void {
        const validatedQuery = querySchema.parse(req.query);

        Object.defineProperty(req, 'query', {
            value: validatedQuery,
            writable: true,
            configurable: true,
            enumerable: true,
        });

        next();
    };
}

export function validateParams<ParamsType extends ParamsDictionary>(
    paramsSchema: ZodType<ParamsType>,
): RequestHandler<ParamsType> {
    return function validateRequestParams(
        req: Request<ParamsType>,
        res: Response,
        next: NextFunction,
    ): void {
        const validatedParams = paramsSchema.parse(req.params);

        req.params = validatedParams;
        next();
    };
}
