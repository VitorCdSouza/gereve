import { Reservation } from '@prisma/client';
import {
    countConfirmedReservationsByEvent,
    createReservation as createReservationRecord,
} from '../repositories/reservation.repository';
import { getEvent } from './event.service';
import { AppError } from '../errors/AppError';

export async function createReservation(eventId: string, userId: string): Promise<Reservation> {
    const event = await getEvent(eventId);

    const confirmedReservations = await countConfirmedReservationsByEvent(event.id);

    if (confirmedReservations >= event.capacity) {
        throw new AppError('Evento sem vagas disponíveis', 409, 'EVENT_CAPACITY_REACHED');
    }

    const createdReservation = await createReservationRecord({ eventId: event.id, userId });

    return createdReservation;
}
