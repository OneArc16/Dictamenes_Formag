import { Prisma } from '@prisma/client';

import { ReceptionError } from '@/features/reception/application/errors';
import { hasAbility, type AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

import { EXAMEN_CATALOG } from '../domain/examen-fisico';
import type { Hallazgos } from '../domain/hallazgos';
import { REVISION_CATALOG } from '../domain/revision-sistemas';
import { editBlocker } from './attend-blocker';

type Db = Prisma.TransactionClient | typeof prisma;

/** Cada tipo se guarda en su columna JSON de atenciones; el tipo es también el segmento de la URL. */
export const HALLAZGO_TIPOS = {
  'revision-sistemas': { column: 'revisionSistemas', catalog: REVISION_CATALOG },
  'examen-fisico': { column: 'examenFisico', catalog: EXAMEN_CATALOG },
} as const;
export type HallazgoTipo = keyof typeof HALLAZGO_TIPOS;

export type HallazgosDoc = {
  datos: Hallazgos;
  /** propia: ya se guardó en esta atención · heredada: viene de la última atención del docente · nueva: hallazgos normales. */
  origen: 'propia' | 'heredada' | 'nueva';
  /** Fecha de la atención de la que se heredó. */
  heredadaDe: string | null;
};

/** Lo de esta atención; si aún no tiene, lo último registrado del docente o, si no hay, lo normal. */
export async function resolveHallazgos(
  db: Db,
  tipo: HallazgoTipo,
  citaId: number,
  usuarioId: number,
): Promise<HallazgosDoc> {
  const { column, catalog } = HALLAZGO_TIPOS[tipo];
  const select = { [column]: true } as Record<typeof column, true>;
  const propia = (await db.atencion.findUnique({ where: { citaId }, select })) as Record<string, unknown> | null;
  if (propia?.[column] != null) return { datos: catalog.parse(propia[column]), origen: 'propia', heredadaDe: null };

  const anterior = (await db.atencion.findFirst({
    where: { citaId: { not: citaId }, cita: { usuarioId }, [column]: { not: Prisma.AnyNull } },
    orderBy: [{ cita: { inicioProgramado: 'desc' } }, { id: 'desc' }],
    select: { ...select, cita: { select: { inicioProgramado: true } } },
  })) as (Record<string, unknown> & { cita: { inicioProgramado: Date } }) | null;
  return anterior
    ? {
        datos: catalog.parse(anterior[column]),
        origen: 'heredada',
        heredadaDe: anterior.cita.inicioProgramado.toISOString(),
      }
    : { datos: catalog.defaults, origen: 'nueva', heredadaDe: null };
}

export async function saveHallazgos(auth: AuthorizationContext, tipo: HallazgoTipo, citaId: number, datos: unknown) {
  if (!hasAbility(auth, 'appointment.attend')) {
    throw new ReceptionError('FORBIDDEN', 'No tienes permiso clínico para atender citas.', 403);
  }
  const { column, catalog } = HALLAZGO_TIPOS[tipo];
  const value = catalog.parse(datos);
  return prisma.$transaction(async (tx) => {
    const cita = await tx.cita.findUnique({
      where: { id: citaId },
      select: { estado: true, activadaAt: true, medicoId: true },
    });
    const blocker = editBlocker(cita, auth);
    if (blocker || !cita)
      throw new ReceptionError('INVALID_TRANSITION', blocker ?? 'La cita no existe.', cita ? 409 : 404);
    const json = { [column]: value as unknown as Prisma.InputJsonValue };
    await tx.atencion.upsert({
      where: { citaId },
      create: { citaId, ...json, createdBy: auth.empleadoId, updatedBy: auth.empleadoId },
      update: { ...json, updatedBy: auth.empleadoId },
    });
    return { datos: value, origen: 'propia', heredadaDe: null } satisfies HallazgosDoc;
  });
}
