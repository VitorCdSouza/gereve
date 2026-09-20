import { User, UserRole } from '@prisma/client';
import {
    countUsers,
    findUsers,
    updateUserRole as updateUserRoleRecord,
} from '../repositories/user.repository';
import { ListUsersQuery } from '../schemas/user.schema';
import { PaginationInfos, buildPagination, calculateSkip } from '../lib/pagination';

export type PublicUser = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
};

export function toPublicUser(user: User): PublicUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}

export type UserListResult = {
    data: PublicUser[];
    infos: PaginationInfos;
};

export async function listUsers(query: ListUsersQuery): Promise<UserListResult> {
    const skip = calculateSkip(query.page, query.limit);

    const users = await findUsers({ skip, take: query.limit });

    const total = await countUsers();

    const publicUsers = users.map(toPublicUser);

    return {
        data: publicUsers,
        infos: buildPagination(query.page, query.limit, total),
    };
}

export async function updateUserRole(id: string, role: UserRole): Promise<PublicUser> {
    const updatedUser = await updateUserRoleRecord(id, role);

    return toPublicUser(updatedUser);
}
