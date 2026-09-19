import { z } from 'zod';

export const pageSchema = z.coerce
    .number({ error: 'Página deve ser um número' })
    .int({ error: 'Página deve ser um número inteiro' })
    .positive({ error: 'Página deve ser maior que zero' })
    .default(1);

export const limitSchema = z.coerce
    .number({ error: 'Limite deve ser um número' })
    .int({ error: 'Limite deve ser um número inteiro' })
    .positive({ error: 'Limite deve ser maior que zero' })
    .max(100, { error: 'Limite deve ser no máximo 100' })
    .default(10);
