import { z } from 'zod';
import { limitSchema, pageSchema } from './pagination.schema';

export const listReservationsQuerySchema = z.object({
    page: pageSchema,
    limit: limitSchema,
});

export type ListReservationsQuery = z.infer<typeof listReservationsQuerySchema>;
