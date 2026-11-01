import type { Prisma } from '@prisma/client';

import { employeeFullName } from '@/features/agenda/infrastructure/schedulable-doctors';
import { ReceptionError } from '@/features/reception/application/errors';
import type { AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

import type { CreateEvolucionCommand, Evolucion } from '../domain/evoluciones';
import { editableCita } from './editable-cita';

type Db = Prisma.TransactionClient | typeof prisma;

const HISTORY_LIMIT = 30;
const EVOLUCION_SELECT = {
  id: true,
  citaId: true,
  texto: true,
  createdAt: true,
  createdBy: true,
} satisfies Prisma.AtencionEvolucionSelect;

type EvolucionRow = Prisma.AtencionEvolucionGetPayload<{ select: typeof EVOLUCION_SELECT }>;

async function toEvoluciones(db: Db, rows: EvolucionRow[]): Promise<Evolucion[]> {
  const empleados = await db.empleado.findMany({
    where: { id: { in: [...new Set(rows.map((row) => row.createdBy))] } },
    select: { id: true, primerNombre: true, segundoNombre: true, primerApellido: true, segundoApellido: true },
  });
  return rows.map((row) => {
    const empleado = empleados.find((item) => item.id === row.createdBy);
    return {
      id: row.id,
      citaId: row.citaId,
      texto: row.texto,
      fecha: row.createdAt.toISOString(),
      medicoNombre: empleado ? employeeFullName(empleado) : null,
    };
  });
}

/** Evoluciones de la atención y las del docente en atenciones anteriores (más recientes primero). */
export async function getEvoluciones(citaId: number, usuarioId: number) {
  const [actuales, historial] = await Promise.all([
    prisma.atencionEvolucion.findMany({ where: { citaId }, orderBy: { id: 'asc' }, select: EVOLUCION_SELECT }),
    prisma.atencionEvolucion.findMany({
      where: { usuarioId, citaId: { not: citaId } },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_LIMIT,
      select: EVOLUCION_SELECT,
    }),
  ]);
  return {
    evoluciones: await toEvoluciones(prisma, actuales),
    historial: await toEvoluciones(prisma, historial),
  };
}

export async function createEvolucion(auth: AuthorizationContext, citaId: number, input: CreateEvolucionCommand) {
  return prisma.$transaction(async (tx) => {
    const cita = await editableCita(tx, auth, citaId);
    const created = await tx.atencionEvolucion.create({
      data: { citaId, usuarioId: cita.usuarioId, texto: input.texto, createdBy: auth.empleadoId },
      select: EVOLUCION_SELECT,
    });
    return (await toEvoluciones(tx, [created]))[0];
  });
}

/** Solo quien escribió la evolución puede quitarla, y solo mientras la atención está abierta. */
export async function deleteEvolucion(auth: AuthorizationContext, citaId: number, evolucionId: number) {
  return prisma.$transaction(async (tx) => {
    await editableCita(tx, auth, citaId);
    const deleted = await tx.atencionEvolucion.deleteMany({
      where: { id: evolucionId, citaId, createdBy: auth.empleadoId },
    });
    if (deleted.count === 0) throw new ReceptionError('NOT_FOUND', 'La evolución ya no existe.', 404);
    return { id: evolucionId };
  });
}
