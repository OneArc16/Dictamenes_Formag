import type { AuthorizationContext } from '@/lib/auth/authorization';
import { hasCaseScope } from '@/lib/auth/case-scope';
import {
  buildDictamenHistorySnapshot,
  resolveDictamenEstadoHistorial,
} from '@/lib/dictamen/historial';
import { prisma } from '@/lib/prisma';
import { getReopeningTargets } from '../domain/reopening';
import { ApplicationError } from './errors';

async function loadCase(dictamenId: number) {
  return prisma.dictamen.findUnique({
    where: { id: dictamenId },
    include: {
      formularioOrigen: true,
    },
  });
}

function assertScope(
  record: NonNullable<Awaited<ReturnType<typeof loadCase>>>,
  auth: AuthorizationContext,
) {
  if (!hasCaseScope(auth, record.empleadoId)) {
    throw new ApplicationError('FORBIDDEN', 'No tiene acceso a este expediente.', 403);
  }
}

export async function getReopeningOptions(
  dictamenId: number,
  auth: AuthorizationContext,
) {
  const record = await loadCase(dictamenId);
  if (!record) throw new ApplicationError('CASE_NOT_FOUND', 'Expediente no encontrado.', 404);
  assertScope(record, auth);

  const targets = getReopeningTargets({
    flujoVersion: record.flujoVersion,
    originState: record.formularioOrigen?.estado ?? null,
    pclClosed: !record.estado,
    canReopenOrigin: auth.permissions.includes('formulario_origen.reopen'),
    canReopenPcl: auth.permissions.includes('dictamen.reopen'),
  });

  const motives = await prisma.motivoReapertura.findMany({
    where: {
      estado: true,
      alcances: {
        some: {
          alcance: {
            in: targets.map((target) => (target === 'ORIGEN' ? 'ORIGEN' : 'PCL')),
          },
        },
      },
    },
    orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      exigeObservacion: true,
      alcances: { select: { alcance: true } },
    },
  });

  return {
    targets,
    versions: {
      ORIGEN: record.formularioOrigen?.lockVersion ?? null,
      PCL: record.lockVersion,
    },
    motives: motives.map((motive) => ({
      id: motive.id,
      nombre: motive.nombre,
      descripcion: motive.descripcion,
      exigeObservacion: motive.exigeObservacion,
      targets: motive.alcances
        .map((scope) => scope.alcance)
        .filter((scope) => scope === 'ORIGEN' || scope === 'PCL'),
    })),
  };
}

export async function reopenDocument(
  dictamenId: number,
  auth: AuthorizationContext,
  input: {
    objetivo: 'ORIGEN' | 'PCL';
    motivoId: number;
    observacion?: string | null;
    expectedVersion: number;
  },
) {
  const record = await loadCase(dictamenId);
  if (!record) throw new ApplicationError('CASE_NOT_FOUND', 'Expediente no encontrado.', 404);
  assertScope(record, auth);

  const targets = getReopeningTargets({
    flujoVersion: record.flujoVersion,
    originState: record.formularioOrigen?.estado ?? null,
    pclClosed: !record.estado,
    canReopenOrigin: auth.permissions.includes('formulario_origen.reopen'),
    canReopenPcl: auth.permissions.includes('dictamen.reopen'),
  });
  if (!targets.includes(input.objetivo)) {
    throw new ApplicationError(
      'REOPEN_NOT_ELIGIBLE',
      'El documento ya no es elegible para reapertura.',
      409,
    );
  }

  const alcance = input.objetivo === 'ORIGEN' ? 'ORIGEN' : 'PCL';
  const motive = await prisma.motivoReapertura.findFirst({
    where: {
      id: input.motivoId,
      estado: true,
      alcances: { some: { alcance } },
    },
    select: { id: true, nombre: true, exigeObservacion: true },
  });
  if (!motive) {
    throw new ApplicationError(
      'INVALID_REOPEN_REASON',
      'El motivo no existe, está inactivo o no aplica al documento.',
      400,
    );
  }
  if (motive.exigeObservacion && !input.observacion?.trim()) {
    throw new ApplicationError(
      'REOPEN_OBSERVATION_REQUIRED',
      'Este motivo exige una observación adicional.',
      400,
    );
  }

  if (input.objetivo === 'ORIGEN') {
    const origin = record.formularioOrigen;
    if (!origin) throw new ApplicationError('ORIGIN_NOT_FOUND', 'Formulario no encontrado.', 404);

    await prisma.$transaction(async (tx) => {
      const claimed = await tx.formularioOrigen.updateMany({
        where: {
          id: origin.id,
          estado: 'FINALIZADO',
          lockVersion: input.expectedVersion,
        },
        data: {
          estado: 'REABIERTO',
          versionActual: { increment: 1 },
          lockVersion: { increment: 1 },
          reabiertoEn: new Date(),
          reabiertoPorId: auth.empleadoId,
        },
      });
      if (claimed.count !== 1) {
        throw new ApplicationError(
          'STALE_VERSION',
          'El estado cambió mientras el diálogo estaba abierto.',
          409,
        );
      }
      await tx.dictamen.update({
        where: { id: dictamenId },
        data: {
          pclRequiereRevision: record.pclIniciadoEn != null,
          lockVersion: { increment: 1 },
        },
      });
      await tx.historialFormularioOrigen.create({
        data: {
          formularioOrigenId: origin.id,
          actorId: auth.empleadoId,
          motivoReaperturaId: motive.id,
          tipo: 'REAPERTURA',
          estadoAnterior: 'FINALIZADO',
          estadoNuevo: 'REABIERTO',
          observacion: input.observacion?.trim() || null,
          cambios: {
            versionAnterior: origin.versionActual,
            versionTrabajo: origin.versionActual + 1,
          },
        },
      });
    });

    return {
      objetivo: input.objetivo,
      route: `/medico/dictamen/${dictamenId}/origen`,
      motivo: motive.nombre,
    };
  }

  const snapshot = buildDictamenHistorySnapshot(record);
  const estadoAnterior = resolveDictamenEstadoHistorial(record);
  await prisma.$transaction(async (tx) => {
    const claimed = await tx.dictamen.updateMany({
      where: {
        id: dictamenId,
        estado: false,
        lockVersion: input.expectedVersion,
      },
      data: {
        estado: true,
        reabierto: true,
        reabiertoEn: new Date(),
        reabiertoPorId: auth.empleadoId,
        motivoReaperturaId: motive.id,
        lockVersion: { increment: 1 },
      },
    });
    if (claimed.count !== 1) {
      throw new ApplicationError(
        'STALE_VERSION',
        'El estado cambió mientras el diálogo estaba abierto.',
        409,
      );
    }
    await tx.dictamenHistorial.create({
      data: {
        dictamenId,
        empleadoId: auth.empleadoId,
        motivoReaperturaId: motive.id,
        tipo: 'REAPERTURA',
        estadoAnterior,
        estadoNuevo: 'REABIERTO',
        formularioAnterior: snapshot,
        formularioNuevo: snapshot,
      },
    });
  });

  return {
    objetivo: input.objetivo,
    route: `/medico/dictamen/${dictamenId}`,
    motivo: motive.nombre,
  };
}
