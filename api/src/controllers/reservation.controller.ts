import { Request, Response } from 'express';
import { createReservation } from '../services/reservation.service';
import { EventIdParams } from '../schemas/event.schema';
import { AppError } from '../errors/AppError';

type CreateReservationRequest = Request<EventIdParams>;

export async function create(req: CreateReservationRequest, res: Response): Promise<void> {
    if (req.user === undefined) {
        throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
    }

    const createdReservation = await createReservation(req.params.id, req.user.id);

    res.status(201).json(createdReservation);
}
