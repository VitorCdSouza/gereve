import { EventStatus } from '@prisma/client';
import { z } from 'zod';

const titleSchema = z
    .string({ error: 'Título é obrigatório' })
    .trim()
    .min(3, { error: 'Título deve ter ao menos 3 caracteres' })
    .max(120, { error: 'Título deve ter no máximo 120 caracteres' });

const descriptionSchema = z
    .string({ error: 'Descrição é obrigatória' })
    .trim()
    .min(10, { error: 'Descrição deve ter ao menos 10 caracteres' })
    .max(2000, { error: 'Descrição deve ter no máximo 2000 caracteres' });

const locationSchema = z
    .string({ error: 'Local é obrigatório' })
    .trim()
    .min(3, { error: 'Local deve ter ao menos 3 caracteres' })
    .max(200, { error: 'Local deve ter no máximo 200 caracteres' });

const capacitySchema = z
    .int({ error: 'Capacidade deve ser um número inteiro' })
    .positive({ error: 'Capacidade deve ser maior que zero' });

const startsAtSchema = z
    .string({ error: 'Data de início é obrigatória' })
    .pipe(
        z.iso.datetime({
            offset: true,
            error: 'Data de início deve estar no formato ISO 8601',
        }),
    )
    .transform((value) => new Date(value));

const endsAtSchema = z
    .string({ error: 'Data de término é obrigatória' })
    .pipe(
        z.iso.datetime({
            offset: true,
            error: 'Data de término deve estar no formato ISO 8601',
        }),
    )
    .transform((value) => new Date(value));

function endsAfterStart(event: { startsAt: Date; endsAt: Date }): boolean {
    return event.endsAt.getTime() > event.startsAt.getTime();
}

export const createEventSchema = z
    .object({
        title: titleSchema,
        description: descriptionSchema,
        location: locationSchema,
        startsAt: startsAtSchema,
        endsAt: endsAtSchema,
        capacity: capacitySchema,
    })
    .refine(endsAfterStart, {
        error: 'Data de término deve ser posterior à data de início',
        path: ['endsAt'],
    });

export type CreateEventInput = z.infer<typeof createEventSchema>;

const pageSchema = z.coerce
    .number({ error: 'Página deve ser um número' })
    .int({ error: 'Página deve ser um número inteiro' })
    .positive({ error: 'Página deve ser maior que zero' })
    .default(1);

const limitSchema = z.coerce
    .number({ error: 'Limite deve ser um número' })
    .int({ error: 'Limite deve ser um número inteiro' })
    .positive({ error: 'Limite deve ser maior que zero' })
    .max(100, { error: 'Limite deve ser no máximo 100' })
    .default(10);

const titleFilterSchema = z
    .string({ error: 'Título deve ser um texto' })
    .trim()
    .min(1, { error: 'Título não pode ser vazio' })
    .optional();

const statusFilterSchema = z
    .enum(EventStatus, { error: 'Status deve ser DRAFT, PUBLISHED ou CANCELLED' })
    .optional();

const fromSchema = z
    .string({ error: 'Data inicial deve ser um texto' })
    .pipe(
        z.iso.datetime({
            offset: true,
            error: 'Data inicial deve estar no formato ISO 8601',
        }),
    )
    .transform((value) => new Date(value))
    .optional();

const toSchema = z
    .string({ error: 'Data final deve ser um texto' })
    .pipe(
        z.iso.datetime({
            offset: true,
            error: 'Data final deve estar no formato ISO 8601',
        }),
    )
    .transform((value) => new Date(value))
    .optional();

const organizerIdFilterSchema = z.uuid({ error: 'Organizador deve ser um UUID válido' }).optional();

const sortSchema = z
    .enum(['startsAt', 'title', 'createdAt'], {
        error: 'Ordenação deve ser por startsAt, title ou createdAt',
    })
    .default('startsAt');

const orderSchema = z
    .enum(['asc', 'desc'], { error: 'Direção da ordenação deve ser asc ou desc' })
    .default('asc');

export const listEventsQuerySchema = z.object({
    page: pageSchema,
    limit: limitSchema,
    title: titleFilterSchema,
    status: statusFilterSchema,
    from: fromSchema,
    to: toSchema,
    organizerId: organizerIdFilterSchema,
    sort: sortSchema,
    order: orderSchema,
});

export type ListEventsQuery = z.infer<typeof listEventsQuerySchema>;

export const eventIdParamsSchema = z.object({
    id: z.uuid({ error: 'Identificador do evento deve ser um UUID válido' }),
});

export type EventIdParams = z.infer<typeof eventIdParamsSchema>;
