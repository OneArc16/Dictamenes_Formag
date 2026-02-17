// app/api/dictamenes/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth';
import { z } from 'zod';
import { ProcedimientoPcl } from '@prisma/client';
import crypto from 'crypto';

export const runtime = 'nodejs';

type JwtPayload = {
  sub: string;
  role?: string;
  name?: string;
  [key: string]: any;
};

type AuthCtx = {
  userId: number;
  role: 'ADMIN' | 'ADMISIONISTA' | 'MEDICO' | string;
  name?: string;
};

// ======================
// Helpers
// ======================

function getNombreCompletoUsuario(u: {
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
}) {
  return [u.primerNombre, u.segundoNombre, u.primerApellido, u.segundoApellido]
    .filter(Boolean)
    .join(' ')
    .trim();
}

function getNombreCompletoEmpleado(e: {
  primerNombre: string;
  segundoNombre: string | null;
  primerApellido: string;
  segundoApellido: string | null;
}) {
  return [e.primerNombre, e.segundoNombre, e.primerApellido, e.segundoApellido]
    .filter(Boolean)
    .join(' ')
    .trim();
}

function normalizeRole(role: unknown): 'ADMIN' | 'ADMISIONISTA' | 'MEDICO' | string {
  const r = String(role ?? '').trim().toUpperCase();
  if (r === 'ADMINISTRADOR') return 'ADMIN';
  if (r === 'ADMICIONES' || r === 'ADMISIONES') return 'ADMISIONISTA';
  return r;
}

function canReadDictamen(role: string) {
  return role === 'MEDICO' || role === 'ADMIN' || role === 'ADMISIONISTA';
}

// Solo lectura por rol (ADMIN/ADMISIONISTA)
function isReadOnlyByRole(role: string) {
  return role === 'ADMIN' || role === 'ADMISIONISTA';
}

// ✅ Formato definitivo: ddMMyyyy + DOCUMENTO (solo dígitos)
function buildNumeroDictamen(documento: string, fechaYYYYMMDD: string) {
  const [yyyy, mm, dd] = fechaYYYYMMDD.split('-');
  const datePart = `${String(dd ?? '').padStart(2, '0')}${String(mm ?? '').padStart(2, '0')}${String(
    yyyy ?? '',
  )}`;
  const docPart = String(documento ?? '').replace(/\D/g, '');
  return `${datePart}${docPart}`;
}

// ✅ Guardar fecha como "medianoche Colombia" (05:00Z)
function toColombiaMidnightUTC(fechaYYYYMMDD: string) {
  return new Date(`${fechaYYYYMMDD}T05:00:00.000Z`);
}

// ✅ NUEVO: resolver tipo de dictamen (por si es string o relación)
function resolveTipoDictamen(dictamen: any): string | null {
  return (
    (dictamen?.tipoDictamen != null ? String(dictamen.tipoDictamen) : null) ??
    (dictamen?.tipoDictamenRef?.nombre != null ? String(dictamen.tipoDictamenRef.nombre) : null) ??
    null
  );
}

// ✅ ServerVersion definitiva: hash del contenido (detecta cambios directos en BD)
function computeServerVersion(dictamen: any) {
  const payload = {
    id: dictamen.id,
    numeroDictamen: dictamen.numeroDictamen ?? null,
    fechaDictamen: dictamen.fechaDictamen ? dictamen.fechaDictamen.toISOString().slice(0, 10) : null,
    procedimientoPcl: dictamen.procedimientoPcl ?? null,

    // ✅ NUEVO
    tipoDictamen: resolveTipoDictamen(dictamen),

    antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
    condicionSalud: dictamen.condicionSalud ?? '',
    descripcionHallazgos: dictamen.descripcionHallazgos ?? '',

    // ✅ NUEVOS: estructuración/origen
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

    diagnosticos: Array.isArray(dictamen.diagnosticos)
      ? dictamen.diagnosticos.map((dx: any) => ({
          id: dx.id,
          cie10Codigo: dx.cie10Codigo,
          tipo: dx.tipo,
        }))
      : [],
  };

  const raw = JSON.stringify(payload);
  return crypto.createHash('sha1').update(raw).digest('hex');
}

async function getAuthFromToken(): Promise<AuthCtx | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;

  const payload = (await verifyJwt(token)) as JwtPayload | null;
  if (!payload?.sub) return null;

  const userId = Number(payload.sub);
  if (!userId || Number.isNaN(userId)) return null;

  const role = normalizeRole(payload.role);
  return { userId, role: role as any, name: payload.name };
}

