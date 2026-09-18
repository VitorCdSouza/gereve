import { ParamsDictionary } from 'express-serve-static-core';
import { Request, Response } from 'express';
import { createEvent, listEvents } from '../services/event.service';
import { CreateEventInput } from '../schemas/event.schema';
import { AppError } from '../errors/AppError';

type CreateEventRequest = Request<ParamsDictionary, unknown, CreateEventInput>;

export async function create(req: CreateEventRequest, res: Response): Promise<void> {
    if (req.user === undefined) {
        throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
    }

    const createdEvent = await createEvent(req.body, req.user.id);

    res.status(201).json(createdEvent);
}

export async function list(req: Request, res: Response): Promise<void> {
    const events = await listEvents();

    res.status(200).json(events);
}
