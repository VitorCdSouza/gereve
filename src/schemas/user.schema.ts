import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { limitSchema, pageSchema } from './pagination.schema';

export const listUsersQuerySchema = z.object({
    page: pageSchema,
    limit: limitSchema,
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const userIdParamsSchema = z.object({
    id: z.uuid({ error: 'Identificador do usuário deve ser um UUID válido' }),
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;

export const updateUserRoleSchema = z.object({
    role: z.enum(UserRole, { error: 'Papel deve ser ADMIN, ORGANIZER ou CUSTOMER' }),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
