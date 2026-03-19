import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';

type JwtPayload = {
  sub: string;
  role?: string;
  name?: string;
  [key: string]: unknown;
};

type AuthCtx = {
  empleadoId: number;
  role: string;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

const UpdateExamenSchema = z.object({
  nombre: z.string().optional(),
  resultado: z.string().nullable().optional(),
  observacion: z.string().nullable().optional(),
  fechaExamen: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
});

const UpdateRecomendacionSchema = z.object({
  tallaM: z.string().nullable().optional(),
  pesoKg: z.string().nullable().optional(),
  concepto: z.string().optional(),
  examenes: z.array(UpdateExamenSchema).optional(),
});

function normalizeRole(role: unknown): string {
  const normalized = String(role ?? '').trim().toUpperCase();

  if (normalized === 'ADMINISTRADOR') return 'ADMIN';
  if (normalized === 'ADMICIONES' || normalized === 'ADMISIONES') return 'ADMISIONISTA';

  return normalized;
}

async function requireAuth(): Promise<AuthCtx | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;

  const payload = (await verifyJwt(token)) as JwtPayload | null;
  if (!payload?.sub) return null;

  const empleadoId = Number(payload.sub);
  if (!Number.isFinite(empleadoId) || empleadoId <= 0) return null;

  return {
    empleadoId,
    role: normalizeRole(payload.role),
  };
}

function sanitizeDecimalValue(
  value: string | null | undefined,
  maxIntegerDigits: number,
): string | null {
  if (value == null) return null;

  const normalized = value.trim().replace(',', '.').replace(/[^\d.]/g, '');
  if (!normalized) return null;

  const [wholeRaw, ...decimalParts] = normalized.split('.');
  const whole = wholeRaw.slice(0, maxIntegerDigits);
  const decimal = decimalParts.join('').slice(0, 2);

  if (!whole && !decimal) return null;
  if (!decimal) return whole;

  return `${whole || '0'}.${decimal}`;
}

function validateTalla(value: string | null) {
  if (value == null) return null;

  const talla = Number(value);
  if (!Number.isFinite(talla) || talla <= 0 || talla > 3) {
    return 'La talla debe estar entre 0.01 m y 3.00 m.';
  }

  return null;
}

function validatePeso(value: string | null) {
  if (value == null) return null;

  const peso = Number(value);
  if (!Number.isFinite(peso) || peso <= 0 || peso > 500) {
    return 'El peso debe estar entre 0.01 kg y 500.00 kg.';
  }

  return null;
}

function computeImc(tallaM: string | null, pesoKg: string | null): string | null {
  if (!tallaM || !pesoKg) return null;

  const talla = Number(tallaM);
  const peso = Number(pesoKg);
  if (!Number.isFinite(talla) || !Number.isFinite(peso) || talla <= 0 || peso <= 0) {
    return null;
  }

  const imc = Math.round((peso / (talla * talla)) * 100) / 100;
  return imc.toFixed(2);
}

