import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodType } from 'zod';

export function validate(bodySchema: ZodType): RequestHandler {
    return function validateRequestBody(req: Request, res: Response, next: NextFunction): void {
        const validatedBody: unknown = bodySchema.parse(req.body);

        req.body = validatedBody;
        next();
    };
}
