import { Event, EventStatus, Prisma } from '@prisma/client';
import { prismaClient } from '../lib/prisma';

export type CreateEventData = {
    title: string;
    description: string;
    location: string;
    startsAt: Date;
    endsAt: Date;
    capacity: number;
    organizerId: string;
};

export type EventFilters = {
    title?: string;
    statuses?: EventStatus[];
    startsAtFrom?: Date;
    startsAtTo?: Date;
    organizerId?: string;
};

export type EventSortField = 'startsAt' | 'title' | 'createdAt';

export type EventSortOrder = 'asc' | 'desc';

export type FindEventsParams = {
    filters: EventFilters;
    skip: number;
    take: number;
    sortField: EventSortField;
    sortOrder: EventSortOrder;
};

function buildEventWhere(filters: EventFilters): Prisma.EventWhereInput {
    const where: Prisma.EventWhereInput = {};

    if (filters.title !== undefined) {
        where.title = { contains: filters.title, mode: 'insensitive' };
    }

    if (filters.statuses !== undefined) {
        where.status = { in: filters.statuses };
    }

    if (filters.organizerId !== undefined) {
        where.organizerId = filters.organizerId;
    }

    const startsAtFilter: Prisma.DateTimeFilter = {};

    if (filters.startsAtFrom !== undefined) {
        startsAtFilter.gte = filters.startsAtFrom;
    }

    if (filters.startsAtTo !== undefined) {
        startsAtFilter.lte = filters.startsAtTo;
    }

    if (Object.keys(startsAtFilter).length > 0) {
        where.startsAt = startsAtFilter;
    }

    return where;
}

export async function createEvent(data: CreateEventData): Promise<Event> {
    const createdEvent = await prismaClient.event.create({ data });

    return createdEvent;
}

export async function findEvents(params: FindEventsParams): Promise<Event[]> {
    const where = buildEventWhere(params.filters);

    const events = await prismaClient.event.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { [params.sortField]: params.sortOrder },
    });

    return events;
}

export async function countEvents(filters: EventFilters): Promise<number> {
    const where = buildEventWhere(filters);

    const total = await prismaClient.event.count({ where });

    return total;
}

export async function findEventById(id: string): Promise<Event | null> {
    const event = await prismaClient.event.findUnique({ where: { id } });

    return event;
}

export type UpdateEventData = {
    title?: string;
    description?: string;
    location?: string;
    startsAt?: Date;
    endsAt?: Date;
    capacity?: number;
    status?: EventStatus;
};

export async function updateEvent(id: string, data: UpdateEventData): Promise<Event> {
    const updatedEvent = await prismaClient.event.update({ where: { id }, data });

    return updatedEvent;
}

export async function deleteEvent(id: string): Promise<void> {
    await prismaClient.event.delete({ where: { id } });
}
