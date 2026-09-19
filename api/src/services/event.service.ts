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

export type EventActor = {
    id: string;
    role: UserRole;
};

function assertActorCanManageEvent(event: Event, actor: EventActor): void {
    const actorIsOrganizer = event.organizerId === actor.id;
    const actorIsAdmin = actor.role === UserRole.ADMIN;

    if (!actorIsOrganizer && !actorIsAdmin) {
        throw new AppError('Você não tem permissão para alterar este evento', 403, 'FORBIDDEN');
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
    actor: EventActor,
): Promise<Event> {
    const currentEvent = await getEvent(id);

    assertActorCanManageEvent(currentEvent, actor);

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

export async function deleteEvent(id: string, actor: EventActor): Promise<void> {
    const currentEvent = await getEvent(id);

    assertActorCanManageEvent(currentEvent, actor);

    await deleteEventRecord(id);
}
