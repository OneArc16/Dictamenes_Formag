import type { Prisma } from '@prisma/client';

import { ReceptionError } from '@/features/reception/application/errors';
import { hasAbility, type AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

import type { DiagnosticoAtencion, TipoDiagnostico } from '../domain/diagnosticos';
import { attendBlocker } from './attend-blocker';

type Db = Prisma.TransactionClient | typeof prisma;

export async function getDiagnosticos(citaId: number, db: Db = prisma): Promise<DiagnosticoAtencion[]> {
  const rows = await db.atencionDiagnostico.findMany({
    where: { citaId },
    orderBy: { orden: 'asc' },
    select: { cie10Codigo: true, tipo: true, cie10: { select: { nombre: true } } },
  });
  return rows.map((row) => ({
    cie10Codigo: row.cie10Codigo,
    cie10Label: `${row.cie10Codigo} - ${row.cie10.nombre}`,
    tipo: row.tipo,
  }));
}

/** Reemplaza los diagnósticos de la atención en curso por la lista recibida (el orden define el principal). */
export async function saveDiagnosticos(
  auth: AuthorizationContext,
  citaId: number,
  diagnosticos: Array<{ cie10Codigo: string; tipo: TipoDiagnostico }>,
) {
  if (!hasAbility(auth, 'appointment.attend')) {
    throw new ReceptionError('FORBIDDEN', 'No tienes permiso clínico para atender citas.', 403);
  }
  return prisma.$transaction(async (tx) => {
    const cita = await tx.cita.findUnique({
      where: { id: citaId },
      select: { estado: true, activadaAt: true, medicoId: true },
    });
    const blocker = attendBlocker(cita, auth);
    if (blocker || !cita)
      throw new ReceptionError('INVALID_TRANSITION', blocker ?? 'La cita no existe.', cita ? 409 : 404);

    const codigos = diagnosticos.map((dx) => dx.cie10Codigo.toUpperCase());
    const vigentes = await tx.cie10.findMany({
      where: { codigo: { in: codigos }, estado: true },
      select: { codigo: true },
    });
    const invalido = codigos.find((codigo) => !vigentes.some((item) => item.codigo === codigo));
    if (invalido)
      throw new ReceptionError('CIE10_INVALID', `El código CIE10 ${invalido} no existe o está inactivo.`, 422);

    await tx.atencionDiagnostico.deleteMany({ where: { citaId } });
    if (codigos.length > 0) {
      await tx.atencionDiagnostico.createMany({
        data: diagnosticos.map((dx, index) => ({
          citaId,
          orden: index + 1,
          cie10Codigo: codigos[index],
          tipo: dx.tipo,
          createdBy: auth.empleadoId,
        })),
      });
    }
    return getDiagnosticos(citaId, tx);
  });
}
