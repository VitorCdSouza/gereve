import { z } from 'zod';
import { limitSchema, pageSchema } from './pagination.schema';

export const listReservationsQuerySchema = z.object({
    page: pageSchema,
    limit: limitSchema,
});

export type ListReservationsQuery = z.infer<typeof listReservationsQuerySchema>;

export const reservationIdParamsSchema = z.object({
    id: z.uuid({ error: 'Identificador da reserva deve ser um UUID válido' }),
});

export type ReservationIdParams = z.infer<typeof reservationIdParamsSchema>;