type RouteContext = { params: Promise<{ id: string }> };

// ======================
// GET: detalle dictamen
// ======================
export async function GET(_req: Request, context: RouteContext) {
  try {
    const auth = await getAuthFromToken();
    if (!auth) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

    const { userId, role } = auth;
    if (!canReadDictamen(role)) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 403 });
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ ok: false, error: 'ID de dictamen inválido.' }, { status: 400 });
    }

    const where: any = { id };
    if (role === 'MEDICO') where.empleadoId = userId;

    const dictamen = await prisma.dictamen.findFirst({
      where,
      include: {
        usuario: {
          include: {
            secretariaRef: true,
            institucionEducativaRef: true,
          },
        },
        empleado: true,
        diagnosticos: {
          include: { cie10: true },
          orderBy: { id: 'asc' },
        },

        // ✅ SOLO si tienes relación: descomenta y ajusta el nombre exacto
        // tipoDictamenRef: true,
      },
    });

    if (!dictamen) {
      return NextResponse.json({ ok: false, error: 'Dictamen no encontrado.' }, { status: 404 });
    }

    const docente = dictamen.usuario;
    const medico = dictamen.empleado;

    const estado: 'PENDIENTE' | 'REABIERTO' | 'CERRADO' = dictamen.reabierto
      ? 'REABIERTO'
      : dictamen.estado
      ? 'PENDIENTE'
      : 'CERRADO';

    const serverVersion = computeServerVersion(dictamen);

    // ✅ readOnly FINAL: por rol (ADMIN/ADMISIONISTA) o por estado (CERRADO y no reabierto)
    const readOnly = isReadOnlyByRole(role) || estado === 'CERRADO';

    // ✅ NUEVO: tipo de dictamen resuelto
    const tipoDictamen = resolveTipoDictamen(dictamen);

    return NextResponse.json({
      ok: true,
      readOnly,
      serverVersion,
      dictamen: {
        id: dictamen.id,

        // ✅ NUEVO (para tu LeftPanel)
        tipoDictamen,

        numeroDictamen: dictamen.numeroDictamen != null ? String(dictamen.numeroDictamen) : null,

        fechaDictamen: dictamen.fechaDictamen ? dictamen.fechaDictamen.toISOString().slice(0, 10) : null,

        procedimientoPcl: dictamen.procedimientoPcl as ProcedimientoPcl,
        estado,

        antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
        condicionSalud: dictamen.condicionSalud ?? '',
        descripcionHallazgos: dictamen.descripcionHallazgos ?? '',

        // ✅ NUEVOS (se devuelven al front)
        fechaEstructuracionInvalidez: dictamen.fechaEstructuracionInvalidez
          ? dictamen.fechaEstructuracionInvalidez.toISOString().slice(0, 10)
          : null,
        tipoEvento: (dictamen as any).tipoEvento ?? null,
        origenEvento: (dictamen as any).origenEvento ?? null,

        diagnosticos: dictamen.diagnosticos.map((dx) => ({
          cie10Codigo: dx.cie10Codigo,
          tipo: dx.tipo,
          cie10Label: dx.cie10 ? `${dx.cie10Codigo} - ${dx.cie10.nombre}` : dx.cie10Codigo,
        })),

        docente: {
          id: docente.id,
          documento: docente.identificacion,
          tipoDocumento: docente.tipoIdentificacion,
          nombreCompleto: getNombreCompletoUsuario({
            primerNombre: docente.primerNombre,
            segundoNombre: docente.segundoNombre ?? null,
            primerApellido: docente.primerApellido,
            segundoApellido: docente.segundoApellido ?? null,
          }),
          edad: docente.edad,
          sexo: docente.sexo,
          secretaria: docente.secretariaRef?.nombre ?? null,
          institucion: docente.institucionEducativaRef?.nombre ?? null,

          // ✅ OPCIONAL: si quieres que también venga dentro del bloque docente
          tipoDictamen,
        },

        medico: medico
          ? {
              id: medico.id,
              nombreCompleto: getNombreCompletoEmpleado({
                primerNombre: medico.primerNombre,
                segundoNombre: medico.segundoNombre ?? null,
                primerApellido: medico.primerApellido,
                segundoApellido: medico.segundoApellido ?? null,
              }),
            }
          : null,
      },
    });
  } catch (err: any) {
    console.error('ERROR GET /api/dictamenes/[id]:', err);
    return NextResponse.json({ ok: false, error: err?.message ?? 'Error consultando dictamen' }, { status: 500 });
  }
}

