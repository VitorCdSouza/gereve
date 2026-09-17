import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';
import { env } from '../config/env';

export type AccessTokenPayload = {
    sub: string;
    role: UserRole;
};

export function signAccessToken(payload: AccessTokenPayload): string {
    const token = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN_SECONDS,
    });

    return token;
}
