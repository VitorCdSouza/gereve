import bcrypt from 'bcrypt';
import { User, UserRole } from '@prisma/client';
import { createUser, findUserByEmail, findUserById } from '../repositories/user.repository';
import { LoginUserInput, RegisterUserInput } from '../schemas/auth.schema';
import { signAccessToken } from '../lib/token';
import { AppError } from '../errors/AppError';

const PASSWORD_SALT_ROUNDS = 10;

export type PublicUser = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
};

function toPublicUser(user: User): PublicUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

export type LoginResult = {
    token: string;
    user: PublicUser;
};

export async function registerUser(input: RegisterUserInput): Promise<PublicUser> {
    const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

    const createdUser = await createUser({
        name: input.name,
        email: input.email,
        passwordHash,
    });

    return toPublicUser(createdUser);
}

export async function loginUser(input: LoginUserInput): Promise<LoginResult> {
    const invalidCredentialsError = new AppError(
        'E-mail ou senha inválidos',
        401,
        'INVALID_CREDENTIALS',
    );

    const foundUser = await findUserByEmail(input.email);

    if (foundUser === null) {
        throw invalidCredentialsError;
    }

    const passwordMatches = await bcrypt.compare(input.password, foundUser.passwordHash);

    if (!passwordMatches) {
        throw invalidCredentialsError;
    }

    const token = signAccessToken({ sub: foundUser.id, role: foundUser.role });

    return {
        token,
        user: toPublicUser(foundUser),
    };
}

export async function getAuthenticatedUser(userId: string): Promise<PublicUser> {
    const foundUser = await findUserById(userId);

    if (foundUser === null) {
        throw new AppError('Usuário não encontrado', 404, 'USER_NOT_FOUND');
    }

    return toPublicUser(foundUser);
}
