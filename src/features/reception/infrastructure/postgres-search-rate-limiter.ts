import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

import { ReceptionError } from '../application/errors';

type CounterRow = { count: number };

function windowStart(now: Date, milliseconds: number) {
  return new Date(Math.floor(now.getTime() / milliseconds) * milliseconds);
}

async function consume(db: Pick<typeof prisma, '$queryRaw'>, scopeId: string, windowType: string, start: Date, limit: number) {
  const rows = await db.$queryRaw<CounterRow[]>(Prisma.sql`
    INSERT INTO "reception_search_rate_limits" ("scopeType", "scopeId", "windowType", "windowStart", "count", "updatedAt")
    VALUES ('ACTOR', ${scopeId}, ${windowType}, ${start}, 1, CURRENT_TIMESTAMP)
    ON CONFLICT ("scopeType", "scopeId", "windowType", "windowStart")
    DO UPDATE SET "count" = "reception_search_rate_limits"."count" + 1, "updatedAt" = CURRENT_TIMESTAMP
    WHERE "reception_search_rate_limits"."count" < ${limit}
    RETURNING "count"
  `);
  return rows[0]?.count ?? null;
}

export async function consumePatientSearchQuota(actorEmpleadoId: number, now = new Date()) {
  const oneMinute = windowStart(now, 60_000);
  const fiveMinutes = windowStart(now, 300_000);
  try {
    await prisma.$transaction(async (tx) => {
      const minute = await consume(tx, String(actorEmpleadoId), 'ONE_MINUTE', oneMinute, 30);
      if (minute === null) throw new ReceptionError('RATE_LIMITED', 'Has alcanzado el límite de búsquedas. Intenta de nuevo en un momento.', 429);
      const five = await consume(tx, String(actorEmpleadoId), 'FIVE_MINUTES', fiveMinutes, 120);
      if (five === null) throw new ReceptionError('RATE_LIMITED', 'Has alcanzado el límite de búsquedas. Intenta de nuevo en un momento.', 429);
    }, { isolationLevel: 'Serializable' });
  } catch (error) {
    if (error instanceof ReceptionError) throw error;
    throw new ReceptionError('RATE_LIMIT_UNAVAILABLE', 'No fue posible verificar el límite de búsquedas.', 503);
  }
}
