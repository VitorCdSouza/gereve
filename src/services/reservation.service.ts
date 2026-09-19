import { Reservation } from '@prisma/client';
import {
    ReservationWithEvent,
    ReservationWithUser,
    countConfirmedReservationsByEvent,
    countReservationsByEvent,
    countReservationsByUser,
    createReservation as createReservationRecord,
    findReservationsByEvent,
    findReservationsByUser,
} from '../repositories/reservation.repository';
import { EventActor, assertActorCanManageEvent, getEvent } from './event.service';
import { ListReservationsQuery } from '../schemas/reservation.schema';
import { PaginationInfos, buildPaginationInfos, calculateSkip } from '../lib/pagination';
import { AppError } from '../errors/AppError';

export type EventReservationListResult = {
    data: ReservationWithUser[];
    infos: PaginationInfos;
};

export type UserReservationListResult = {
    data: ReservationWithEvent[];
    infos: PaginationInfos;
};

export async function createReservation(eventId: string, userId: string): Promise<Reservation> {
    const event = await getEvent(eventId);

    const confirmedReservations = await countConfirmedReservationsByEvent(event.id);

    if (confirmedReservations >= event.capacity) {
        throw new AppError('Evento sem vagas disponíveis', 409, 'EVENT_CAPACITY_REACHED');
    }

    const createdReservation = await createReservationRecord({ eventId: event.id, userId });

    return createdReservation;
}

export async function listEventReservations(
    eventId: string,
    query: ListReservationsQuery,
    actor: EventActor,
): Promise<EventReservationListResult> {
    const event = await getEvent(eventId);

    assertActorCanManageEvent(event, actor);

    const skip = calculateSkip(query.page, query.limit);

    const reservations = await findReservationsByEvent(event.id, { skip, take: query.limit });

    const total = await countReservationsByEvent(event.id);

    return {
        data: reservations,
        infos: buildPaginationInfos(query.page, query.limit, total),
    };
}

export async function listUserReservations(
    userId: string,
    query: ListReservationsQuery,
): Promise<UserReservationListResult> {
    const skip = calculateSkip(query.page, query.limit);

    const reservations = await findReservationsByUser(userId, { skip, take: query.limit });

    const total = await countReservationsByUser(userId);

    return {
        data: reservations,
        infos: buildPaginationInfos(query.page, query.limit, total),
    };
}
