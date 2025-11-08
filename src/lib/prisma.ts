import { PrismaClient as AppPrismaClient } from '../../prisma/generated/app';
import { PrismaClient as DnaPrismaClient } from '../../prisma/generated/dna';

const globalForPrisma = globalThis as unknown as {
  appPrisma?: AppPrismaClient;
  dnaPrisma?: DnaPrismaClient;
};

export const appPrisma =
  globalForPrisma.appPrisma ?? new AppPrismaClient();

export const dnaPrisma =
  globalForPrisma.dnaPrisma ?? new DnaPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.appPrisma = appPrisma;
  globalForPrisma.dnaPrisma = dnaPrisma;
}
