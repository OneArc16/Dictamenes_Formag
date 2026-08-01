import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

import { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';

import { ReceptionError } from './errors';

type IdempotentResult<T> = { value: T; replayed: boolean };
type OperationClaim = { ownerToken: string; lockVersion: number } | { replayed: true; value: { id: string; lockVersion: number } };
const LEASE_MS = 30_000;

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, canonicalize(item)]));
  }
  return value;
}

function idempotencyKeyMaterial() {
  const key = process.env.RECEPTION_IDEMPOTENCY_HMAC_KEY;
  if (!key || key.length < 32) throw new ReceptionError('IDEMPOTENCY_CONFIGURATION_ERROR', 'La idempotencia no está configurada de forma segura.', 503);
  return key;
}

export function canonicalPayloadMac(payload: unknown) {
  return createHmac('sha256', idempotencyKeyMaterial()).update(JSON.stringify(canonicalize(payload))).digest('hex');
}

function sameMac(left: string, right: string) {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function operationWhere(input: { actorEmpleadoId: number; operationType: string; idempotencyKey: string }) {
  return { actorEmpleadoId_operationType_idempotencyKey: input };
}

function operationInProgress() {
  return new ReceptionError('OPERATION_IN_PROGRESS', 'La operación se está procesando. Intenta nuevamente.', 409);
}

async function claimOperation(input: { actorEmpleadoId: number; operationType: string; idempotencyKey: string; mac: string }): Promise<OperationClaim> {
  const ownerToken = randomUUID();
  const now = new Date();
  const leaseUntil = new Date(now.getTime() + LEASE_MS);
  try {
    await prisma.operacionIdempotente.create({ data: { actorEmpleadoId: input.actorEmpleadoId, operationType: input.operationType, idempotencyKey: input.idempotencyKey, payloadMac: input.mac, ownerToken, leaseUntil } });
    return { ownerToken, lockVersion: 0 };
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
  }

  const existing = await prisma.operacionIdempotente.findUnique({ where: operationWhere(input) });
  if (!existing) throw operationInProgress();
  if (!sameMac(existing.payloadMac, input.mac)) throw new ReceptionError('IDEMPOTENCY_KEY_REUSED', 'La clave de idempotencia ya fue usada con otra solicitud.', 409);
  if (existing.status === 'COMPLETED' && existing.resultResourceId) {
    return { replayed: true as const, value: { id: existing.resultResourceId, lockVersion: existing.resultVersion ?? 0 } };
  }
  if (existing.status === 'FAILED') {
    throw new ReceptionError(existing.responseCode ?? 'IDEMPOTENT_OPERATION_FAILED', 'La operación anterior no pudo completarse.', existing.responseStatus ?? 409);
  }
  if (existing.leaseUntil && existing.leaseUntil > now) throw operationInProgress();

  const reclaimed = await prisma.operacionIdempotente.updateMany({
    where: { actorEmpleadoId: input.actorEmpleadoId, operationType: input.operationType, idempotencyKey: input.idempotencyKey, status: 'PROCESSING', lockVersion: existing.lockVersion, OR: [{ leaseUntil: null }, { leaseUntil: { lte: now } }] },
    data: { ownerToken, leaseUntil, lockVersion: { increment: 1 } },
  });
  if (reclaimed.count !== 1) throw operationInProgress();
  return { ownerToken, lockVersion: existing.lockVersion + 1 };
}

export async function executeIdempotent<T extends { id: string | number; lockVersion?: number }>(input: {
  actorEmpleadoId: number;
  operationType: string;
  idempotencyKey: string;
  payload: unknown;
  execute: (tx: Prisma.TransactionClient) => Promise<T>;
  replayResourceId?: (resourceId: string) => T['id'];
}): Promise<IdempotentResult<T>> {
  const mac = canonicalPayloadMac(input.payload);
  const identity = { actorEmpleadoId: input.actorEmpleadoId, operationType: input.operationType, idempotencyKey: input.idempotencyKey };
  const claim = await claimOperation({ ...identity, mac });
  if ('replayed' in claim) return { value: { id: input.replayResourceId?.(String(claim.value.id)) ?? Number(claim.value.id), lockVersion: claim.value.lockVersion } as T, replayed: true };
  try {
    const value = await prisma.$transaction(async (tx) => {
      const owned = await tx.operacionIdempotente.findFirst({ where: { ...identity, status: 'PROCESSING', ownerToken: claim.ownerToken, lockVersion: claim.lockVersion, leaseUntil: { gt: new Date() } }, select: { id: true } });
      if (!owned) throw new ReceptionError('OPERATION_OWNERSHIP_LOST', 'La operación perdió su reserva segura. Consulta el resultado antes de reintentar.', 409);
      const result = await input.execute(tx);
      const completed = await tx.operacionIdempotente.updateMany({
        where: { ...identity, status: 'PROCESSING', ownerToken: claim.ownerToken, lockVersion: claim.lockVersion, leaseUntil: { gt: new Date() } },
        data: { status: 'COMPLETED', resultResourceId: String(result.id), resultVersion: result.lockVersion ?? null, responseStatus: 200, responseCode: 'OK', completedAt: new Date(), leaseUntil: null },
      });
      if (completed.count !== 1) throw new ReceptionError('OPERATION_OWNERSHIP_LOST', 'La operación perdió su reserva segura. Consulta el resultado antes de reintentar.', 409);
      return result;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return { value, replayed: false };
  } catch (error) {
    if (error instanceof ReceptionError && error.status < 500) {
      await prisma.operacionIdempotente.updateMany({
        where: { ...identity, status: 'PROCESSING', ownerToken: claim.ownerToken, lockVersion: claim.lockVersion, leaseUntil: { gt: new Date() } },
        data: { status: 'FAILED', responseStatus: error.status, responseCode: error.code, leaseUntil: null },
      });
    }
    throw error;
  }
}