// ============================
// PUT: actualizar dictamen (solo médico)
// ============================
const UpdateDictamenSchema = z.object({
  antecedentesClinicos: z.string().optional(),
  condicionSalud: z.string().optional(),
  descripcionHallazgos: z.string().optional(),

  procedimientoPcl: z.enum(['A', 'B']).optional(),
  fechaDictamen: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),

  // ✅ NUEVOS: estructuración/origen
  fechaEstructuracionInvalidez: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tipoEvento: z.enum(['ENFERMEDAD', 'ACCIDENTE']).optional(),
  origenEvento: z.enum(['LABORAL', 'COMUN']).optional(),

  // ✅ (si después quieres permitir actualizar tipo dictamen)
  // tipoDictamen: z.string().optional(),
});

export async function PUT(req: Request, context: RouteContext) {
  try {
    const auth = await getAuthFromToken();
    if (!auth) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });

    const { userId, role } = auth;

    if (role !== 'MEDICO') {
      return NextResponse.json({ ok: false, error: 'No autorizado para editar este dictamen.' }, { status: 403 });
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ ok: false, error: 'ID de dictamen inválido.' }, { status: 400 });
    }

    const json = await req.json();
    const data = UpdateDictamenSchema.parse(json);

    const existing = await prisma.dictamen.findUnique({
      where: { id },
      select: {
        empleadoId: true,
        estado: true,
        reabierto: true,
        usuario: { select: { identificacion: true } },
      },
    });

    if (!existing || existing.empleadoId !== userId) {
      return NextResponse.json({ ok: false, error: 'No tiene permiso sobre este dictamen.' }, { status: 403 });
    }

    // ✅ BLOQUEO: si está cerrado y no reabierto => no editar
    const isClosed = existing.estado === false && existing.reabierto === false;
    if (isClosed) {
      return NextResponse.json({ ok: false, error: 'Dictamen CERRADO. No se permite editar.' }, { status: 409 });
    }

    const documentoDocente = existing.usuario?.identificacion;
    if (!documentoDocente) {
      return NextResponse.json(
        {
          ok: false,
          error: 'El docente no tiene identificación registrada. No se puede generar el número de dictamen.',
        },
        { status: 400 },
      );
    }

    const updateData: any = {};

    if ('antecedentesClinicos' in data) updateData.antecedentesClinicos = data.antecedentesClinicos ?? null;
    if ('condicionSalud' in data) updateData.condicionSalud = data.condicionSalud ?? null;
    if ('descripcionHallazgos' in data) updateData.descripcionHallazgos = data.descripcionHallazgos ?? null;

    if ('procedimientoPcl' in data && data.procedimientoPcl) {
      updateData.procedimientoPcl = data.procedimientoPcl as ProcedimientoPcl;
    }

    if ('fechaDictamen' in data && data.fechaDictamen) {
      const fecha = toColombiaMidnightUTC(data.fechaDictamen);
      if (Number.isNaN(fecha.getTime())) {
        return NextResponse.json({ ok: false, error: 'Fecha de dictamen inválida.' }, { status: 400 });
      }
      updateData.fechaDictamen = fecha;
      updateData.numeroDictamen = buildNumeroDictamen(documentoDocente, data.fechaDictamen);
    }

    // ✅ NUEVOS
    if ('fechaEstructuracionInvalidez' in data && data.fechaEstructuracionInvalidez) {
      const fechaE = toColombiaMidnightUTC(data.fechaEstructuracionInvalidez);
      if (Number.isNaN(fechaE.getTime())) {
        return NextResponse.json({ ok: false, error: 'Fecha de estructuración inválida.' }, { status: 400 });
      }
      updateData.fechaEstructuracionInvalidez = fechaE;
    }
    if ('tipoEvento' in data) {
      updateData.tipoEvento = data.tipoEvento ?? null;
    }
    if ('origenEvento' in data) {
      updateData.origenEvento = data.origenEvento ?? null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ ok: false, error: 'No se enviaron campos para actualizar.' }, { status: 400 });
    }

    const updated = await prisma.dictamen.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        fechaDictamen: true,
        numeroDictamen: true,
        fechaEstructuracionInvalidez: true,
        tipoEvento: true,
        origenEvento: true,

        // ✅ si quieres devolverlo también en PUT:
        // tipoDictamen: true,
      },
    });

    return NextResponse.json({ ok: true, dictamen: updated });
  } catch (err: any) {
    console.error('ERROR PUT /api/dictamenes/[id]:', err);
    const msg = err?.issues?.[0]?.message || err?.message || 'Error actualizando dictamen';
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}