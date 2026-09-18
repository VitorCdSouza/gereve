import { Event } from '@prisma/client';
import { createEvent as createEventRecord } from '../repositories/event.repository';
import { CreateEventInput } from '../schemas/event.schema';

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
