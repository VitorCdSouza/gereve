import { Attachment } from '@prisma/client';
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import {
    createAttachment as createAttachmentRecord,
    findAttachmentById,
} from '../repositories/attachment.repository';
import { assertCanManageEvent, getEvent } from './event.service';
import { UPLOADS_DIRECTORY } from '../config/upload';
import { AppError } from '../errors/AppError';
import { Actor } from '../types/actor';

export type UploadedFile = {
    originalName: string;
    storedName: string;
    mimeType: string;
    size: number;
};

export async function createEventAttachment(
    eventId: string,
    file: UploadedFile,
    actor: Actor,
): Promise<Attachment> {
    const event = await getEvent(eventId);

    assertCanManageEvent(event, actor);

    const createdAttachment = await createAttachmentRecord({
        originalName: file.originalName,
        storedName: file.storedName,
        mimeType: file.mimeType,
        size: file.size,
        eventId: event.id,
        uploadedById: actor.id,
    });

    return createdAttachment;
}

export type AttachmentDownload = {
    attachment: Attachment;
    absolutePath: string;
};

async function fileExists(absolutePath: string): Promise<boolean> {
    try {
        await access(absolutePath);
        return true;
    } catch {
        return false;
    }
}

export async function getAttachmentDownload(id: string): Promise<AttachmentDownload> {
    const attachment = await findAttachmentById(id);

    if (attachment === null) {
        throw new AppError('Anexo não encontrado', 404, 'ATTACHMENT_NOT_FOUND');
    }

    const absolutePath = join(UPLOADS_DIRECTORY, attachment.storedName);

    const storedFileExists = await fileExists(absolutePath);

    if (!storedFileExists) {
        throw new AppError('Arquivo do anexo não encontrado', 404, 'ATTACHMENT_FILE_NOT_FOUND');
    }

    return { attachment, absolutePath };
}
