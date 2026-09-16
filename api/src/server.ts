import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
    console.log(`api escutando na porta ${env.PORT} em modo ${env.NODE_ENV}`);
});
