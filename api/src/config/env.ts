import 'dotenv/config';
import { z } from 'zod';

function corsStringToArray(rawOrigins: string): string[] {
    const separatedOrigins = rawOrigins.split(',');
    const trimmedOrigins = separatedOrigins.map((origin) => origin.trim());
    const filledOrigins = trimmedOrigins.filter((origin) => origin.length > 0);

    return filledOrigins;
}

const originSchema = z.url({
    protocol: /^https?$/,
    error: 'cada origem deve ser uma URL http ou https',
});

const originListSchema = z
    .string()
    .transform(corsStringToArray)
    .pipe(originSchema.array().nonempty({ error: 'deve conter ao menos uma origem' }));

const environmentSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().max(65535).default(3333),
    DATABASE_URL: z.url({
        protocol: /^postgres(ql)?$/,
        error: 'deve ser uma URL de conexão PostgreSQL válida',
    }),
    CORS_ORIGINS: originListSchema,
});

export type Environment = z.infer<typeof environmentSchema>;

function loadEnvironment(): Environment {
    const parsedEnvironment = environmentSchema.safeParse(process.env);

    if (!parsedEnvironment.success) {
        const messages = parsedEnvironment.error.issues.map((issue) => {
            const variableName = issue.path.join('.');
            return `  - ${variableName}: ${issue.message}`;
        });

        console.error('variáveis de ambiente inválidas:');
        console.error(messages.join('\n'));
        process.exit(1);
    }

    return parsedEnvironment.data;
}

export const env = loadEnvironment();
