import { NextResponse } from 'next/server';

import { restoreCancelledSlot } from '@/features/agenda/application/slot-restoration';
import { restoreSlotSchema, validationMessage } from '@/features/agenda/domain/validation';
import { agendaErrorResponse, auditActor } from '@/features/agenda/presentation/http';
import { requireAgendaApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const auth = await requireAgendaApi('agenda.slots.cancel');
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  const parsed = restoreSlotSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: validationMessage(parsed.error) }, { status: 400 });
  }
  const employee = await prisma.empleado.findUnique({ where: { id: auth.auth.empleadoId }, select: { idSede: true } });
  if (!employee?.idSede) {
    return NextResponse.json({ ok: false, error: 'El usuario no tiene una sede autorizada.' }, { status: 403 });
  }

  try {
    const restored = await restoreCancelledSlot({
      cupoId: parsed.data.cupoId,
      motivo: parsed.data.motivo,
      sedeId: employee.idSede,
      actorEmpleadoId: auth.auth.empleadoId,
      actorNombre: auditActor(auth.payload),
    });
    return NextResponse.json({ ok: true, cupo: restored });
  } catch (error) {
    return agendaErrorResponse(error, 'No se pudo revertir la cancelación del cupo.');
  }
}
