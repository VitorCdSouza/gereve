import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import multer from 'multer';
import { AppError } from '../errors/AppError';

export const UPLOADS_DIRECTORY = resolve(__dirname, '..', '..', 'uploads');

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

mkdirSync(UPLOADS_DIRECTORY, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, UPLOADS_DIRECTORY);
    },
    filename: (req, file, callback) => {
        const fileExtension = extname(file.originalname).toLowerCase();
        const storedName = `${randomUUID()}${fileExtension}`;

        callback(null, storedName);
    },
});

function fileFilter(
    req: Express.Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback,
): void {
    const mimeTypeIsAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype);

    if (!mimeTypeIsAllowed) {
        const allowedList = ALLOWED_MIME_TYPES.join(', ');

        callback(
            new AppError(
                `Tipo de arquivo não permitido. Tipos aceitos: ${allowedList}`,
                400,
                'INVALID_FILE_TYPE',
            ),
        );
        return;
    }

    callback(null, true);
}

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
});
