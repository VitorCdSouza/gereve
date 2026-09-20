import { Actor } from './actor';

declare global {
    namespace Express {
        interface Request {
            user?: Actor;
        }
    }
}
