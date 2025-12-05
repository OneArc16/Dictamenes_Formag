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

// 👇 tipo de contexto con params como Promise (para evitar el error de Next)
type RouteContext = {
  params: Promise<{ id: string }>;
};

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

    // 👇 desempaquetamos el Promise de params
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
        empleadoId: medicoId,
      },
      include: {
        usuario: {
          include: {
            secretariaRef: true,
            institucionEducativaRef: true,
          },
        },
        empleado: true,
        // ⬇️ NUEVO: traer los diagnósticos con su CIE10
        diagnosticos: {
          include: {
            cie10: true,
          },
          orderBy: { id: 'asc' },
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

    const estado: 'PENDIENTE' | 'REABIERTO' | 'CERRADO' = dictamen.reabierto
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

        // ⬇️ NUEVO: diagnósticos del dictamen
        diagnosticos: dictamen.diagnosticos.map((dx) => ({
          cie10Codigo: dx.cie10Codigo,
          tipo: dx.tipo, // enum de Prisma
          cie10Label: dx.cie10
            ? `${dx.cie10Codigo} - ${dx.cie10.nombre}`
            : dx.cie10Codigo,
        })),

        docente: {
          id: docente.id,
          documento: docente.identificacion,
          tipoDocumento: docente.tipoIdentificacion,
          // 🔹 ahora con nombre COMPLETO
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
    .optional(),
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

    // Validar que el dictamen pertenece al médico logueado
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

    // 👇 SOLO tocamos los campos que vienen en el body
    const updateData: any = {};

    if ('antecedentesClinicos' in data) {
      updateData.antecedentesClinicos =
        data.antecedentesClinicos ?? null;
    }

    if ('condicionSalud' in data) {
      updateData.condicionSalud = data.condicionSalud ?? null;
    }

    if ('descripcionHallazgos' in data) {
      updateData.descripcionHallazgos =
        data.descripcionHallazgos ?? null;
    }

    if ('procedimientoPcl' in data && data.procedimientoPcl) {
      updateData.procedimientoPcl =
        data.procedimientoPcl as ProcedimientoPcl;
    }

    if ('fechaDictamen' in data && data.fechaDictamen) {
      const fecha = new Date(`${data.fechaDictamen}T00:00:00`);

      if (Number.isNaN(fecha.getTime())) {
        return NextResponse.json(
          { ok: false, error: 'Fecha de dictamen inválida.' },
          { status: 400 },
        );
      }

      updateData.fechaDictamen = fecha;

      const doc = existing.usuario?.identificacion;
      if (doc) {
        const [year, month, day] = data.fechaDictamen.split('-'); // YYYY-MM-DD
        const numeroDictamen = `${day}${month}${year}${doc}`; // ddMMyyyy + documento
        updateData.numeroDictamen = numeroDictamen;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No se enviaron campos para actualizar.' },
        { status: 400 },
      );
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

