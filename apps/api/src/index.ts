import { createApp } from './app.js';
import { env } from './env.js';

const app = createApp();

// Railway/containers injetam PORT e esperam bind em 0.0.0.0.
app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`[api] ouvindo na porta ${env.PORT} (${env.NODE_ENV})`);
});
