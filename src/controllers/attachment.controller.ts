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
import { getActor } from '../lib/actor';

export async function upload(req: Request, res: Response): Promise<void> {
    const actor = getActor(req);

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

        const createdAttachment = await createEventAttachment(params.id, uploadedFile, actor);

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
