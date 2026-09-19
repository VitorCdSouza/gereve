import { ParamsDictionary } from 'express-serve-static-core';
import { Request, Response } from 'express';
import { createEvent, getEvent, listEvents } from '../services/event.service';
import { CreateEventInput, EventIdParams, ListEventsQuery } from '../schemas/event.schema';
import { AppError } from '../errors/AppError';

type CreateEventRequest = Request<ParamsDictionary, unknown, CreateEventInput>;

type ListEventsRequest = Request<ParamsDictionary, unknown, unknown, ListEventsQuery>;

type EventByIdRequest = Request<EventIdParams>;

export async function create(req: CreateEventRequest, res: Response): Promise<void> {
    if (req.user === undefined) {
        throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
    }

    const createdEvent = await createEvent(req.body, req.user.id);

    res.status(201).json(createdEvent);
}

export async function list(req: ListEventsRequest, res: Response): Promise<void> {
    const listedEvents = await listEvents(req.query);

    res.status(200).json(listedEvents);
}

export async function getById(req: EventByIdRequest, res: Response): Promise<void> {
    const event = await getEvent(req.params.id);

    res.status(200).json(event);
}
