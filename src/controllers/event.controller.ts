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
import { getActor } from '../lib/actor';

export async function create(req: Request, res: Response): Promise<void> {
    const actor = getActor(req);

    const body = createEventSchema.parse(req.body);

    const createdEvent = await createEvent(body, actor.id);

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
    const actor = getActor(req);

    const params = eventIdParamsSchema.parse(req.params);
    const body = updateEventSchema.parse(req.body);

    const updatedEvent = await updateEvent(params.id, body, actor);

    res.status(200).json(updatedEvent);
}

export async function remove(req: Request, res: Response): Promise<void> {
    const actor = getActor(req);

    const params = eventIdParamsSchema.parse(req.params);

    await deleteEvent(params.id, actor);

    res.status(204).send();
}
