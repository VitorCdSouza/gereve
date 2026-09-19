import { Request, Response } from 'express';
import {
    createReservation,
    listEventReservations,
    listUserReservations,
} from '../services/reservation.service';
import { EventIdParams } from '../schemas/event.schema';
import { listReservationsQuerySchema } from '../schemas/reservation.schema';
import { AppError } from '../errors/AppError';

type CreateReservationRequest = Request<EventIdParams>;

type ListEventReservationsRequest = Request<EventIdParams>;

export async function create(req: CreateReservationRequest, res: Response): Promise<void> {
    if (req.user === undefined) {
        throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
    }

    const createdReservation = await createReservation(req.params.id, req.user.id);

    res.status(201).json(createdReservation);
}

export async function listByEvent(req: ListEventReservationsRequest, res: Response): Promise<void> {
    if (req.user === undefined) {
        throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
    }

    const query = listReservationsQuerySchema.parse(req.query);

    const listedReservations = await listEventReservations(req.params.id, query, req.user);

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
