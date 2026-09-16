import bcrypt from 'bcrypt';
import { User, UserRole } from '@prisma/client';
import { createUser } from '../repositories/user.repository';
import { RegisterUserInput } from '../schemas/auth.schema';

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

export async function registerUser(input: RegisterUserInput): Promise<PublicUser> {
    const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);

    const createdUser = await createUser({
        name: input.name,
        email: input.email,
        passwordHash,
    });

    return toPublicUser(createdUser);
}
