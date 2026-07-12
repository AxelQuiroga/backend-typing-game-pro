import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from './env';

// ═══════════════════════════════════════════════════════════
// Prisma Client — Singleton (with Driver Adapter)
//
// Prisma 7 requires a driver adapter (PrismaPg for PostgreSQL).
// We export a single instance to avoid connection exhaustion.
// In dev, attach to `globalThis` to survive hot-reloads.
// ═══════════════════════════════════════════════════════════

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: config.databaseUrl });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (config.nodeEnv !== 'production') {
  globalForPrisma.prisma = prisma;
}
