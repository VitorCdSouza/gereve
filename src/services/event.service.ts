import { Event, UserRole } from '@prisma/client';
import {
    EventFilters,
    UpdateEventData,
    countEvents,
    createEvent as createEventRecord,
    deleteEvent as deleteEventRecord,
    findEventById,
    findEvents,
    updateEvent as updateEventRecord,
} from '../repositories/event.repository';
import { CreateEventInput, ListEventsQuery, UpdateEventInput } from '../schemas/event.schema';
import { PaginationInfos, buildPagination, calculateSkip } from '../lib/pagination';
import { AppError } from '../errors/AppError';
import { Actor } from '../types/actor';

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

    const skip = calculateSkip(query.page, query.limit);

    const events = await findEvents({
        filters,
        skip,
        take: query.limit,
        sortField: query.sort,
        sortOrder: query.order,
    });

    const total = await countEvents(filters);

    return {
        data: events,
        infos: buildPagination(query.page, query.limit, total),
    };
}

export async function getEvent(id: string): Promise<Event> {
    const event = await findEventById(id);

    if (event === null) {
        throw new AppError('Evento não encontrado', 404, 'EVENT_NOT_FOUND');
    }

    return event;
}

export function assertCanManageEvent(event: Event, actor: Actor): void {
    const actorIsOrganizer = event.organizerId === actor.id;
    const actorIsAdmin = actor.role === UserRole.ADMIN;

    if (!actorIsOrganizer && !actorIsAdmin) {
        throw new AppError('Você não tem permissão para gerenciar este evento', 403, 'FORBIDDEN');
    }
}

function assertPeriodIsValid(startsAt: Date, endsAt: Date): void {
    if (endsAt.getTime() <= startsAt.getTime()) {
        throw new AppError(
            'Data de término deve ser posterior à data de início',
            400,
            'INVALID_EVENT_PERIOD',
        );
    }
}

export async function updateEvent(
    id: string,
    input: UpdateEventInput,
    actor: Actor,
): Promise<Event> {
    const currentEvent = await getEvent(id);

    assertCanManageEvent(currentEvent, actor);

    const startsAt = input.startsAt ?? currentEvent.startsAt;
    const endsAt = input.endsAt ?? currentEvent.endsAt;

    assertPeriodIsValid(startsAt, endsAt);

    const data: UpdateEventData = {
        title: input.title,
        description: input.description,
        location: input.location,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        capacity: input.capacity,
        status: input.status,
    };

    const updatedEvent = await updateEventRecord(id, data);

    return updatedEvent;
}

export async function deleteEvent(id: string, actor: Actor): Promise<void> {
    const currentEvent = await getEvent(id);

    assertCanManageEvent(currentEvent, actor);

    await deleteEventRecord(id);
}
