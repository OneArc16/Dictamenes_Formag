import type { ResultadoAuditoriaRecepcion } from '@prisma/client';

import { prisma } from '@/lib/prisma';

type ReceptionAuditEvent = {
  requestId: string;
  actorEmpleadoId: number;
  action: string;
  result: ResultadoAuditoriaRecepcion;
  resourceType: string;
  resourceId?: string | number | null;
  sedeId?: number | null;
  reasonCode?: string | null;
  httpStatus?: number | null;
  metadata?: Record<string, string | number | boolean | null>;
};

/** Audit payloads deliberately accept only identifiers and non-sensitive facts. */
export async function auditReception(event: ReceptionAuditEvent) {
  await prisma.auditoriaRecepcion.create({
    data: {
      requestId: event.requestId,
      actorEmpleadoId: event.actorEmpleadoId,
      action: event.action,
      result: event.result,
      resourceType: event.resourceType,
      resourceId: event.resourceId == null ? null : String(event.resourceId),
      sedeId: event.sedeId ?? null,
      reasonCode: event.reasonCode ?? null,
      httpStatus: event.httpStatus ?? null,
      metadata: event.metadata,
    },
  });
}
