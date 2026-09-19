import { Request, Response } from 'express';
import {
    createEvent,
    deleteEvent,
    getEvent,
    listEvents,
    updateEvent,
} from '../services/event.service';
import {
    createEventSchema,
    eventIdParamsSchema,
    listEventsQuerySchema,
    updateEventSchema,
} from '../schemas/event.schema';
import { AppError } from '../errors/AppError';

export async function create(req: Request, res: Response): Promise<void> {
    if (req.user === undefined) {
        throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
    }

    const body = createEventSchema.parse(req.body);

    const createdEvent = await createEvent(body, req.user.id);

    res.status(201).json(createdEvent);
}

export async function list(req: Request, res: Response): Promise<void> {
    const query = listEventsQuerySchema.parse(req.query);

    const listedEvents = await listEvents(query);

    res.status(200).json(listedEvents);
}

export async function getById(req: Request, res: Response): Promise<void> {
    const params = eventIdParamsSchema.parse(req.params);

    const event = await getEvent(params.id);

    res.status(200).json(event);
}

export async function update(req: Request, res: Response): Promise<void> {
    if (req.user === undefined) {
        throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
    }

    const params = eventIdParamsSchema.parse(req.params);
    const body = updateEventSchema.parse(req.body);

    const updatedEvent = await updateEvent(params.id, body, req.user);

    res.status(200).json(updatedEvent);
}

export async function remove(req: Request, res: Response): Promise<void> {
    if (req.user === undefined) {
        throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
    }

    const params = eventIdParamsSchema.parse(req.params);

    await deleteEvent(params.id, req.user);

    res.status(204).send();
}
