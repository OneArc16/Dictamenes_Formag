import type { Prisma } from '@prisma/client';

import { AgendaApplicationError } from './errors';
import { AGENDA_TIME_ZONE } from './slot-query';
import { prisma } from '@/lib/prisma';

type RestorableSlot = { estado: string; inicio: Date; fin: Date };
type ActiveSlot = { inicio: Date; fin: Date };

function formatHour(value: Date) {
  return new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: AGENDA_TIME_ZONE,
  }).format(value);
}

/** Motivo por el que un cupo cancelado no puede volver a quedar libre, o null si sí puede. */
export function restorationBlocker(slot: RestorableSlot, overlapping: ActiveSlot[], now: Date): string | null {
  if (slot.estado !== 'CANCELADO') return 'Solo se pueden revertir cupos cancelados.';
  if (slot.inicio <= now) return 'No se puede revertir un cupo cuya hora ya pasó.';
  // Mientras estuvo cancelado, otra generación pudo crear un cupo en el mismo horario.
  const conflict = overlapping[0];
  if (conflict) {
    return `El médico ya tiene otro cupo activo de ${formatHour(conflict.inicio)} a ${formatHour(conflict.fin)} que se cruza con este horario.`;
  }
  return null;
}

type RestoreInput = {
  cupoId: number;
  motivo: string;
  sedeId: number;
  actorEmpleadoId: number;
  actorNombre: string;
  now?: Date;
};

export async function restoreCancelledSlot(input: RestoreInput) {
  const now = input.now ?? new Date();

  return prisma.$transaction(async (tx) => {
    const slot = await tx.cupoMedico.findFirst({
      where: { id: input.cupoId, sedeId: input.sedeId },
      select: {
        id: true,
        medicoId: true,
        estado: true,
        inicio: true,
        fin: true,
        canceladoAt: true,
        canceladoBy: true,
        motivoCancelacion: true,
      },
    });
    if (!slot) throw new AgendaApplicationError('El cupo no existe o no pertenece a tu sede.', 404);

    const overlapping = await tx.cupoMedico.findMany({
      where: {
        id: { not: slot.id },
        medicoId: slot.medicoId,
        estado: { not: 'CANCELADO' },
        inicio: { lt: slot.fin },
        fin: { gt: slot.inicio },
      },
      select: { inicio: true, fin: true },
      orderBy: { inicio: 'asc' },
      take: 1,
    });
    const blocker = restorationBlocker(slot, overlapping, now);
    if (blocker) throw new AgendaApplicationError(blocker, 409);

    // Condicionado al estado leído: si otra operación lo cambió entretanto, no se pisa.
    const updated = await tx.cupoMedico.updateMany({
      where: { id: slot.id, estado: 'CANCELADO' },
      data: { estado: 'DISPONIBLE', canceladoAt: null, canceladoBy: null, motivoCancelacion: null },
    });
    if (updated.count === 0) {
      throw new AgendaApplicationError('El cupo cambió mientras se revertía. Actualiza la lista e inténtalo de nuevo.', 409);
    }

    const cancellation: Prisma.InputJsonObject = {
      canceladoAt: slot.canceladoAt?.toISOString() ?? null,
      canceladoBy: slot.canceladoBy,
      motivoCancelacion: slot.motivoCancelacion,
    };
    await tx.cupoMedicoHistorial.create({
      data: {
        cupoMedicoId: slot.id,
        tipoEvento: 'RESTAURADO',
        estadoAnterior: 'CANCELADO',
        estadoNuevo: 'DISPONIBLE',
        motivo: input.motivo,
        actorEmpleadoId: input.actorEmpleadoId,
        actorNombre: input.actorNombre,
        metadata: { cancelacionRevertida: cancellation },
      },
    });

    return { id: slot.id, inicio: slot.inicio.toISOString() };
  });
}
