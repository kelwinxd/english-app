import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './env.js';
import { healthRouter } from './routes/health.js';
import { chatRouter } from './routes/chat.js';
import { gameRouter } from './routes/game.js';
import { srsRouter } from './routes/srs.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({ name: 'englishapp-api', ok: true });
  });

  app.use('/health', healthRouter);
  app.use('/chat', chatRouter);
  app.use('/game', gameRouter);
  app.use('/srs', srsRouter);

  // 404
  app.use((_req, res) => {
    res.status(404).json({ status: 'error', message: 'Not Found' });
  });

  return app;
}
