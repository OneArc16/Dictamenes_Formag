import {
  type DictamenOrigenEvento,
  type DictamenTipoEvento,
  type EstadoSoporteOrigen,
  type JornadaEvento,
  Prisma,
  type TipoDiagnostico,
  type TipoSoporteOrigen,
} from '@prisma/client';

import type { AuthorizationContext } from '@/lib/auth/authorization';
import { hasCaseScope } from '@/lib/auth/case-scope';
import { prisma } from '@/lib/prisma';
import { formatDateOnly, getDiaSemanaBogota, parseColombiaDate } from '../domain/date';
import { buildNumeroDictamen } from '../domain/numero-dictamen';
import { calculateSectionProgress, validateFormularioOrigen } from '../domain/validation';
import { ApplicationError } from './errors';
import {
  getActiveOriginJuntaSnapshot,
  type OriginJuntaSnapshot,
} from './origin-junta';

const originArgs = Prisma.validator<Prisma.FormularioOrigenDefaultArgs>()({
  include: {
    dictamen: {
      include: {
        usuario: {
          include: {
            secretariaRef: { select: { nombre: true } },
            institucionEducativaRef: { select: { nombre: true } },
            cargoDocente: { select: { nombre: true } },
            municipio: { select: { nombre: true } },
          },
        },
        empleado: {
          select: {
            id: true,
            primerNombre: true,
            segundoNombre: true,
            primerApellido: true,
            segundoApellido: true,
          },
        },
      },
    },
    historialLaboral: { orderBy: [{ orden: 'asc' }, { id: 'asc' }] },
    soportes: { orderBy: [{ orden: 'asc' }, { id: 'asc' }] },
    diagnosticos: {
      orderBy: [{ orden: 'asc' }, { id: 'asc' }],
      include: { cie10: { select: { nombre: true } } },
    },
  },
});

type OriginRecord = Prisma.FormularioOrigenGetPayload<typeof originArgs>;

type HistorialInput = {
  institucionId: number | null;
  institucionNombreSnapshot: string;
  cargoId: number | null;
  cargoNombreSnapshot: string;
  riesgosLaborales: string;
  jornadaLaboral: string;
  tiempoExposicionAnios: number;
};

type SupportInput = {
  tipo: TipoSoporteOrigen;
  estado: EstadoSoporteOrigen;
  fechaDocumento: string | null;
  seTuvoEnCuenta: string | null;
  nombreOtro: string | null;
};

type DiagnosisInput = {
  cie10Codigo: string;
  tipo: TipoDiagnostico;
  esPrincipal: boolean;
};

