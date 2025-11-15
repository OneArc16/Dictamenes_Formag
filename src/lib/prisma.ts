// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Cliente único para la BD "dictamy"
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

// Evitar crear múltiples instancias en dev (hot reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// (Opcional) compatibilidad con código viejo que usaba appPrisma
export { prisma as appPrisma };
