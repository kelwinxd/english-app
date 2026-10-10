import { Router } from 'express';

export const healthRouter = Router();

// Usado pelo health check do Railway. Não toca no banco de propósito,
// para refletir "o processo está vivo".
healthRouter.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Checagem do banco isolada: import preguiçoso + try/catch, para a API subir
// mesmo sem Prisma gerado ou sem DATABASE_URL (Fase 0).
healthRouter.get('/db', async (_req, res) => {
  try {
    const { prisma } = await import('../lib/prisma.js');
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'up' });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      db: 'down',
      message: err instanceof Error ? err.message : String(err),
    });
  }
});
