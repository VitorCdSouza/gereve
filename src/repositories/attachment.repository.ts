import { Attachment } from '@prisma/client';
import { prismaClient } from '../lib/prisma';

export type CreateAttachmentData = {
    originalName: string;
    storedName: string;
    mimeType: string;
    size: number;
    eventId: string;
    uploadedById: string;
};

export async function createAttachment(data: CreateAttachmentData): Promise<Attachment> {
    const createdAttachment = await prismaClient.attachment.create({ data });

    return createdAttachment;
}
