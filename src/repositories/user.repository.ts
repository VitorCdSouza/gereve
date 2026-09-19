import { User, UserRole } from '@prisma/client';
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

export type FindUsersParams = {
    skip: number;
    take: number;
};

export async function findUsers(params: FindUsersParams): Promise<User[]> {
    const users = await prismaClient.user.findMany({
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
    });

    return users;
}

export async function countUsers(): Promise<number> {
    const total = await prismaClient.user.count();

    return total;
}

export async function updateUserRole(id: string, role: UserRole): Promise<User> {
    const updatedUser = await prismaClient.user.update({
        where: { id },
        data: { role },
    });

    return updatedUser;
}
