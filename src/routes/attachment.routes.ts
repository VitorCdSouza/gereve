import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';
import { download as downloadAttachment } from '../controllers/attachment.controller';

export const attachmentRouter = Router();

attachmentRouter.get('/:id/download', authenticate, downloadAttachment);
