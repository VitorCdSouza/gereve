import { Request, Response } from 'express';
import {
    createReservation,
    listEventReservations,
    listUserReservations,
} from '../services/reservation.service';
import { eventIdParamsSchema } from '../schemas/event.schema';
import { listReservationsQuerySchema } from '../schemas/reservation.schema';
import { AppError } from '../errors/AppError';

export async function create(req: Request, res: Response): Promise<void> {
    if (req.user === undefined) {
        throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
    }

    const params = eventIdParamsSchema.parse(req.params);

    const createdReservation = await createReservation(params.id, req.user.id);

    res.status(201).json(createdReservation);
}

export async function listByEvent(req: Request, res: Response): Promise<void> {
    if (req.user === undefined) {
        throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
    }

    const params = eventIdParamsSchema.parse(req.params);
    const query = listReservationsQuerySchema.parse(req.query);

    const listedReservations = await listEventReservations(params.id, query, req.user);

    res.status(200).json(listedReservations);
}

export async function listMine(req: Request, res: Response): Promise<void> {
    if (req.user === undefined) {
        throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
    }

    const query = listReservationsQuerySchema.parse(req.query);

    const listedReservations = await listUserReservations(req.user.id, query);

    res.status(200).json(listedReservations);
}
