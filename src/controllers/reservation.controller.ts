import { Request, Response } from 'express';
import {
    cancelReservation,
    createReservation,
    listEventReservations,
    listUserReservations,
} from '../services/reservation.service';
import { eventIdParamsSchema } from '../schemas/event.schema';
import {
    listReservationsQuerySchema,
    reservationIdParamsSchema,
} from '../schemas/reservation.schema';
import { getActor } from '../lib/actor';

export async function create(req: Request, res: Response): Promise<void> {
    const actor = getActor(req);

    const params = eventIdParamsSchema.parse(req.params);

    const createdReservation = await createReservation(params.id, actor.id);

    res.status(201).json(createdReservation);
}

export async function listByEvent(req: Request, res: Response): Promise<void> {
    const actor = getActor(req);

    const params = eventIdParamsSchema.parse(req.params);
    const query = listReservationsQuerySchema.parse(req.query);

    const listedReservations = await listEventReservations(params.id, query, actor);

    res.status(200).json(listedReservations);
}

export async function listMine(req: Request, res: Response): Promise<void> {
    const actor = getActor(req);

    const query = listReservationsQuerySchema.parse(req.query);

    const listedReservations = await listUserReservations(actor.id, query);

    res.status(200).json(listedReservations);
}

export async function cancel(req: Request, res: Response): Promise<void> {
    const actor = getActor(req);

    const params = reservationIdParamsSchema.parse(req.params);

    const cancelledReservation = await cancelReservation(params.id, actor);

    res.status(200).json(cancelledReservation);
}
