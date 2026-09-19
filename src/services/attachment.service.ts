import { Attachment } from '@prisma/client';
import { createAttachment as createAttachmentRecord } from '../repositories/attachment.repository';
import { EventActor, assertActorCanManageEvent, getEvent } from './event.service';

export type UploadedFile = {
    originalName: string;
    storedName: string;
    mimeType: string;
    size: number;
};

export async function createEventAttachment(
    eventId: string,
    file: UploadedFile,
    actor: EventActor,
): Promise<Attachment> {
    const event = await getEvent(eventId);

    assertActorCanManageEvent(event, actor);

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
