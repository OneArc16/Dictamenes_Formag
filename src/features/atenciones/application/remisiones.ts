import { Prisma, type TipoDictamen } from '@prisma/client';

import { employeeFullName } from '@/features/agenda/infrastructure/schedulable-doctors';
import { ReceptionError } from '@/features/reception/application/errors';
import { hasAbility, type AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

import { ApplicationError } from '@/features/formulario-origen/application/errors';
import { abrirCasoDictamen } from '@/features/formulario-origen/application/registrar-caso-dictamen';

import {
  diagnosticosCasoJunta,
  esJuntaMedica,
  type CreateRemisionCommand,
  type Remision,
  type RemisionAtajo,
  type RemisionCreada,
} from '../domain/remisiones';
import { editableCita } from './editable-cita';

type Db = Prisma.TransactionClient | typeof prisma;

const HISTORY_LIMIT = 30;
const dx = { select: { codigo: true, nombre: true } } as const;
const REMISION_SELECT = {
  id: true,
  citaId: true,
  motivo: true,
  tipoDictamen: true,
  dictamen: { select: { id: true } },
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
      tipoDictamen: row.tipoDictamen,
      dictamenId: row.dictamen?.id ?? null,
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

/** Motivo por el que la junta no puede abrir el caso en Dictamen, o null si puede. */
export function aperturaCasoBloqueada(auth: AuthorizationContext) {
  return hasAbility(auth, 'dictamen.create')
    ? null
    : 'No tienes permiso para abrir casos en Dictamen; la remisión se guardó sin abrir el caso.';
}

type JuntaRemision = { id: number; tipoDictamen: TipoDictamen; codigos: Array<string | null | undefined> };

/** Opens the Dictamen case of one junta remission; returns a warning instead when it cannot. */
async function abrirCasoJunta(
  tx: Prisma.TransactionClient,
  auth: AuthorizationContext,
  citaId: number,
  usuarioId: number,
  remision: JuntaRemision,
): Promise<{ dictamenId: number | null; aviso: string | null }> {
  const bloqueo = aperturaCasoBloqueada(auth);
  if (bloqueo) return { dictamenId: null, aviso: bloqueo };
  const [docente, diagnosticosAtencion] = await Promise.all([
    tx.usuario.findUniqueOrThrow({ where: { id: usuarioId }, select: { identificacion: true } }),
    tx.atencionDiagnostico.findMany({ where: { citaId }, select: { cie10Codigo: true, tipo: true } }),
  ]);
  try {
    const caso = await abrirCasoDictamen(tx, {
      usuarioId,
      identificacion: docente.identificacion,
      empleadoId: auth.empleadoId,
      tipoDictamen: remision.tipoDictamen,
      // La recalificación arranca directo en PCL; la primera vez, en el formulario de origen.
      documentoInicial: remision.tipoDictamen === 'RECALIFICACION' ? 'PCL' : 'ORIGEN',
      remisionId: remision.id,
      diagnosticos: diagnosticosCasoJunta(remision.codigos, diagnosticosAtencion),
    });
    return { dictamenId: caso.dictamenId, aviso: null };
  } catch (error) {
    if (!(error instanceof ApplicationError)) throw error;
    if (error.code !== 'ACTIVE_CASE_EXISTS') throw new ReceptionError(error.code, error.message, error.status);
    return { dictamenId: null, aviso: `${error.message} No se abrió un caso nuevo en Dictamen.` };
  }
}

export type CasoJuntaAbierto = { remisionId: number; dictamenId: number; tipoDictamen: TipoDictamen };

/** On "Finalizar atención": opens the Dictamen case of every junta remission still without one. */
export async function abrirCasosJuntaPendientes(
  tx: Prisma.TransactionClient,
  auth: AuthorizationContext,
  citaId: number,
  usuarioId: number,
): Promise<{ casos: CasoJuntaAbierto[]; avisos: string[] }> {
  const pendientes = await tx.atencionRemision.findMany({
    where: { citaId, tipoDictamen: { not: null }, dictamen: null },
    orderBy: { id: 'asc' },
    select: { id: true, cupsCodigo: true, tipoDictamen: true, diagnosticoCodigo: true, relacionado2Codigo: true, relacionado3Codigo: true },
  });
  const casos: CasoJuntaAbierto[] = [];
  const avisos: string[] = [];
  for (const remision of pendientes) {
    if (!remision.tipoDictamen || !esJuntaMedica(remision.cupsCodigo)) continue;
    const apertura = await abrirCasoJunta(tx, auth, citaId, usuarioId, {
      id: remision.id,
      tipoDictamen: remision.tipoDictamen,
      codigos: [remision.diagnosticoCodigo, remision.relacionado2Codigo, remision.relacionado3Codigo],
    });
    if (apertura.dictamenId) casos.push({ remisionId: remision.id, dictamenId: apertura.dictamenId, tipoDictamen: remision.tipoDictamen });
    if (apertura.aviso) avisos.push(apertura.aviso);
  }
  return { casos, avisos };
}

export async function createRemision(
  auth: AuthorizationContext,
  citaId: number,
  input: CreateRemisionCommand,
): Promise<RemisionCreada> {
  const junta = esJuntaMedica(input.cupsCodigo);
  return prisma.$transaction(
    async (tx) => {
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

      let created;
      try {
        created = await tx.atencionRemision.create({
          data: {
            citaId,
            usuarioId: cita.usuarioId,
            cupsCodigo: input.cupsCodigo,
            diagnosticoCodigo: input.diagnosticoCodigo,
            relacionado2Codigo: input.relacionado2Codigo ?? null,
            relacionado3Codigo: input.relacionado3Codigo ?? null,
            motivo: input.motivo || null,
            tipoDictamen: input.tipoDictamen ?? null,
            createdBy: auth.empleadoId,
          },
          select: REMISION_SELECT,
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new ReceptionError('REMISION_DUPLICADA', 'Este servicio ya está remitido en la atención.', 409);
        }
        throw error;
      }

      let aviso: string | null = null;
      // While the attention is open the junta case waits for "Finalizar atención", so a mistaken
      // remission can still be removed. Once finalized, a late junta opens its case right away.
      if (junta && input.tipoDictamen && cita.estado === 'ATENDIDA') {
        const apertura = await abrirCasoJunta(tx, auth, citaId, cita.usuarioId, {
          id: created.id,
          tipoDictamen: input.tipoDictamen,
          codigos: diagnosticos,
        });
        aviso = apertura.aviso;
        if (apertura.dictamenId) created = { ...created, dictamen: { id: apertura.dictamenId } };
      }

      return { ...(await toRemisiones(tx, [created]))[0], aviso };
    },
    // Serializable evita abrir dos casos activos para el mismo docente al mismo tiempo.
    junta ? { isolationLevel: Prisma.TransactionIsolationLevel.Serializable } : undefined,
  );
}

export async function deleteRemision(auth: AuthorizationContext, citaId: number, remisionId: number) {
  return prisma.$transaction(async (tx) => {
    await editableCita(tx, auth, citaId);
    const caso = await tx.dictamen.findUnique({ where: { remisionId }, select: { id: true } });
    if (caso) {
      throw new ReceptionError(
        'REMISION_CON_DICTAMEN',
        `Esta remisión abrió el caso #${caso.id} en Dictamen; gestiónalo desde el panel de Dictamen.`,
        409,
      );
    }
    const deleted = await tx.atencionRemision.deleteMany({ where: { id: remisionId, citaId } });
    if (deleted.count === 0) throw new ReceptionError('NOT_FOUND', 'La remisión ya no existe.', 404);
    return { id: remisionId };
  });
}
