import { NextResponse } from 'next/server';

import { cancelSlotsSchema, validationMessage } from '@/features/agenda/domain/validation';
import { auditActor } from '@/features/agenda/presentation/http';
import { requireAgendaApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const auth = await requireAgendaApi('agenda.slots.cancel');
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const parsed = cancelSlotsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: validationMessage(parsed.error) }, { status: 400 });
  }
  const employee = await prisma.empleado.findUnique({ where: { id: auth.auth.empleadoId }, select: { idSede: true } });
  if (!employee?.idSede) {
    return NextResponse.json({ ok: false, error: 'El usuario no tiene una sede autorizada.' }, { status: 403 });
  }
  const targetWhere = parsed.data.cupoIds.length > 0
    ? { id: { in: parsed.data.cupoIds }, sedeId: employee.idSede }
    : {
        medicoId: parsed.data.medicoId!,
        sedeId: employee.idSede,
        inicio: { gte: new Date(parsed.data.desde!), lt: new Date(parsed.data.hasta!) },
      };
  const targets = await prisma.cupoMedico.findMany({ where: targetWhere, select: { id: true, estado: true } });
  const availableIds = targets.filter((slot) => slot.estado === 'DISPONIBLE').map((slot) => slot.id);
  const actor = auditActor(auth.payload);
  const motivo = parsed.data.motivo;
  const result = availableIds.length > 0
    ? await prisma.$transaction(async (tx) => {
        const cancelledAt = new Date();
        const updated = await tx.cupoMedico.updateMany({
          where: { id: { in: availableIds }, estado: 'DISPONIBLE' },
          data: { estado: 'CANCELADO', canceladoAt: cancelledAt, canceladoBy: actor, motivoCancelacion: motivo },
        });
        // Solo los que esta operación canceló (otra pudo tomar alguno entre la lectura y el update).
        const cancelled = await tx.cupoMedico.findMany({
          where: { id: { in: availableIds }, estado: 'CANCELADO', canceladoAt: cancelledAt },
          select: { id: true },
        });
        await tx.cupoMedicoHistorial.createMany({
          data: cancelled.map((slot) => ({
            cupoMedicoId: slot.id,
            tipoEvento: 'CANCELADO' as const,
            estadoAnterior: 'DISPONIBLE' as const,
            estadoNuevo: 'CANCELADO' as const,
            motivo,
            actorEmpleadoId: auth.auth.empleadoId,
            actorNombre: actor,
          })),
        });
        return updated;
      })
    : { count: 0 };
  return NextResponse.json({
    ok: true,
    cancelados: result.count,
    omitidos: Math.max(0, targets.length - result.count),
    conflictos: targets.filter((slot) => slot.estado === 'RESERVADO' || slot.estado === 'ASIGNADO').length,
  });
}
