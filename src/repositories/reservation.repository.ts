import { Prisma, Reservation, ReservationStatus } from '@prisma/client';
import { prismaClient } from '../lib/prisma';

export type CreateReservationData = {
    userId: string;
    eventId: string;
};

export type FindReservationsParams = {
    skip: number;
    take: number;
};

export type ReservationWithUser = Prisma.ReservationGetPayload<{
    include: { user: { select: { id: true; name: true; email: true } } };
}>;

export type ReservationWithEvent = Prisma.ReservationGetPayload<{
    include: { event: true };
}>;

export async function createReservation(data: CreateReservationData): Promise<Reservation> {
    const createdReservation = await prismaClient.reservation.create({ data });

    return createdReservation;
}

export async function countConfirmedReservationsByEvent(eventId: string): Promise<number> {
    const total = await prismaClient.reservation.count({
        where: { eventId, status: ReservationStatus.CONFIRMED },
    });

    return total;
}

export async function findReservationsByEvent(
    eventId: string,
    params: FindReservationsParams,
): Promise<ReservationWithUser[]> {
    const reservations = await prismaClient.reservation.findMany({
        where: { eventId },
        include: { user: { select: { id: true, name: true, email: true } } },
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
    });

    return reservations;
}

export async function countReservationsByEvent(eventId: string): Promise<number> {
    const total = await prismaClient.reservation.count({ where: { eventId } });

    return total;
}

export async function findReservationsByUser(
    userId: string,
    params: FindReservationsParams,
): Promise<ReservationWithEvent[]> {
    const reservations = await prismaClient.reservation.findMany({
        where: { userId },
        include: { event: true },
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
    });

    return reservations;
}

export async function countReservationsByUser(userId: string): Promise<number> {
    const total = await prismaClient.reservation.count({ where: { userId } });

    return total;
}