function fullName(person: {
  primerNombre: string | null;
  segundoNombre: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
}) {
  return [
    person.primerNombre,
    person.segundoNombre,
    person.primerApellido,
    person.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function timeOnly(value: Date | null): string | null {
  return value ? value.toISOString().slice(11, 16) : null;
}

function toTime(value: string | null): Date | null {
  return value ? new Date(`1970-01-01T${value}:00.000Z`) : null;
}

function validationInput(record: OriginRecord) {
  return {
    fechaDictamenOrigen: formatDateOnly(record.fechaDictamenOrigen) ?? '',
    descripcion: record.descripcion,
    fechaOcurrencia: formatDateOnly(record.fechaOcurrencia),
    horaOcurrencia: timeOnly(record.horaOcurrencia),
    jornadaEvento: record.jornadaEvento,
    concepto: record.concepto,
    fundamentosDerecho: record.fundamentosDerecho,
    tipoEvento: record.tipoEvento,
    origenEvento: record.origenEvento,
    historialLaboral: record.historialLaboral.map((item) => ({
      ...item,
      tiempoExposicionAnios: Number(item.tiempoExposicionAnios),
    })),
    soportes: record.soportes.map((support) => ({
      ...support,
      fechaDocumento: formatDateOnly(support.fechaDocumento),
    })),
    diagnosticos: record.diagnosticos,
  };
}

export function serializeFormularioOrigen(record: OriginRecord) {
  const issues = validateFormularioOrigen(validationInput(record));

  return {
    id: record.id,
    dictamenId: record.dictamenId,
    estado: record.estado,
    formatoVersion: record.formatoVersion,
    versionActual: record.versionActual,
    lockVersion: record.lockVersion,
    fechaDictamenOrigen: formatDateOnly(record.fechaDictamenOrigen),
    numeroDictamenOrigen: record.numeroDictamenOrigen,
    descripcion: record.descripcion ?? '',
    actividadExtralaboral: record.actividadExtralaboral ?? '',
    fechaOcurrencia: formatDateOnly(record.fechaOcurrencia),
    horaOcurrencia: timeOnly(record.horaOcurrencia),
    diaSemana: getDiaSemanaBogota(formatDateOnly(record.fechaOcurrencia)),
    jornadaEvento: record.jornadaEvento,
    tratamiento: record.tratamiento ?? '',
    concepto: record.concepto ?? '',
    fundamentosDerecho: record.fundamentosDerecho ?? '',
    tipoEvento: record.tipoEvento,
    origenEvento: record.origenEvento,
    finalizadoEn: record.finalizadoEn?.toISOString() ?? null,
    updatedAt: record.updatedAt.toISOString(),
    readOnly: record.estado === 'FINALIZADO',
    docente: {
      id: record.dictamen.usuario.id,
      documento: record.dictamen.usuario.identificacion,
      tipoDocumento: record.dictamen.usuario.tipoIdentificacion,
      nombreCompleto: fullName(record.dictamen.usuario),
      edad: record.dictamen.usuario.edad,
      secretaria: record.dictamen.usuario.secretariaRef?.nombre ?? null,
      institucion: record.dictamen.usuario.institucionEducativaRef?.nombre ?? null,
      tipoDictamen: record.dictamen.tipoDictamen,
    },
    medico: record.dictamen.empleado
      ? {
          id: record.dictamen.empleado.id,
          nombreCompleto: fullName(record.dictamen.empleado),
        }
      : null,
    historialLaboral: record.historialLaboral.map((item) => ({
      id: item.id,
      institucionId: item.institucionId,
      institucionNombreSnapshot: item.institucionNombreSnapshot,
      cargoId: item.cargoId,
      cargoNombreSnapshot: item.cargoNombreSnapshot,
      riesgosLaborales: item.riesgosLaborales,
      jornadaLaboral: item.jornadaLaboral,
      tiempoExposicionAnios: Number(item.tiempoExposicionAnios),
    })),
    soportes: record.soportes.map((support) => ({
      id: support.id,
      tipo: support.tipo,
      estado: support.estado,
      fechaDocumento: formatDateOnly(support.fechaDocumento),
      seTuvoEnCuenta: support.seTuvoEnCuenta,
      nombreOtro: support.nombreOtro,
    })),
    diagnosticos: record.diagnosticos.map((diagnosis) => ({
      id: diagnosis.id,
      cie10Codigo: diagnosis.cie10Codigo,
      cie10Label: `${diagnosis.cie10Codigo} - ${diagnosis.cie10.nombre}`,
      tipo: diagnosis.tipo,
      esPrincipal: diagnosis.esPrincipal,
    })),
    validation: {
      issues,
      progress: calculateSectionProgress(issues),
    },
  };
}

async function findOrigin(dictamenId: number) {
  return prisma.formularioOrigen.findUnique({
    ...originArgs,
    where: { dictamenId },
  });
}

function assertAccess(record: OriginRecord, auth: AuthorizationContext, editable = false) {
  if (!hasCaseScope(auth, record.dictamen.empleadoId)) {
    throw new ApplicationError('FORBIDDEN', 'No tiene acceso a este expediente.', 403);
  }
  if (editable) {
    if (record.estado === 'FINALIZADO') {
      throw new ApplicationError(
        'ORIGIN_READ_ONLY',
        'El Formulario de Origen está finalizado y es de solo lectura.',
        409,
      );
    }
    if (!hasCaseScope(auth, record.dictamen.empleadoId)) {
      throw new ApplicationError('FORBIDDEN', 'No puede editar este expediente.', 403);
    }
  }
}

async function requireOrigin(
  dictamenId: number,
  auth: AuthorizationContext,
  editable = false,
) {
  const record = await findOrigin(dictamenId);
  if (!record) {
    throw new ApplicationError(
      'ORIGIN_NOT_FOUND',
      'El expediente no tiene Formulario de Origen.',
      404,
    );
  }
  assertAccess(record, auth, editable);
  return record;
}

async function claimVersion(
  tx: Prisma.TransactionClient,
  originId: number,
  expectedVersion: number,
) {
  const updated = await tx.formularioOrigen.updateMany({
    where: {
      id: originId,
      lockVersion: expectedVersion,
      estado: { in: ['BORRADOR', 'REABIERTO'] },
    },
    data: { lockVersion: { increment: 1 } },
  });
  if (updated.count !== 1) {
    throw new ApplicationError(
      'STALE_VERSION',
      'El formulario cambió en otra sesión. Recarga antes de continuar.',
      409,
    );
  }
}

export async function getFormularioOrigen(
  dictamenId: number,
  auth: AuthorizationContext,
) {
  const record = await requireOrigin(dictamenId, auth);
  const serialized = serializeFormularioOrigen(record);
  return {
    ...serialized,
    readOnly:
      serialized.readOnly ||
      !auth.permissions.includes('formulario_origen.edit'),
    canFinalize: auth.permissions.includes('formulario_origen.finalize'),
    canOpenPcl: auth.permissions.includes('dictamen.read'),
  };
}

export async function saveDescripcionOrigen(
  dictamenId: number,
  auth: AuthorizationContext,
  input: {
    descripcion: string;
    actividadExtralaboral: string;
    fechaDictamenOrigen?: string;
    expectedVersion: number;
  },
) {
  const current = await requireOrigin(dictamenId, auth, true);

  await prisma.$transaction(async (tx) => {
    await claimVersion(tx, current.id, input.expectedVersion);
    const fecha = input.fechaDictamenOrigen
      ? parseColombiaDate(input.fechaDictamenOrigen)
      : current.fechaDictamenOrigen;
    const fechaIso = formatDateOnly(fecha) as string;
    await tx.formularioOrigen.update({
      where: { id: current.id },
      data: {
        descripcion: input.descripcion.trim() || null,
        actividadExtralaboral: input.actividadExtralaboral.trim() || null,
        fechaDictamenOrigen: fecha,
        numeroDictamenOrigen: buildNumeroDictamen(
          fechaIso,
          current.dictamen.usuario.identificacion,
        ),
      },
    });
    await tx.historialFormularioOrigen.create({
      data: {
        formularioOrigenId: current.id,
        actorId: auth.empleadoId,
        tipo: 'EDICION',
        estadoAnterior: current.estado,
        estadoNuevo: current.estado,
        cambios: { seccion: 'descripcion' },
      },
    });
  });

  return getFormularioOrigen(dictamenId, auth);
}

export async function saveHistorialLaboralOrigen(
  dictamenId: number,
  auth: AuthorizationContext,
  input: { items: HistorialInput[]; expectedVersion: number },
) {
  const current = await requireOrigin(dictamenId, auth, true);
  await prisma.$transaction(async (tx) => {
    await claimVersion(tx, current.id, input.expectedVersion);
    await tx.historialLaboralOrigen.deleteMany({
      where: { formularioOrigenId: current.id },
    });
    if (input.items.length > 0) {
      await tx.historialLaboralOrigen.createMany({
        data: input.items.map((item, index) => ({
          formularioOrigenId: current.id,
          institucionId: item.institucionId,
          institucionNombreSnapshot: item.institucionNombreSnapshot.trim(),
          cargoId: item.cargoId,
          cargoNombreSnapshot: item.cargoNombreSnapshot.trim(),
          riesgosLaborales: item.riesgosLaborales.trim(),
          jornadaLaboral: item.jornadaLaboral.trim(),
          tiempoExposicionAnios: item.tiempoExposicionAnios,
          orden: index + 1,
        })),
      });
    }
  });
  return getFormularioOrigen(dictamenId, auth);
}

export async function saveInformacionFundamentosOrigen(
  dictamenId: number,
  auth: AuthorizationContext,
  input: {
    fechaOcurrencia: string | null;
    horaOcurrencia: string | null;
    jornadaEvento: JornadaEvento | null;
    soportes: SupportInput[];
    expectedVersion: number;
  },
) {
  const current = await requireOrigin(dictamenId, auth, true);
  await prisma.$transaction(async (tx) => {
    await claimVersion(tx, current.id, input.expectedVersion);
    await tx.formularioOrigen.update({
      where: { id: current.id },
      data: {
        fechaOcurrencia: input.fechaOcurrencia
          ? parseColombiaDate(input.fechaOcurrencia)
          : null,
        horaOcurrencia: toTime(input.horaOcurrencia),
        jornadaEvento: input.jornadaEvento,
      },
    });
    await tx.soporteFundamentoOrigen.deleteMany({
      where: { formularioOrigenId: current.id },
    });
    if (input.soportes.length > 0) {
      const counters = new Map<TipoSoporteOrigen, number>();
      await tx.soporteFundamentoOrigen.createMany({
        data: input.soportes.map((support, index) => {
          const typeOrder = (counters.get(support.tipo) ?? 0) + 1;
          counters.set(support.tipo, typeOrder);
          const clear = support.estado === 'NO_APLICA';
          return {
            formularioOrigenId: current.id,
            tipo: support.tipo,
            estado: support.estado,
            fechaDocumento:
              !clear && support.fechaDocumento
                ? parseColombiaDate(support.fechaDocumento)
                : null,
            seTuvoEnCuenta:
              !clear && support.seTuvoEnCuenta?.trim()
                ? support.seTuvoEnCuenta.trim()
                : null,
            nombreOtro:
              support.tipo === 'OTRO' ? support.nombreOtro?.trim() || null : null,
            orden: support.tipo === 'OTRO' ? 100 + typeOrder : index + 1,
          };
        }),
      });
    }
  });
  return getFormularioOrigen(dictamenId, auth);
}

export async function saveDiagnosticosOrigen(
  dictamenId: number,
  auth: AuthorizationContext,
  input: {
    diagnosticos: DiagnosisInput[];
    tratamiento: string | null;
    expectedVersion: number;
  },
) {
  const current = await requireOrigin(dictamenId, auth, true);
  await prisma.$transaction(async (tx) => {
    await claimVersion(tx, current.id, input.expectedVersion);
    const codes = [...new Set(input.diagnosticos.map((item) => item.cie10Codigo))];
    const validCodes = await tx.cie10.count({
      where: { codigo: { in: codes }, estado: true },
    });
    if (validCodes !== codes.length) {
      throw new ApplicationError(
        'INVALID_CIE10',
        'Uno o más diagnósticos CIE-10 no existen o están inactivos.',
        400,
      );
    }
    await tx.diagnosticoOrigen.deleteMany({
      where: { formularioOrigenId: current.id },
    });
    if (input.diagnosticos.length > 0) {
      await tx.diagnosticoOrigen.createMany({
        data: input.diagnosticos.map((diagnosis, index) => ({
          formularioOrigenId: current.id,
          cie10Codigo: diagnosis.cie10Codigo,
          tipo: diagnosis.tipo,
          esPrincipal: index === 0,
          orden: index + 1,
        })),
      });
    }
    await tx.formularioOrigen.update({
      where: { id: current.id },
      data: { tratamiento: input.tratamiento?.trim() || null },
    });
  });
  return getFormularioOrigen(dictamenId, auth);
}

export async function saveSustentacionOrigen(
  dictamenId: number,
  auth: AuthorizationContext,
  input: {
    concepto: string;
    fundamentosDerecho: string;
    tipoEvento: DictamenTipoEvento | null;
    origenEvento: DictamenOrigenEvento | null;
    expectedVersion: number;
  },
) {
  const current = await requireOrigin(dictamenId, auth, true);
  await prisma.$transaction(async (tx) => {
    await claimVersion(tx, current.id, input.expectedVersion);
    await tx.formularioOrigen.update({
      where: { id: current.id },
      data: {
        concepto: input.concepto.trim() || null,
        fundamentosDerecho: input.fundamentosDerecho.trim() || null,
        tipoEvento: input.tipoEvento,
        origenEvento: input.origenEvento,
      },
    });
  });
  return getFormularioOrigen(dictamenId, auth);
}

function buildSnapshot(
  record: OriginRecord,
  finalizadoEn: Date,
  junta: OriginJuntaSnapshot[],
): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify({
      formatoVersion: record.formatoVersion,
      numeroVersion: record.versionActual,
      documento: {
        fechaRecepcionSolicitud: formatDateOnly(record.dictamen.creadoEn),
        fechaDictamenOrigen: formatDateOnly(record.fechaDictamenOrigen),
        numeroDictamenOrigen: record.numeroDictamenOrigen,
      },
      entidad: {
        nombreContratista: 'IPS SISM',
        departamento: 'Magdalena',
        direccion: 'CRA 19 N 26B - 53 LOS NARANJOS',
        telefono: '3205184998',
        municipio: 'Santa Marta',
      },
      docente: {
        id: record.dictamen.usuario.id,
        documento: record.dictamen.usuario.identificacion,
        tipoDocumento: record.dictamen.usuario.tipoIdentificacion,
        primerApellido: record.dictamen.usuario.primerApellido,
        segundoApellido: record.dictamen.usuario.segundoApellido,
        primerNombre: record.dictamen.usuario.primerNombre,
        segundoNombre: record.dictamen.usuario.segundoNombre,
        nombreCompleto: fullName(record.dictamen.usuario),
        fechaNacimiento: formatDateOnly(record.dictamen.usuario.fechaNacimiento),
        edad: record.dictamen.usuario.edad,
        sexo: record.dictamen.usuario.sexo,
        tipoUsuario: record.dictamen.usuario.tipoUsuario,
        categoria: record.dictamen.usuario.categoria,
        fechaVinculacion: formatDateOnly(record.dictamen.usuario.fechaVinculacion),
        estadoCivil: record.dictamen.usuario.estadoCivil,
        escolaridad: record.dictamen.usuario.escolaridad,
        zonaResidencia: record.dictamen.usuario.zonaResidencia,
        municipio: record.dictamen.usuario.municipio?.nombre ?? null,
        cargo: record.dictamen.usuario.cargoDocente?.nombre ?? null,
        secretaria: record.dictamen.usuario.secretariaRef?.nombre ?? null,
        institucion: record.dictamen.usuario.institucionEducativaRef?.nombre ?? null,
      },
      descripcion: record.descripcion,
      actividadExtralaboral: record.actividadExtralaboral,
      informacion: {
        fechaOcurrencia: formatDateOnly(record.fechaOcurrencia),
        horaOcurrencia: timeOnly(record.horaOcurrencia),
        diaSemana: getDiaSemanaBogota(formatDateOnly(record.fechaOcurrencia)),
        jornadaEvento: record.jornadaEvento,
      },
      medico: record.dictamen.empleado
        ? {
            id: record.dictamen.empleado.id,
            nombreCompleto: fullName(record.dictamen.empleado),
          }
        : null,
      emision: {
        finalizadoEn: finalizadoEn.toISOString(),
      },
      historialLaboral: record.historialLaboral.map((item) => ({
        ...item,
        tiempoExposicionAnios: Number(item.tiempoExposicionAnios),
      })),
      soportes: record.soportes.map((support) => ({
        ...support,
        fechaDocumento: formatDateOnly(support.fechaDocumento),
      })),
      diagnosticos: record.diagnosticos.map((diagnosis) => ({
        cie10Codigo: diagnosis.cie10Codigo,
        cie10Nombre: diagnosis.cie10.nombre,
        tipo: diagnosis.tipo,
        esPrincipal: diagnosis.esPrincipal,
        orden: diagnosis.orden,
      })),
      tratamiento: record.tratamiento,
      sustentacion: {
        concepto: record.concepto,
        fundamentosDerecho: record.fundamentosDerecho,
        tipoEvento: record.tipoEvento,
        origenEvento: record.origenEvento,
      },
      junta,
    }),
  ) as Prisma.InputJsonValue;
}