function normalizeTextValue(value: string | null | undefined): string | null {
  if (value == null) return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function toColombiaMidnightUTC(value: string) {
  return new Date(`${value}T05:00:00.000Z`);
}

function normalizeExamenes(examenes: z.infer<typeof UpdateExamenSchema>[]) {
  const normalized: Array<{
    nombre: string;
    resultado: string | null;
    observacion: string | null;
    fechaExamen: Date | null;
    orden: number;
  }> = [];

  for (const examen of examenes) {
    const nombre = normalizeTextValue(examen.nombre) ?? '';
    const resultado = normalizeTextValue(examen.resultado);
    const observacion = normalizeTextValue(examen.observacion);
    const fechaExamenRaw = normalizeTextValue(examen.fechaExamen);

    const hasContent = Boolean(nombre || resultado || observacion || fechaExamenRaw);
    if (!hasContent) {
      continue;
    }

    if (!nombre) {
      throw new Error('Cada examen diligenciado debe tener nombre.');
    }

    const fechaExamen = fechaExamenRaw ? toColombiaMidnightUTC(fechaExamenRaw) : null;
    if (fechaExamenRaw && Number.isNaN(fechaExamen?.getTime())) {
      throw new Error(`La fecha del examen ${nombre} no es valida.`);
    }

    normalized.push({
      nombre,
      resultado,
      observacion,
      fechaExamen,
      orden: normalized.length + 1,
    });
  }

  return normalized;
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

    if (auth.role !== 'MEDICO') {
      return NextResponse.json(
        { ok: false, error: 'No autorizado para editar esta recomendacion.' },
        { status: 403 },
      );
    }

    const { id: idParam } = await context.params;
    const recomendacionId = Number(idParam);

    if (!Number.isFinite(recomendacionId) || recomendacionId <= 0) {
      return NextResponse.json(
        { ok: false, error: 'ID de recomendacion invalido.' },
        { status: 400 },
      );
    }

    const body = UpdateRecomendacionSchema.parse(await req.json());

    const hasAntropometria = 'tallaM' in body || 'pesoKg' in body;
    const hasConcepto = 'concepto' in body;
    const hasExamenes = 'examenes' in body;

    if (!hasAntropometria && !hasConcepto && !hasExamenes) {
      return NextResponse.json(
        { ok: false, error: 'No se enviaron datos para actualizar.' },
        { status: 400 },
      );
    }

    const recomendacion = await prisma.recomendacionLaboral.findUnique({
      where: { id: recomendacionId },
      select: {
        id: true,
        empleadoId: true,
        estado: true,
      },
    });

    if (!recomendacion) {
      return NextResponse.json(
        { ok: false, error: 'Recomendacion no encontrada.' },
        { status: 404 },
      );
    }

    if (
      recomendacion.empleadoId != null &&
      recomendacion.empleadoId !== auth.empleadoId
    ) {
      return NextResponse.json(
        { ok: false, error: 'No tiene permiso sobre esta recomendacion.' },
        { status: 403 },
      );
    }

    if (recomendacion.estado !== 'BORRADOR') {
      return NextResponse.json(
        { ok: false, error: 'La recomendacion ya no admite cambios.' },
        { status: 409 },
      );
    }

    const updateData: {
      empleadoId?: number;
      tallaM?: string | null;
      pesoKg?: string | null;
      imc?: string | null;
      concepto?: string | null;
    } = {};

    if (recomendacion.empleadoId == null) {
      updateData.empleadoId = auth.empleadoId;
    }

    if (hasAntropometria) {
      const tallaM = sanitizeDecimalValue(body.tallaM, 2);
      const pesoKg = sanitizeDecimalValue(body.pesoKg, 3);

      const tallaError = validateTalla(tallaM);
      if (tallaError) {
        return NextResponse.json({ ok: false, error: tallaError }, { status: 400 });
      }

      const pesoError = validatePeso(pesoKg);
      if (pesoError) {
        return NextResponse.json({ ok: false, error: pesoError }, { status: 400 });
      }

      updateData.tallaM = tallaM;
      updateData.pesoKg = pesoKg;
      updateData.imc = computeImc(tallaM, pesoKg);
    }

    if (hasConcepto) {
      updateData.concepto = normalizeTextValue(body.concepto);
    }

    const normalizedExamenes = hasExamenes
      ? normalizeExamenes(body.examenes ?? [])
      : null;

    const updated = await prisma.$transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx.recomendacionLaboral.update({
          where: { id: recomendacionId },
          data: updateData,
        });
      }

      if (normalizedExamenes) {
        await tx.recomendacionLaboralExamen.deleteMany({
          where: { recomendacionLaboralId: recomendacionId },
        });

        if (normalizedExamenes.length > 0) {
          await tx.recomendacionLaboralExamen.createMany({
            data: normalizedExamenes.map((examen) => ({
              recomendacionLaboralId: recomendacionId,
              nombre: examen.nombre,
              resultado: examen.resultado,
              observacion: examen.observacion,
              fechaExamen: examen.fechaExamen,
              orden: examen.orden,
            })),
          });
        }
      }

      return tx.recomendacionLaboral.findUnique({
        where: { id: recomendacionId },
        select: {
          id: true,
          tallaM: true,
          pesoKg: true,
          imc: true,
          concepto: true,
          updatedAt: true,
          examenes: {
            orderBy: { orden: 'asc' },
            select: {
              id: true,
              nombre: true,
              resultado: true,
              observacion: true,
              fechaExamen: true,
            },
          },
        },
      });
    });

    if (!updated) {
      return NextResponse.json(
        { ok: false, error: 'No se pudo cargar la recomendacion actualizada.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      recomendacion: {
        id: updated.id,
        tallaM: updated.tallaM != null ? String(updated.tallaM) : null,
        pesoKg: updated.pesoKg != null ? String(updated.pesoKg) : null,
        imc: updated.imc != null ? String(updated.imc) : null,
        concepto: updated.concepto ?? '',
        examenes: updated.examenes.map((examen) => ({
          id: examen.id,
          nombre: examen.nombre,
          resultado: examen.resultado ?? '',
          observacion: examen.observacion ?? '',
          fechaExamen: examen.fechaExamen
            ? examen.fechaExamen.toISOString().slice(0, 10)
            : '',
        })),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('ERROR PUT /api/recomendaciones/[id]:', error);

    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? 'Datos invalidos.'
        : error instanceof Error
        ? error.message
        : 'Error actualizando recomendacion';

    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
