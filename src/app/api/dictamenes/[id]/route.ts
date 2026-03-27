import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Prisma, ProcedimientoPcl } from '@prisma/client';
import crypto from 'crypto';
import { z } from 'zod';

import { verifyJwt } from '@/lib/auth';
import {
  buildDictamenHistoryChanges,
  buildDictamenHistorySnapshot,
  parseDictamenHistorySnapshot,
  resolveDictamenEstadoHistorial,
} from '@/lib/dictamen/historial';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type JwtPayload = {
  sub: string;
  role?: string;
  name?: string;
  [key: string]: unknown;
};

type AuthCtx = {
  userId: number;
  role: 'ADMIN' | 'ADMISIONISTA' | 'MEDICO' | string;
  name?: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

const UpdateDictamenSchema = z.object({
  antecedentesClinicos: z.string().nullable().optional(),
  condicionSalud: z.string().nullable().optional(),
  descripcionHallazgos: z.string().nullable().optional(),
  procedimientoPcl: z.enum(['A', 'B']).optional(),
  fechaDictamen: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaEstructuracionInvalidez: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  tipoEvento: z.enum(['ENFERMEDAD', 'ACCIDENTE']).nullable().optional(),
  origenEvento: z.enum(['LABORAL', 'COMUN']).nullable().optional(),
});

const dictamenDetailArgs = Prisma.validator<Prisma.DictamenDefaultArgs>()({
  select: {
    id: true,
    empleadoId: true,
    numeroDictamen: true,
    fechaDictamen: true,
    procedimientoPcl: true,
    tipoDictamen: true,
    antecedentesClinicos: true,
    condicionSalud: true,
    descripcionHallazgos: true,
    sustentacionObservaciones: true,
    fechaEstructuracionInvalidez: true,
    tipoEvento: true,
    origenEvento: true,
    aplicaAnalisisOcupacional: true,
    estado: true,
    reabierto: true,
    reabiertoEn: true,
    updatedAt: true,
    usuario: {
      select: {
        id: true,
        identificacion: true,
        tipoIdentificacion: true,
        primerNombre: true,
        segundoNombre: true,
        primerApellido: true,
        segundoApellido: true,
        edad: true,
        sexo: true,
        secretariaId: true,
        institucionEducativaId: true,
        secretariaRef: {
          select: {
            nombre: true,
          },
        },
        institucionEducativaRef: {
          select: {
            nombre: true,
          },
        },
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
    reabiertoPor: {
      select: {
        primerNombre: true,
        segundoNombre: true,
        primerApellido: true,
        segundoApellido: true,
      },
    },
    motivoReapertura: {
      select: {
        nombre: true,
      },
    },
    diagnosticos: {
      orderBy: {
        id: 'asc',
      },
      select: {
        id: true,
        cie10Codigo: true,
        tipo: true,
        cie10: {
          select: {
            nombre: true,
          },
        },
      },
    },
    historial: {
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        tipo: true,
        estadoAnterior: true,
        estadoNuevo: true,
        formularioAnterior: true,
        formularioNuevo: true,
        createdAt: true,
        empleado: {
          select: {
            primerNombre: true,
            segundoNombre: true,
            primerApellido: true,
            segundoApellido: true,
          },
        },
        motivoReapertura: {
          select: {
            nombre: true,
          },
        },
      },
    },
  },
});

type DictamenDetailRecord = Prisma.DictamenGetPayload<typeof dictamenDetailArgs>;

type DictamenSummaryRecord = Pick<
  DictamenDetailRecord,
  | 'id'
  | 'numeroDictamen'
  | 'fechaDictamen'
  | 'procedimientoPcl'
  | 'tipoDictamen'
  | 'antecedentesClinicos'
  | 'condicionSalud'
  | 'descripcionHallazgos'
  | 'sustentacionObservaciones'
  | 'fechaEstructuracionInvalidez'
  | 'tipoEvento'
  | 'origenEvento'
  | 'estado'
  | 'reabierto'
>;

type DictamenHistorialRecord = DictamenDetailRecord['historial'][number];
type DictamenDiagnosticoRecord = DictamenDetailRecord['diagnosticos'][number];
type DictamenPersona = {
  primerNombre: string | null;
  segundoNombre: string | null;
  primerApellido: string | null;
  segundoApellido: string | null;
};

type UpdatePayload = z.infer<typeof UpdateDictamenSchema>;

type UpdateData = {
  antecedentesClinicos?: string | null;
  condicionSalud?: string | null;
  descripcionHallazgos?: string | null;
  procedimientoPcl?: ProcedimientoPcl;
  fechaDictamen?: Date;
  numeroDictamen?: string;
  fechaEstructuracionInvalidez?: Date | null;
  tipoEvento?: 'ENFERMEDAD' | 'ACCIDENTE' | null;
  origenEvento?: 'LABORAL' | 'COMUN' | null;
};

function getNombreCompleto(persona: DictamenPersona | null | undefined) {
  if (!persona) {
    return 'Usuario no disponible';
  }

  return [
    persona.primerNombre,
    persona.segundoNombre,
    persona.primerApellido,
    persona.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
}

function normalizeRole(role: unknown): 'ADMIN' | 'ADMISIONISTA' | 'MEDICO' | string {
  const normalized = String(role ?? '').trim().toUpperCase();
  if (normalized === 'ADMINISTRADOR') return 'ADMIN';
  if (normalized === 'ADMICIONES' || normalized === 'ADMISIONES') return 'ADMISIONISTA';
  return normalized;
}

function canReadDictamen(role: string) {
  return role === 'MEDICO' || role === 'ADMIN' || role === 'ADMISIONISTA';
}

function isReadOnlyByRole(role: string) {
  return role === 'ADMIN' || role === 'ADMISIONISTA';
}

function canEditDictamen(dictamen: Pick<DictamenDetailRecord, 'empleadoId'>, auth: AuthCtx) {
  if (auth.role !== 'MEDICO') {
    return {
      ok: false as const,
      status: 403,
      error: 'No autorizado para editar este dictamen.',
    };
  }

  if (dictamen.empleadoId != null && dictamen.empleadoId !== auth.userId) {
    return {
      ok: false as const,
      status: 403,
      error: 'No tiene permiso sobre este dictamen.',
    };
  }

  return { ok: true as const };
}

function buildNumeroDictamen(documento: string, fechaYYYYMMDD: string) {
  const [yyyy, mm, dd] = fechaYYYYMMDD.split('-');
  const datePart = `${String(dd ?? '').padStart(2, '0')}${String(mm ?? '').padStart(2, '0')}${String(
    yyyy ?? '',
  )}`;
  const docPart = String(documento ?? '').replace(/\D/g, '');
  return `${datePart}${docPart}`;
}

function toColombiaMidnightUTC(fechaYYYYMMDD: string) {
  return new Date(`${fechaYYYYMMDD}T05:00:00.000Z`);
}

function resolveTipoDictamen(dictamen: Pick<DictamenSummaryRecord, 'tipoDictamen'>) {
  return dictamen.tipoDictamen != null ? String(dictamen.tipoDictamen) : null;
}

function computeServerVersion(dictamen: DictamenDetailRecord) {
  const payload = {
    id: dictamen.id,
    numeroDictamen: dictamen.numeroDictamen ?? null,
    fechaDictamen: dictamen.fechaDictamen ? dictamen.fechaDictamen.toISOString().slice(0, 10) : null,
    procedimientoPcl: dictamen.procedimientoPcl ?? null,
    tipoDictamen: resolveTipoDictamen(dictamen),
    antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
    condicionSalud: dictamen.condicionSalud ?? '',
    descripcionHallazgos: dictamen.descripcionHallazgos ?? '',
    fechaEstructuracionInvalidez: dictamen.fechaEstructuracionInvalidez
      ? dictamen.fechaEstructuracionInvalidez.toISOString().slice(0, 10)
      : null,
    tipoEvento: dictamen.tipoEvento ?? null,
    origenEvento: dictamen.origenEvento ?? null,
    estado: dictamen.estado,
    reabierto: dictamen.reabierto,
    docente: dictamen.usuario
      ? {
          id: dictamen.usuario.id,
          identificacion: dictamen.usuario.identificacion,
          tipoIdentificacion: dictamen.usuario.tipoIdentificacion,
          primerNombre: dictamen.usuario.primerNombre,
          segundoNombre: dictamen.usuario.segundoNombre ?? null,
          primerApellido: dictamen.usuario.primerApellido,
          segundoApellido: dictamen.usuario.segundoApellido ?? null,
          edad: dictamen.usuario.edad ?? null,
          sexo: dictamen.usuario.sexo ?? null,
          secretariaId: dictamen.usuario.secretariaId ?? null,
          institucionEducativaId: dictamen.usuario.institucionEducativaId ?? null,
          secretariaNombre: dictamen.usuario.secretariaRef?.nombre ?? null,
          institucionNombre: dictamen.usuario.institucionEducativaRef?.nombre ?? null,
        }
      : null,
    diagnosticos: dictamen.diagnosticos.map((diagnostico) => ({
      id: diagnostico.id,
      cie10Codigo: diagnostico.cie10Codigo,
      tipo: diagnostico.tipo,
    })),
  };

  return crypto.createHash('sha1').update(JSON.stringify(payload)).digest('hex');
}

async function getAuthFromToken(): Promise<AuthCtx | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;

  const payload = (await verifyJwt(token)) as JwtPayload | null;
  if (!payload?.sub) return null;

  const userId = Number(payload.sub);
  if (!Number.isFinite(userId) || userId <= 0) return null;

  return {
    userId,
    role: normalizeRole(payload.role) as AuthCtx['role'],
    name: payload.name,
  };
}

function serializeDictamenResponse(dictamen: DictamenSummaryRecord) {
  return {
    id: dictamen.id,
    numeroDictamen: dictamen.numeroDictamen != null ? String(dictamen.numeroDictamen) : null,
    fechaDictamen: dictamen.fechaDictamen ? dictamen.fechaDictamen.toISOString().slice(0, 10) : null,
    procedimientoPcl: dictamen.procedimientoPcl,
    estado: resolveDictamenEstadoHistorial(dictamen),
    antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
    condicionSalud: dictamen.condicionSalud ?? '',
    descripcionHallazgos: dictamen.descripcionHallazgos ?? '',
    sustentacionObservaciones: dictamen.sustentacionObservaciones ?? '',
    fechaEstructuracionInvalidez: dictamen.fechaEstructuracionInvalidez
      ? dictamen.fechaEstructuracionInvalidez.toISOString().slice(0, 10)
      : null,
    tipoEvento: dictamen.tipoEvento ?? null,
    origenEvento: dictamen.origenEvento ?? null,
    tipoDictamen: resolveTipoDictamen(dictamen),
  };
}

function serializeDiagnostico(diagnostico: DictamenDiagnosticoRecord) {
  return {
    cie10Codigo: diagnostico.cie10Codigo,
    tipo: diagnostico.tipo,
    cie10Label: diagnostico.cie10
      ? `${diagnostico.cie10Codigo} - ${diagnostico.cie10.nombre}`
      : diagnostico.cie10Codigo,
  };
}

function serializeHistorialItem(item: DictamenHistorialRecord) {
  const previousSnapshot = parseDictamenHistorySnapshot(item.formularioAnterior as Prisma.JsonValue | null);
  const nextSnapshot = parseDictamenHistorySnapshot(item.formularioNuevo as Prisma.JsonValue | null);

  return {
    id: item.id,
    tipo: item.tipo,
    createdAt: item.createdAt.toISOString(),
    actorNombre: getNombreCompleto(item.empleado),
    estadoAnterior: item.estadoAnterior,
    estadoNuevo: item.estadoNuevo,
    motivoReapertura: item.motivoReapertura?.nombre ?? null,
    cambios: buildDictamenHistoryChanges(previousSnapshot, nextSnapshot),
  };
}

function serializeDictamenDetail(dictamen: DictamenDetailRecord) {
  const estado = resolveDictamenEstadoHistorial(dictamen);
  const historial = dictamen.historial.map(serializeHistorialItem);
  const ultimaReaperturaHistorial = historial.find((item) => item.tipo === 'REAPERTURA') ?? null;

  const ultimaReapertura = ultimaReaperturaHistorial
    ? {
        createdAt: ultimaReaperturaHistorial.createdAt,
        actorNombre: ultimaReaperturaHistorial.actorNombre,
        motivoReapertura: ultimaReaperturaHistorial.motivoReapertura,
      }
    : dictamen.reabiertoEn
      ? {
          createdAt: dictamen.reabiertoEn.toISOString(),
          actorNombre: getNombreCompleto(dictamen.reabiertoPor),
          motivoReapertura: dictamen.motivoReapertura?.nombre ?? null,
        }
      : null;

  return {
    ...serializeDictamenResponse(dictamen),
    locked: estado === 'CERRADO',
    diagnosticos: dictamen.diagnosticos.map(serializeDiagnostico),
    docente: {
      id: dictamen.usuario.id,
      documento: dictamen.usuario.identificacion,
      tipoDocumento: dictamen.usuario.tipoIdentificacion,
      nombreCompleto: getNombreCompleto(dictamen.usuario),
      edad: dictamen.usuario.edad,
      sexo: dictamen.usuario.sexo ?? '',
      secretaria: dictamen.usuario.secretariaRef?.nombre ?? null,
      institucion: dictamen.usuario.institucionEducativaRef?.nombre ?? null,
      tipoDictamen: resolveTipoDictamen(dictamen),
    },
    medico: dictamen.empleado
      ? {
          id: dictamen.empleado.id,
          nombreCompleto: getNombreCompleto(dictamen.empleado),
        }
      : null,
    historial,
    ultimaReapertura,
  };
}

function buildUpdateData(body: UpdatePayload, documentoDocente: string): UpdateData {
  const updateData: UpdateData = {};

  if ('antecedentesClinicos' in body) {
    updateData.antecedentesClinicos = body.antecedentesClinicos ?? null;
  }

  if ('condicionSalud' in body) {
    updateData.condicionSalud = body.condicionSalud ?? null;
  }

  if ('descripcionHallazgos' in body) {
    updateData.descripcionHallazgos = body.descripcionHallazgos ?? null;
  }

  if ('procedimientoPcl' in body && body.procedimientoPcl) {
    updateData.procedimientoPcl = body.procedimientoPcl;
  }

  if ('fechaDictamen' in body && body.fechaDictamen) {
    updateData.fechaDictamen = toColombiaMidnightUTC(body.fechaDictamen);
    updateData.numeroDictamen = buildNumeroDictamen(documentoDocente, body.fechaDictamen);
  }

  if ('fechaEstructuracionInvalidez' in body) {
    updateData.fechaEstructuracionInvalidez = body.fechaEstructuracionInvalidez
      ? toColombiaMidnightUTC(body.fechaEstructuracionInvalidez)
      : null;
  }

  if ('tipoEvento' in body) {
    updateData.tipoEvento = body.tipoEvento ?? null;
  }

  if ('origenEvento' in body) {
    updateData.origenEvento = body.origenEvento ?? null;
  }

  return updateData;
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const auth = await getAuthFromToken();
    if (!auth) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

    if (!canReadDictamen(auth.role)) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 403 });
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: 'ID de dictamen invalido.' }, { status: 400 });
    }

    const where: Prisma.DictamenWhereInput = { id };
    if (auth.role === 'MEDICO') {
      where.empleadoId = auth.userId;
    }

    const dictamen = await prisma.dictamen.findFirst({
      ...dictamenDetailArgs,
      where,
    });

    if (!dictamen) {
      return NextResponse.json({ ok: false, error: 'Dictamen no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      readOnly: isReadOnlyByRole(auth.role) || resolveDictamenEstadoHistorial(dictamen) === 'CERRADO',
      serverVersion: computeServerVersion(dictamen),
      dictamen: serializeDictamenDetail(dictamen),
    });
  } catch (error: unknown) {
    console.error('ERROR GET /api/dictamenes/[id]:', error);
    const message = error instanceof Error ? error.message : 'Error consultando dictamen';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const auth = await getAuthFromToken();
    if (!auth) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: 'ID de dictamen invalido.' }, { status: 400 });
    }

    const body = UpdateDictamenSchema.parse(await req.json());

    const existing = await prisma.dictamen.findUnique({
      where: { id },
      select: {
        id: true,
        empleadoId: true,
        estado: true,
        reabierto: true,
        numeroDictamen: true,
        fechaDictamen: true,
        procedimientoPcl: true,
        tipoDictamen: true,
        antecedentesClinicos: true,
        condicionSalud: true,
        descripcionHallazgos: true,
        sustentacionObservaciones: true,
        fechaEstructuracionInvalidez: true,
        tipoEvento: true,
        origenEvento: true,
        aplicaAnalisisOcupacional: true,
        usuario: {
          select: {
            identificacion: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Dictamen no encontrado.' }, { status: 404 });
    }

    const permission = canEditDictamen(existing, auth);
    if (!permission.ok) {
      return NextResponse.json({ ok: false, error: permission.error }, { status: permission.status });
    }

    if (existing.estado === false && existing.reabierto === false) {
      return NextResponse.json({ ok: false, error: 'Dictamen CERRADO. No se permite editar.' }, { status: 409 });
    }

    const documentoDocente = existing.usuario?.identificacion;
    if (!documentoDocente) {
      return NextResponse.json(
        {
          ok: false,
          error: 'El docente no tiene identificacion registrada. No se puede generar el numero de dictamen.',
        },
        { status: 400 },
      );
    }

    const updateData = buildUpdateData(body, documentoDocente);
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ ok: false, error: 'No se enviaron campos para actualizar.' }, { status: 400 });
    }

    if (updateData.fechaDictamen && Number.isNaN(updateData.fechaDictamen.getTime())) {
      return NextResponse.json({ ok: false, error: 'Fecha de dictamen invalida.' }, { status: 400 });
    }

    if (
      Object.prototype.hasOwnProperty.call(updateData, 'fechaEstructuracionInvalidez') &&
      updateData.fechaEstructuracionInvalidez &&
      Number.isNaN(updateData.fechaEstructuracionInvalidez.getTime())
    ) {
      return NextResponse.json({ ok: false, error: 'Fecha de estructuracion invalida.' }, { status: 400 });
    }

    const previousSnapshotJson = buildDictamenHistorySnapshot(existing);
    const nextSnapshotJson = buildDictamenHistorySnapshot({
      ...existing,
      ...updateData,
    });

    const previousSnapshot = parseDictamenHistorySnapshot(previousSnapshotJson as Prisma.JsonValue);
    const nextSnapshot = parseDictamenHistorySnapshot(nextSnapshotJson as Prisma.JsonValue);
    const changes = buildDictamenHistoryChanges(previousSnapshot, nextSnapshot);

    if (changes.length === 0) {
      return NextResponse.json({
        ok: true,
        dictamen: serializeDictamenResponse(existing),
      });
    }

    const estadoActual = resolveDictamenEstadoHistorial(existing);

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.dictamen.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          numeroDictamen: true,
          fechaDictamen: true,
          procedimientoPcl: true,
          tipoDictamen: true,
          antecedentesClinicos: true,
          condicionSalud: true,
          descripcionHallazgos: true,
          sustentacionObservaciones: true,
          fechaEstructuracionInvalidez: true,
          tipoEvento: true,
          origenEvento: true,
          estado: true,
          reabierto: true,
        },
      });

      await tx.dictamenHistorial.create({
        data: {
          dictamenId: id,
          empleadoId: auth.userId,
          tipo: 'EDICION',
          estadoAnterior: estadoActual,
          estadoNuevo: estadoActual,
          formularioAnterior: previousSnapshotJson,
          formularioNuevo: nextSnapshotJson,
        },
      });

      return next;
    });

    return NextResponse.json({
      ok: true,
      dictamen: serializeDictamenResponse(updated),
    });
  } catch (error: unknown) {
    console.error('ERROR PUT /api/dictamenes/[id]:', error);

    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? 'Datos invalidos.'
        : error instanceof Error
          ? error.message
          : 'Error actualizando dictamen';

    return NextResponse.json({ ok: false, error: message }, { status: error instanceof z.ZodError ? 400 : 500 });
  }
}
