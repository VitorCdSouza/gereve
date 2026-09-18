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
