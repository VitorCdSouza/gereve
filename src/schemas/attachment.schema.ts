import { z } from 'zod';

export const attachmentIdParamsSchema = z.object({
    id: z.uuid({ error: 'Identificador do anexo deve ser um UUID válido' }),
});
