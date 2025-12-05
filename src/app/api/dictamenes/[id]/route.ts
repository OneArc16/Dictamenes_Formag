// app/api/dictamenes/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth';
import { z } from 'zod';
import { ProcedimientoPcl } from '@prisma/client';

export const runtime = 'nodejs';

type JwtPayload = {
  sub: string;
  role?: string;
  name?: string;
  [key: string]: any;
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
  return [
    u.primerNombre,
    u.segundoNombre,
    u.primerApellido,
    u.segundoApellido,
  ]
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
  return [
    e.primerNombre,
    e.segundoNombre,
    e.primerApellido,
    e.segundoApellido,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
}

async function getMedicoIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;

  const payload = (await verifyJwt(token)) as JwtPayload | null;
  if (!payload?.sub) return null;

  const medicoId = Number(payload.sub);
  if (!medicoId || Number.isNaN(medicoId)) return null;

  return medicoId;
}

// 👇 tipo de contexto con params como Promise
type RouteContext = {
  params: Promise<{ id: string }>;
};

// ======================
// GET: detalle dictamen
// ======================
// ======================
// GET: detalle dictamen
// ======================
export async function GET(_req: Request, context: RouteContext) {
  try {
    const medicoId = await getMedicoIdFromToken();
    if (!medicoId) {
      return NextResponse.json(
        { ok: false, error: 'No autenticado' },
        { status: 401 },
      );
    }

    // 👇 aquí desempaquetamos el Promise de params
    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { ok: false, error: 'ID de dictamen inválido.' },
        { status: 400 },
      );
    }

    const dictamen = await prisma.dictamen.findFirst({
      where: {
        id,
        empleadoId: medicoId, // solo ve sus propios dictámenes
      },
      include: {
        usuario: {
          include: {
            secretariaRef: true,
            institucionEducativaRef: true,
          },
        },
        empleado: true,

        // 👇👇 **IMPORTANTE: traer los diagnósticos asociados al dictamen**
        diagnosticos: {
          select: {
            cie10Codigo: true,
            tipo: true,
          },
        },
      },
    });

    if (!dictamen) {
      return NextResponse.json(
        { ok: false, error: 'Dictamen no encontrado.' },
        { status: 404 },
      );
    }

    const docente = dictamen.usuario;
    const medico = dictamen.empleado;

    const estado = dictamen.reabierto
      ? 'REABIERTO'
      : dictamen.estado
      ? 'PENDIENTE'
      : 'CERRADO';

    return NextResponse.json({
      ok: true,
      dictamen: {
        id: dictamen.id,
        numeroDictamen: dictamen.numeroDictamen ?? null,
        fechaDictamen: dictamen.fechaDictamen
          ? dictamen.fechaDictamen.toISOString().slice(0, 10)
          : null,
        procedimientoPcl: dictamen.procedimientoPcl as ProcedimientoPcl,
        estado,

        antecedentesClinicos: dictamen.antecedentesClinicos ?? '',
        condicionSalud: dictamen.condicionSalud ?? '',
        descripcionHallazgos: dictamen.descripcionHallazgos ?? '',

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

        // 👇👇 **AQUÍ devolvemos los diagnósticos al front**
        diagnosticos:
          dictamen.diagnosticos?.map((dx) => ({
            cie10Codigo: dx.cie10Codigo,
            tipo: dx.tipo,
          })) ?? [],
      },
    });
  } catch (err: any) {
    console.error('ERROR GET /api/dictamenes/[id]:', err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? 'Error consultando dictamen',
      },
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
    fechaDictamen: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
});

export async function PUT(req: Request, context: RouteContext) {
  try {
    const medicoId = await getMedicoIdFromToken();
    if (!medicoId) {
      return NextResponse.json(
        { ok: false, error: 'No autenticado' },
        { status: 401 },
      );
    }

    // 👇 igual que en el GET, desempaquetamos params
    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { ok: false, error: 'ID de dictamen inválido.' },
        { status: 400 },
      );
    }

    const json = await req.json();
    const data = UpdateAntecedentesSchema.parse(json);

    // (Opcional) validar que el dictamen pertenece al médico logueado
    const existing = await prisma.dictamen.findUnique({
      where: { id },
      select: {
        empleadoId: true,
        usuario: {
          select: { identificacion: true },
        },
      },
    });


    if (!existing || existing.empleadoId !== medicoId) {
      return NextResponse.json(
        { ok: false, error: 'No tiene permiso sobre este dictamen.' },
        { status: 403 },
      );
    }

    // armamos el objeto de actualización de forma dinámica
const updateData: any = {
  antecedentesClinicos: data.antecedentesClinicos ?? null,
  condicionSalud: data.condicionSalud ?? null,
  descripcionHallazgos: data.descripcionHallazgos ?? null,
};

if (data.procedimientoPcl) {
  updateData.procedimientoPcl = data.procedimientoPcl as ProcedimientoPcl;
}

if (data.fechaDictamen) {
  // convertir 'YYYY-MM-DD' a Date
  const fecha = new Date(`${data.fechaDictamen}T00:00:00`);

    if (Number.isNaN(fecha.getTime())) {
      return NextResponse.json(
        { ok: false, error: 'Fecha de dictamen inválida.' },
        { status: 400 },
      );
    }

    updateData.fechaDictamen = fecha;

    // si tenemos el documento del docente, recalculamos el número
    const doc = existing.usuario?.identificacion;
    if (doc) {
      const [year, month, day] = data.fechaDictamen.split('-'); // YYYY-MM-DD
      const numeroDictamen = `${day}${month}${year}${doc}`;      // ddMMyyyy + documento
      updateData.numeroDictamen = numeroDictamen;
    }
  }

  const updated = await prisma.dictamen.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      fechaDictamen: true,
      numeroDictamen: true,
    },
  });


    return NextResponse.json({
      ok: true,
      dictamen: updated,
    });
  } catch (err: any) {
    console.error('ERROR PUT /api/dictamenes/[id]:', err);
    const msg =
      err?.issues?.[0]?.message ||
      err?.message ||
      'Error actualizando antecedentes';
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
