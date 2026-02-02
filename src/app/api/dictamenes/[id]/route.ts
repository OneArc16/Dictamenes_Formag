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

// ✅ ServerVersion definitiva: hash del contenido (detecta cambios directos en BD)
function computeServerVersion(dictamen: any) {
  const payload = {
    id: dictamen.id,
    numeroDictamen: dictamen.numeroDictamen ?? null,
    fechaDictamen: dictamen.fechaDictamen ? dictamen.fechaDictamen.toISOString().slice(0, 10) : null,
    procedimientoPcl: dictamen.procedimientoPcl ?? null,

    antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
    condicionSalud: dictamen.condicionSalud ?? '',
    descripcionHallazgos: dictamen.descripcionHallazgos ?? '',

    // ✅ IMPORTANTE: para invalidar Dexie al cerrar/reabrir
    estado: dictamen.estado,      // boolean en BD
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

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
      },
    });

    if (!dictamen) {
      return NextResponse.json({ ok: false, error: 'Dictamen no encontrado.' }, { status: 404 });
    }

    const docente = dictamen.usuario;
    const medico = dictamen.empleado;

    // ✅ estadoLabel (para UI)
    const estadoLabel: 'PENDIENTE' | 'REABIERTO' | 'CERRADO' = dictamen.reabierto
      ? 'REABIERTO'
      : dictamen.estado
      ? 'PENDIENTE'
      : 'CERRADO';

    // ✅ CERRADO REAL (no editable) = estado false y no reabierto
    const locked = dictamen.estado === false && dictamen.reabierto !== true;

    const serverVersion = computeServerVersion(dictamen);

    return NextResponse.json({
      ok: true,

      // ✅ readOnly real: por rol O por cierre
      readOnly: isReadOnlyByRole(role) || locked,

      serverVersion,
      dictamen: {
        id: dictamen.id,

        numeroDictamen: dictamen.numeroDictamen != null ? String(dictamen.numeroDictamen) : null,

        fechaDictamen: dictamen.fechaDictamen ? dictamen.fechaDictamen.toISOString().slice(0, 10) : null,

        procedimientoPcl: dictamen.procedimientoPcl as ProcedimientoPcl,

        // ✅ dejamos el string como estabas usándolo
        estado: estadoLabel,

        // ✅ NUEVO: flags útiles para el front
        locked,
        estadoDb: dictamen.estado,      // boolean BD
        reabierto: dictamen.reabierto,  // boolean BD

        antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
        condicionSalud: dictamen.condicionSalud ?? '',
        descripcionHallazgos: dictamen.descripcionHallazgos ?? '',

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
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error consultando dictamen' },
      { status: 500 },
    );
  }
}

// ============================
// PUT: actualizar antecedentes
// ============================
const UpdateAntecedentesSchema = z.object({
  antecedentesClinicos: z.string().optional(),
  condicionSalud: z.string().optional(),
  descripcionHallazgos: z.string().optional(),
  procedimientoPcl: z.enum(['A', 'B']).optional(),
  fechaDictamen: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function PUT(req: Request, context: RouteContext) {
  try {
    const auth = await getAuthFromToken();
    if (!auth) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

    const { userId, role } = auth;

    if (role !== 'MEDICO') {
      return NextResponse.json(
        { ok: false, error: 'No autorizado para editar este dictamen.' },
        { status: 403 },
      );
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ ok: false, error: 'ID de dictamen inválido.' }, { status: 400 });
    }

    const json = await req.json();
    const data = UpdateAntecedentesSchema.parse(json);

    const existing = await prisma.dictamen.findUnique({
      where: { id },
      select: {
        empleadoId: true,
        estado: true,     // ✅ boolean BD
        reabierto: true,  // ✅ boolean BD
        usuario: { select: { identificacion: true } },
      },
    });

    if (!existing || existing.empleadoId !== userId) {
      return NextResponse.json({ ok: false, error: 'No tiene permiso sobre este dictamen.' }, { status: 403 });
    }

    // ✅ BLOQUEO REAL: si está cerrado y no reabierto, no se edita
    if (existing.estado === false && existing.reabierto !== true) {
      return NextResponse.json(
        { ok: false, error: 'El dictamen está CERRADO. No se permite editar.' },
        { status: 409 },
      );
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

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ ok: false, error: 'No se enviaron campos para actualizar.' }, { status: 400 });
    }

    const updated = await prisma.dictamen.update({
      where: { id },
      data: updateData,
      select: { id: true, fechaDictamen: true, numeroDictamen: true },
    });

    return NextResponse.json({ ok: true, dictamen: updated });
  } catch (err: any) {
    console.error('ERROR PUT /api/dictamenes/[id]:', err);
    const msg = err?.issues?.[0]?.message || err?.message || 'Error actualizando antecedentes';
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
