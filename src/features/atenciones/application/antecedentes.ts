import { Prisma } from '@prisma/client';

import { employeeFullName } from '@/features/agenda/infrastructure/schedulable-doctors';
import { ReceptionError } from '@/features/reception/application/errors';
import { hasAbility, type AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

import { parseAntecedentesFamiliares, type AntecedentesFamiliares } from '../domain/antecedentes-familiares';
import { parseAntecedentesPersonales, type AntecedentesPersonales } from '../domain/antecedentes-personales';
import { attendBlocker } from './attend-appointment';

export const ANTECEDENTE_KINDS = ['personales', 'familiares'] as const;
export type AntecedenteKind = (typeof ANTECEDENTE_KINDS)[number];

type DatosByKind = { personales: AntecedentesPersonales; familiares: AntecedentesFamiliares };

export const PARSE_ANTECEDENTES: { [K in AntecedenteKind]: (value: unknown) => DatosByKind[K] } = {
  personales: parseAntecedentesPersonales,
  familiares: parseAntecedentesFamiliares,
};

export type AntecedentesDoc<T> = {
  datos: T;
  /** 0 = el docente aún no tiene estos antecedentes guardados. */
  version: number;
  actualizadoEn: string | null;
  actualizadoPor: string | null;
};
export type AntecedentesPersonalesDoc = AntecedentesDoc<AntecedentesPersonales>;
export type AntecedentesFamiliaresDoc = AntecedentesDoc<AntecedentesFamiliares>;

type Db = Prisma.TransactionClient | typeof prisma;
type StoredRecord = { datos: Prisma.JsonValue; version: number; updatedAt: Date; updatedBy: number };
const RECORD_SELECT = { datos: true, version: true, updatedAt: true, updatedBy: true } as const;

/** Ambas tablas tienen la misma forma; se accede a ellas con esta interfaz común. */
type AntecedentesTable = {
  findUnique(args: { where: { usuarioId: number }; select: typeof RECORD_SELECT }): Promise<StoredRecord | null>;
  create(args: {
    data: { usuarioId: number; datos: Prisma.InputJsonValue; citaId: number; createdBy: number; updatedBy: number };
    select: typeof RECORD_SELECT;
  }): Promise<StoredRecord>;
  update(args: {
    where: { usuarioId: number; version: number };
    data: { datos: Prisma.InputJsonValue; version: { increment: number }; citaId: number; updatedBy: number };
    select: typeof RECORD_SELECT;
  }): Promise<StoredRecord>;
};

function table(db: Db, kind: AntecedenteKind): AntecedentesTable {
  return (kind === 'personales' ? db.antecedentesPersonales : db.antecedentesFamiliares) as unknown as AntecedentesTable;
}

async function toDoc<K extends AntecedenteKind>(
  db: Db,
  kind: K,
  record: StoredRecord | null,
): Promise<AntecedentesDoc<DatosByKind[K]>> {
  const parse = PARSE_ANTECEDENTES[kind] as (value: unknown) => DatosByKind[K];
  if (!record) return { datos: parse({}), version: 0, actualizadoEn: null, actualizadoPor: null };
  const empleado = await db.empleado.findUnique({
    where: { id: record.updatedBy },
    select: { primerNombre: true, segundoNombre: true, primerApellido: true, segundoApellido: true },
  });
  return {
    datos: parse(record.datos),
    version: record.version,
    actualizadoEn: record.updatedAt.toISOString(),
    actualizadoPor: empleado ? employeeFullName(empleado) : null,
  };
}

export async function getAntecedentes<K extends AntecedenteKind>(kind: K, usuarioId: number, db: Db = prisma) {
  return toDoc(db, kind, await table(db, kind).findUnique({ where: { usuarioId }, select: RECORD_SELECT }));
}

/**
 * Los antecedentes son del docente, pero solo se modifican desde una atención en curso del médico.
 * expectedVersion evita que una atención pise los cambios guardados por otra entre tanto.
 */
export async function saveAntecedentes<K extends AntecedenteKind>(
  auth: AuthorizationContext,
  kind: K,
  citaId: number,
  expectedVersion: number,
  datos: unknown,
) {
  if (!hasAbility(auth, 'appointment.attend')) {
    throw new ReceptionError('FORBIDDEN', 'No tienes permiso clínico para atender citas.', 403);
  }
  const value = PARSE_ANTECEDENTES[kind](datos) as unknown as Prisma.InputJsonValue;

  return prisma.$transaction(async (tx) => {
    const cita = await tx.cita.findUnique({
      where: { id: citaId },
      select: { estado: true, activadaAt: true, medicoId: true, usuarioId: true },
    });
    const blocker = attendBlocker(cita, auth);
    if (blocker || !cita) throw new ReceptionError('INVALID_TRANSITION', blocker ?? 'La cita no existe.', cita ? 409 : 404);

    const records = table(tx, kind);
    const current = await records.findUnique({ where: { usuarioId: cita.usuarioId }, select: RECORD_SELECT });
    if ((current?.version ?? 0) !== expectedVersion) {
      throw new ReceptionError(
        'ANTECEDENTES_DESACTUALIZADOS',
        'Los antecedentes se actualizaron desde otra atención. Recarga la página para ver los cambios.',
        409,
      );
    }

    const saved = current
      ? await records.update({
          where: { usuarioId: cita.usuarioId, version: expectedVersion },
          data: { datos: value, version: { increment: 1 }, citaId, updatedBy: auth.empleadoId },
          select: RECORD_SELECT,
        })
      : await records.create({
          data: { usuarioId: cita.usuarioId, datos: value, citaId, createdBy: auth.empleadoId, updatedBy: auth.empleadoId },
          select: RECORD_SELECT,
        });
    return toDoc(tx, kind, saved);
  });
}
