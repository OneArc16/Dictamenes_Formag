import { Prisma } from '@prisma/client';

import { employeeFullName } from '@/features/agenda/infrastructure/schedulable-doctors';
import { ReceptionError } from '@/features/reception/application/errors';
import { hasAbility, type AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

import type { CreateRemisionCommand, Remision, RemisionAtajo } from '../domain/remisiones';
import { attendBlocker } from './attend-blocker';

type Db = Prisma.TransactionClient | typeof prisma;

const HISTORY_LIMIT = 30;
const dx = { select: { codigo: true, nombre: true } } as const;
const REMISION_SELECT = {
  id: true,
  citaId: true,
  motivo: true,
  createdAt: true,
  createdBy: true,
  cups: { select: { codigo: true, nombre: true } },
  diagnostico: dx,
  relacionado2: dx,
  relacionado3: dx,
} satisfies Prisma.AtencionRemisionSelect;

type RemisionRow = Prisma.AtencionRemisionGetPayload<{ select: typeof REMISION_SELECT }>;

async function toRemisiones(db: Db, rows: RemisionRow[]): Promise<Remision[]> {
  const empleados = await db.empleado.findMany({
    where: { id: { in: [...new Set(rows.map((row) => row.createdBy))] } },
    select: { id: true, primerNombre: true, segundoNombre: true, primerApellido: true, segundoApellido: true },
  });
  return rows.map((row) => {
    const empleado = empleados.find((item) => item.id === row.createdBy);
    return {
      id: row.id,
      citaId: row.citaId,
      cups: row.cups,
      diagnosticos: [row.diagnostico, row.relacionado2, row.relacionado3].filter(
        (item): item is { codigo: string; nombre: string } => item !== null,
      ),
      motivo: row.motivo,
      fecha: row.createdAt.toISOString(),
      medicoNombre: empleado ? employeeFullName(empleado) : null,
    };
  });
}

/** Remisiones de la atención, historial del docente en otras atenciones y atajos configurados. */
export async function getRemisiones(citaId: number, usuarioId: number) {
  const [actuales, historial, atajos] = await Promise.all([
    prisma.atencionRemision.findMany({ where: { citaId }, orderBy: { id: 'asc' }, select: REMISION_SELECT }),
    prisma.atencionRemision.findMany({
      where: { usuarioId, citaId: { not: citaId } },
      orderBy: { createdAt: 'desc' },
      take: HISTORY_LIMIT,
      select: REMISION_SELECT,
    }),
    prisma.remisionAtajo.findMany({
      where: { activo: true, cups: { estado: true } },
      orderBy: [{ orden: 'asc' }, { etiqueta: 'asc' }],
      select: { cupsCodigo: true, etiqueta: true, cups: { select: { nombre: true } } },
    }),
  ]);
  return {
    remisiones: await toRemisiones(prisma, actuales),
    historial: await toRemisiones(prisma, historial),
    atajos: atajos.map((atajo): RemisionAtajo => ({
      cupsCodigo: atajo.cupsCodigo,
      etiqueta: atajo.etiqueta,
      cupsNombre: atajo.cups.nombre,
    })),
  };
}

async function editableCita(tx: Prisma.TransactionClient, auth: AuthorizationContext, citaId: number) {
  if (!hasAbility(auth, 'appointment.attend')) {
    throw new ReceptionError('FORBIDDEN', 'No tienes permiso clínico para atender citas.', 403);
  }
  const cita = await tx.cita.findUnique({
    where: { id: citaId },
    select: { estado: true, activadaAt: true, medicoId: true, usuarioId: true },
  });
  const blocker = attendBlocker(cita, auth);
  if (blocker || !cita)
    throw new ReceptionError('INVALID_TRANSITION', blocker ?? 'La cita no existe.', cita ? 409 : 404);
  return cita;
}

export async function createRemision(auth: AuthorizationContext, citaId: number, input: CreateRemisionCommand) {
  return prisma.$transaction(async (tx) => {
    const cita = await editableCita(tx, auth, citaId);
    const cups = await tx.cups.findFirst({
      where: { codigo: input.cupsCodigo, estado: true },
      select: { codigo: true },
    });
    if (!cups)
      throw new ReceptionError('CUPS_INVALID', `El servicio CUPS ${input.cupsCodigo} no existe o está inactivo.`, 422);
    const diagnosticos = [input.diagnosticoCodigo, input.relacionado2Codigo, input.relacionado3Codigo].filter(
      (value): value is string => Boolean(value),
    );
    const vigentes = await tx.cie10.count({ where: { codigo: { in: diagnosticos }, estado: true } });
    if (vigentes !== diagnosticos.length)
      throw new ReceptionError('CIE10_INVALID', 'Algún diagnóstico no existe o está inactivo.', 422);

    try {
      const created = await tx.atencionRemision.create({
        data: {
          citaId,
          usuarioId: cita.usuarioId,
          cupsCodigo: input.cupsCodigo,
          diagnosticoCodigo: input.diagnosticoCodigo,
          relacionado2Codigo: input.relacionado2Codigo ?? null,
          relacionado3Codigo: input.relacionado3Codigo ?? null,
          motivo: input.motivo || null,
          createdBy: auth.empleadoId,
        },
        select: REMISION_SELECT,
      });
      return (await toRemisiones(tx, [created]))[0];
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ReceptionError('REMISION_DUPLICADA', 'Este servicio ya está remitido en la atención.', 409);
      }
      throw error;
    }
  });
}

export async function deleteRemision(auth: AuthorizationContext, citaId: number, remisionId: number) {
  return prisma.$transaction(async (tx) => {
    await editableCita(tx, auth, citaId);
    const deleted = await tx.atencionRemision.deleteMany({ where: { id: remisionId, citaId } });
    if (deleted.count === 0) throw new ReceptionError('NOT_FOUND', 'La remisión ya no existe.', 404);
    return { id: remisionId };
  });
}
