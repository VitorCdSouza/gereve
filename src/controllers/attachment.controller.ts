import { Request, Response } from 'express';
import { unlink } from 'node:fs/promises';
import {
    UploadedFile,
    createEventAttachment,
    getAttachmentDownload,
} from '../services/attachment.service';
import { eventIdParamsSchema } from '../schemas/event.schema';
import { attachmentIdParamsSchema } from '../schemas/attachment.schema';
import { AppError } from '../errors/AppError';

export async function upload(req: Request, res: Response): Promise<void> {
    if (req.user === undefined) {
        throw new AppError('Token de autenticação não informado', 401, 'UNAUTHORIZED');
    }

    if (req.file === undefined) {
        throw new AppError('Nenhum arquivo enviado no campo file', 400, 'FILE_REQUIRED');
    }

    const uploadedFile: UploadedFile = {
        originalName: req.file.originalname,
        storedName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
    };

    const storedFilePath = req.file.path;

    try {
        const params = eventIdParamsSchema.parse(req.params);

        const createdAttachment = await createEventAttachment(params.id, uploadedFile, req.user);

        res.status(201).json(createdAttachment);
    } catch (error: unknown) {
        await unlink(storedFilePath);
        throw error;
    }
}

export async function download(req: Request, res: Response): Promise<void> {
    const params = attachmentIdParamsSchema.parse(req.params);

    const { attachment, absolutePath } = await getAttachmentDownload(params.id);

    res.setHeader('Content-Type', attachment.mimeType);

    res.download(absolutePath, attachment.originalName);
}
