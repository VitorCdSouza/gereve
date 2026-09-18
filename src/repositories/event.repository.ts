import { Event } from '@prisma/client';
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

export async function createEvent(data: CreateEventData): Promise<Event> {
    const createdEvent = await prismaClient.event.create({ data });

    return createdEvent;
}

export async function findEvents(): Promise<Event[]> {
    const events = await prismaClient.event.findMany({ orderBy: { startsAt: 'asc' } });

    return events;
}
