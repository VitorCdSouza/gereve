import { Request, Response } from 'express';
import { listUsers, updateUserRole } from '../services/user.service';
import {
    listUsersQuerySchema,
    updateUserRoleSchema,
    userIdParamsSchema,
} from '../schemas/user.schema';

export async function list(req: Request, res: Response): Promise<void> {
    const query = listUsersQuerySchema.parse(req.query);

    const listedUsers = await listUsers(query);

    res.status(200).json(listedUsers);
}

export async function updateRole(req: Request, res: Response): Promise<void> {
    const params = userIdParamsSchema.parse(req.params);
    const body = updateUserRoleSchema.parse(req.body);

    const updatedUser = await updateUserRole(params.id, body.role);

    res.status(200).json(updatedUser);
}
