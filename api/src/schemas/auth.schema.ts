import { z } from 'zod';

const nameSchema = z
    .string({ error: 'Nome é obrigatório' })
    .trim()
    .min(3, { error: 'Nome deve ter ao menos 3 caracteres' })
    .max(120, { error: 'Nome deve ter no máximo 120 caracteres' });

const emailSchema = z
    .string({ error: 'E-mail é obrigatório' })
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: 'E-mail inválido' }));

const passwordSchema = z
    .string({ error: 'Senha é obrigatória' })
    .min(8, { error: 'Senha deve ter ao menos 8 caracteres' })
    .max(72, { error: 'Senha deve ter no máximo 72 caracteres' });

export const registerUserSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
