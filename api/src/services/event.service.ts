import { Event } from '@prisma/client';
import {
    EventFilters,
    countEvents,
    createEvent as createEventRecord,
    findEventById,
    findEvents,
} from '../repositories/event.repository';
import { CreateEventInput, ListEventsQuery } from '../schemas/event.schema';
import { AppError } from '../errors/AppError';

export type PaginationInfos = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type EventListResult = {
    data: Event[];
    infos: PaginationInfos;
};

export async function createEvent(input: CreateEventInput, organizerId: string): Promise<Event> {
    const createdEvent = await createEventRecord({
        title: input.title,
        description: input.description,
        location: input.location,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        capacity: input.capacity,
        organizerId,
    });

    return createdEvent;
}

export async function listEvents(query: ListEventsQuery): Promise<EventListResult> {
    const filters: EventFilters = {
        title: query.title,
        status: query.status,
        startsAtFrom: query.from,
        startsAtTo: query.to,
        organizerId: query.organizerId,
    };

    const skip = (query.page - 1) * query.limit;

    const events = await findEvents({
        filters,
        skip,
        take: query.limit,
        sortField: query.sort,
        sortOrder: query.order,
    });

    const total = await countEvents(filters);
    const totalPages = Math.ceil(total / query.limit);

    return {
        data: events,
        infos: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages,
        },
    };
}

export async function getEvent(id: string): Promise<Event> {
    const event = await findEventById(id);

    if (event === null) {
        throw new AppError('Evento não encontrado', 404, 'EVENT_NOT_FOUND');
    }

    return event;
}
