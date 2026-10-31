import { Prisma } from '@prisma/client';

import { ReceptionError } from '@/features/reception/application/errors';
import { hasAbility, type AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

import { DEFAULT_REVISION_SISTEMAS, parseRevisionSistemas, type RevisionSistemas } from '../domain/revision-sistemas';
import { attendBlocker } from './attend-blocker';

type Db = Prisma.TransactionClient | typeof prisma;

export type RevisionSistemasDoc = {
  datos: RevisionSistemas;
  /** propia: ya se guardó en esta atención · heredada: viene de la última atención del docente · nueva: hallazgos normales. */
  origen: 'propia' | 'heredada' | 'nueva';
  /** Fecha de la atención de la que se heredó. */
  heredadaDe: string | null;
};

/** La revisión de la atención; si aún no tiene, la última registrada del docente o, si no hay, la normal. */
export async function resolveRevisionSistemas(db: Db, citaId: number, usuarioId: number): Promise<RevisionSistemasDoc> {
  const propia = await db.atencion.findUnique({ where: { citaId }, select: { revisionSistemas: true } });
  if (propia?.revisionSistemas != null) {
    return { datos: parseRevisionSistemas(propia.revisionSistemas), origen: 'propia', heredadaDe: null };
  }
  const anterior = await db.atencion.findFirst({
    where: { citaId: { not: citaId }, cita: { usuarioId }, revisionSistemas: { not: Prisma.AnyNull } },
    orderBy: [{ cita: { inicioProgramado: 'desc' } }, { id: 'desc' }],
    select: { revisionSistemas: true, cita: { select: { inicioProgramado: true } } },
  });
  return anterior
    ? {
        datos: parseRevisionSistemas(anterior.revisionSistemas),
        origen: 'heredada',
        heredadaDe: anterior.cita.inicioProgramado.toISOString(),
      }
    : { datos: DEFAULT_REVISION_SISTEMAS, origen: 'nueva', heredadaDe: null };
}

export async function saveRevisionSistemas(auth: AuthorizationContext, citaId: number, datos: unknown) {
  if (!hasAbility(auth, 'appointment.attend')) {
    throw new ReceptionError('FORBIDDEN', 'No tienes permiso clínico para atender citas.', 403);
  }
  const value = parseRevisionSistemas(datos);
  return prisma.$transaction(async (tx) => {
    const cita = await tx.cita.findUnique({
      where: { id: citaId },
      select: { estado: true, activadaAt: true, medicoId: true },
    });
    const blocker = attendBlocker(cita, auth);
    if (blocker || !cita)
      throw new ReceptionError('INVALID_TRANSITION', blocker ?? 'La cita no existe.', cita ? 409 : 404);
    const json = value as unknown as Prisma.InputJsonValue;
    await tx.atencion.upsert({
      where: { citaId },
      create: { citaId, revisionSistemas: json, createdBy: auth.empleadoId, updatedBy: auth.empleadoId },
      update: { revisionSistemas: json, updatedBy: auth.empleadoId },
    });
    return { datos: value, origen: 'propia', heredadaDe: null } satisfies RevisionSistemasDoc;
  });
}
