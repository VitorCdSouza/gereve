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

export async function findUserById(id: string): Promise<User | null> {
    const foundUser = await prismaClient.user.findUnique({ where: { id } });

    return foundUser;
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const foundUser = await prismaClient.user.findUnique({ where: { email } });

    return foundUser;
}
