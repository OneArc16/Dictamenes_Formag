import { createHash } from 'node:crypto';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

import { ReceptionError } from './errors';

type IdempotentResult<T> = { value: T; replayed: boolean };

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

function payloadHash(payload: unknown) {
  return createHash('sha256').update(JSON.stringify(canonicalize(payload))).digest('hex');
}

export async function executeIdempotent<T extends { id: number; lockVersion?: number }>(input: {
  actorEmpleadoId: number;
  operationType: string;
  idempotencyKey: string;
  payload: unknown;
  execute: () => Promise<T>;
}): Promise<IdempotentResult<T>> {
  const hash = payloadHash(input.payload);
  let created = false;
  try {
    await prisma.operacionIdempotente.create({ data: { actorEmpleadoId: input.actorEmpleadoId, operationType: input.operationType, idempotencyKey: input.idempotencyKey, payloadHash: hash } });
    created = true;
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
  }
  if (!created) {
    const prior = await prisma.operacionIdempotente.findUnique({ where: { actorEmpleadoId_operationType_idempotencyKey: { actorEmpleadoId: input.actorEmpleadoId, operationType: input.operationType, idempotencyKey: input.idempotencyKey } } });
    if (!prior) throw new ReceptionError('OPERATION_IN_PROGRESS', 'La operación se está procesando. Intenta nuevamente.', 409);
    if (prior.payloadHash !== hash) throw new ReceptionError('IDEMPOTENCY_KEY_REUSED', 'La clave de idempotencia ya fue usada con otra solicitud.', 409);
    if (prior.status === 'COMPLETED' && prior.resultResourceId) {
      return { value: { id: Number(prior.resultResourceId), lockVersion: prior.resultVersion ?? 0 } as T, replayed: true };
    }
    throw new ReceptionError('OPERATION_IN_PROGRESS', 'La operación se está procesando. Intenta nuevamente.', 409);
  }
  try {
    const value = await input.execute();
    await prisma.operacionIdempotente.update({ where: { actorEmpleadoId_operationType_idempotencyKey: { actorEmpleadoId: input.actorEmpleadoId, operationType: input.operationType, idempotencyKey: input.idempotencyKey } }, data: { status: 'COMPLETED', resultResourceId: String(value.id), resultVersion: value.lockVersion ?? null, responseStatus: 200, responseCode: 'OK', completedAt: new Date() } });
    return { value, replayed: false };
  } catch (error) {
    if (error instanceof ReceptionError && error.status < 500) {
      await prisma.operacionIdempotente.updateMany({ where: { actorEmpleadoId: input.actorEmpleadoId, operationType: input.operationType, idempotencyKey: input.idempotencyKey, status: 'PROCESSING' }, data: { status: 'FAILED', responseStatus: error.status, responseCode: error.code } });
    }
    throw error;
  }
}
