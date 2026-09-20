import { Reservation, ReservationStatus, UserRole } from '@prisma/client';
import {
    ReservationWithEvent,
    ReservationWithUser,
    countConfirmedReservationsByEvent,
    countReservationsByEvent,
    countReservationsByUser,
    cancelReservation as cancelReservationRecord,
    createReservation as createReservationRecord,
    findReservationById,
    findReservationsByEvent,
    findReservationsByUser,
} from '../repositories/reservation.repository';
import { EventActor, assertCanManageEvent, getEvent } from './event.service';
import { ListReservationsQuery } from '../schemas/reservation.schema';
import { PaginationInfos, buildPagination, calculateSkip } from '../lib/pagination';
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

    assertCanManageEvent(event, actor);

    const skip = calculateSkip(query.page, query.limit);

    const reservations = await findReservationsByEvent(event.id, { skip, take: query.limit });

    const total = await countReservationsByEvent(event.id);

    return {
        data: reservations,
        infos: buildPagination(query.page, query.limit, total),
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
        infos: buildPagination(query.page, query.limit, total),
    };
}

export type ReservationActor = {
    id: string;
    role: UserRole;
};

function assertActorCanManageReservation(reservation: Reservation, actor: ReservationActor): void {
    const actorIsOwner = reservation.userId === actor.id;
    const actorIsAdmin = actor.role === UserRole.ADMIN;

    if (!actorIsOwner && !actorIsAdmin) {
        throw new AppError('Você não tem permissão para gerenciar esta reserva', 403, 'FORBIDDEN');
    }
}

export async function cancelReservation(id: string, actor: ReservationActor): Promise<Reservation> {
    const reservation = await findReservationById(id);

    if (reservation === null) {
        throw new AppError('Reserva não encontrada', 404, 'RESERVATION_NOT_FOUND');
    }

    assertActorCanManageReservation(reservation, actor);

    if (reservation.status === ReservationStatus.CANCELLED) {
        throw new AppError('Reserva já está cancelada', 409, 'RESERVATION_ALREADY_CANCELLED');
    }

    const cancelledReservation = await cancelReservationRecord(reservation.id);

    return cancelledReservation;
}