export async function finalizarFormularioOrigen(
  dictamenId: number,
  auth: AuthorizationContext,
  expectedVersion: number,
) {
  const current = await requireOrigin(dictamenId, auth, true);
  const issues = validateFormularioOrigen(validationInput(current));
  if (issues.length > 0) {
    throw new ApplicationError(
      'ORIGIN_VALIDATION_FAILED',
      'Completa las secciones pendientes antes de finalizar.',
      422,
      { issues, progress: calculateSectionProgress(issues) },
    );
  }

  const fechaIso = formatDateOnly(current.fechaDictamenOrigen) as string;
  const numero = buildNumeroDictamen(
    fechaIso,
    current.dictamen.usuario.identificacion,
  );
  const finalizadoEn = new Date();
  const junta = await getActiveOriginJuntaSnapshot();
  const snapshot = buildSnapshot(
    {
      ...current,
      numeroDictamenOrigen: numero,
    },
    finalizadoEn,
    junta,
  );

  await prisma.$transaction(async (tx) => {
    const updated = await tx.formularioOrigen.updateMany({
      where: {
        id: current.id,
        lockVersion: expectedVersion,
        estado: { in: ['BORRADOR', 'REABIERTO'] },
      },
      data: {
        estado: 'FINALIZADO',
        numeroDictamenOrigen: numero,
        finalizadoEn,
        finalizadoPorId: auth.empleadoId,
        lockVersion: { increment: 1 },
      },
    });
    if (updated.count !== 1) {
      throw new ApplicationError(
        'STALE_VERSION',
        'El formulario cambió antes de finalizar. Recarga e inténtalo de nuevo.',
        409,
      );
    }

    const reapertura = current.estado === 'REABIERTO'
      ? await tx.historialFormularioOrigen.findFirst({
          where: {
            formularioOrigenId: current.id,
            tipo: 'REAPERTURA',
          },
          orderBy: { createdAt: 'desc' },
          select: {
            observacion: true,
            motivoReapertura: { select: { nombre: true } },
          },
        })
      : null;
    const motivoVersion = [
      reapertura?.motivoReapertura?.nombre,
      reapertura?.observacion,
    ]
      .filter(Boolean)
      .join(' · ') || null;

    await tx.versionFormularioOrigen.create({
      data: {
        formularioOrigenId: current.id,
        numeroVersion: current.versionActual,
        snapshot,
        motivo: motivoVersion,
        actorId: auth.empleadoId,
        usuarioSnapshotId: current.dictamen.usuarioId,
      },
    });
    await tx.historialFormularioOrigen.create({
      data: {
        formularioOrigenId: current.id,
        actorId: auth.empleadoId,
        tipo: 'FINALIZACION',
        estadoAnterior: current.estado,
        estadoNuevo: 'FINALIZADO',
        cambios: { numeroVersion: current.versionActual },
      },
    });

    const pclDiagnoses = await tx.dictamenDiagnostico.count({
      where: { dictamenId },
    });
    if (pclDiagnoses === 0 && current.diagnosticos.length > 0) {
      await tx.dictamenDiagnostico.createMany({
        data: current.diagnosticos.map((diagnosis) => ({
          dictamenId,
          cie10Codigo: diagnosis.cie10Codigo,
          tipo: diagnosis.tipo,
        })),
        skipDuplicates: true,
      });
    }
  });

  return getFormularioOrigen(dictamenId, auth);
}
