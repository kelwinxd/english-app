import { PrismaClient } from '@prisma/client';

// Singleton. Importado de forma preguiçosa (dynamic import) pelas rotas que
// tocam o banco, para a API subir mesmo antes de `prisma generate` / DATABASE_URL.
export const prisma = new PrismaClient();
