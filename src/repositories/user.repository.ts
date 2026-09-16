import { User } from '@prisma/client';
import { prismaClient } from '../lib/prisma';

export type CreateUserData = {
    name: string;
    email: string;
    passwordHash: string;
};

export async function createUser(data: CreateUserData): Promise<User> {
    const createdUser = await prismaClient.user.create({ data });

    return createdUser;
}
