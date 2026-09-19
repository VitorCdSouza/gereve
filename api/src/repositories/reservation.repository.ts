import { Reservation, ReservationStatus } from '@prisma/client';
import { prismaClient } from '../lib/prisma';

export type CreateReservationData = {
    userId: string;
    eventId: string;
};

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
