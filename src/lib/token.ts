import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { env } from '../config/env';
import { AppError } from '../errors/AppError';

export type AccessTokenPayload = {
    sub: string;
    role: UserRole;
};

const accessTokenPayloadSchema = z.object({
    sub: z.string(),
    role: z.enum(UserRole),
});

export function signAccessToken(payload: AccessTokenPayload): string {
    const token = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN_SECONDS,
    });

    return token;
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    const decodedPayload = jwt.verify(token, env.JWT_SECRET);
    const parsedPayload = accessTokenPayloadSchema.safeParse(decodedPayload);

    if (!parsedPayload.success) {
        throw new AppError('Token inválido', 401, 'INVALID_TOKEN');
    }

    return parsedPayload.data;
}
