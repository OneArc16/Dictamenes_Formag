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
          nombreCompleto: `${docente.primerNombre} ${docente.primerApellido}`,
          edad: docente.edad,
          sexo: docente.sexo,
          secretaria: docente.secretariaRef?.nombre ?? null,
          institucion: docente.institucionEducativaRef?.nombre ?? null,
        },

        medico: medico
          ? {
              id: medico.id,
              nombreCompleto: `${medico.primerNombre} ${medico.primerApellido}`,
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
      select: { empleadoId: true },
    });

    if (!existing || existing.empleadoId !== medicoId) {
      return NextResponse.json(
        { ok: false, error: 'No tiene permiso sobre este dictamen.' },
        { status: 403 },
      );
    }

    const updated = await prisma.dictamen.update({
      where: { id },
      data: {
        antecedentesClinicos: data.antecedentesClinicos ?? null,
        condicionSalud: data.condicionSalud ?? null,
        descripcionHallazgos: data.descripcionHallazgos ?? null,
      },
      select: { id: true },
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
