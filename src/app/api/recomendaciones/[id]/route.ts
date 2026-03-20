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

type EspecialidadItem = {
  principal: boolean | null;
  especialidad: {
    nombre: string | null;
  } | null;
};

type EmpleadoLike = {
  especialidades?: EspecialidadItem[] | null;
};

const UpdateRecomendacionSchema = z.object({
  tallaM: z.string().nullable().optional(),
  pesoKg: z.string().nullable().optional(),
  examenesRealizados: z.string().optional(),
  motivo: z.string().optional(),
  recomendacionesObservacionesRestricciones: z.string().optional(),
});

const CloseRecomendacionSchema = z.object({
  action: z.literal('cerrar'),
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

function normalizeSpecialtyName(value: string | null | undefined) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function hasMedicinaLaboralSpecialty(empleado: EmpleadoLike | null | undefined) {
  const items = Array.isArray(empleado?.especialidades) ? empleado.especialidades : [];
  return items.some((item) =>
    normalizeSpecialtyName(item?.especialidad?.nombre).includes('MEDICINA LABORAL'),
  );
}

function fullName(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

async function loadEditableRecomendacion(recomendacionId: number) {
  return prisma.recomendacionLaboral.findUnique({
    where: { id: recomendacionId },
    select: {
      id: true,
      empleadoId: true,
      estado: true,
    },
  });
}

function canManageRecomendacion(
  recomendacion: { empleadoId: number | null; estado: string } | null,
  auth: AuthCtx,
) {
  if (!recomendacion) {
    return { ok: false, status: 404, error: 'Recomendacion no encontrada.' };
  }

  if (
    recomendacion.empleadoId != null &&
    recomendacion.empleadoId !== auth.empleadoId
  ) {
    return { ok: false, status: 403, error: 'No tiene permiso sobre esta recomendacion.' };
  }

  return { ok: true as const };
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
    const hasExamenesRealizados = 'examenesRealizados' in body;
    const hasMotivo = 'motivo' in body;
    const hasRecomendacionesObservacionesRestricciones =
      'recomendacionesObservacionesRestricciones' in body;

    if (
      !hasAntropometria &&
      !hasExamenesRealizados &&
      !hasMotivo &&
      !hasRecomendacionesObservacionesRestricciones
    ) {
      return NextResponse.json(
        { ok: false, error: 'No se enviaron datos para actualizar.' },
        { status: 400 },
      );
    }

    const recomendacion = await loadEditableRecomendacion(recomendacionId);
    const permission = canManageRecomendacion(recomendacion, auth);
    if (!permission.ok) {
      return NextResponse.json({ ok: false, error: permission.error }, { status: permission.status });
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
      examenesRealizados?: string | null;
      motivo?: string | null;
      recomendacionesObservacionesRestricciones?: string | null;
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

    if (hasExamenesRealizados) {
      updateData.examenesRealizados = normalizeTextValue(body.examenesRealizados);
    }

    if (hasMotivo) {
      updateData.motivo = normalizeTextValue(body.motivo);
    }

    if (hasRecomendacionesObservacionesRestricciones) {
      updateData.recomendacionesObservacionesRestricciones = normalizeTextValue(
        body.recomendacionesObservacionesRestricciones,
      );
    }

    const updated = await prisma.recomendacionLaboral.update({
      where: { id: recomendacionId },
      data: updateData,
      select: {
        id: true,
        tallaM: true,
        pesoKg: true,
        imc: true,
        examenesRealizados: true,
        motivo: true,
        recomendacionesObservacionesRestricciones: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      recomendacion: {
        id: updated.id,
        tallaM: updated.tallaM != null ? String(updated.tallaM) : null,
        pesoKg: updated.pesoKg != null ? String(updated.pesoKg) : null,
        imc: updated.imc != null ? String(updated.imc) : null,
        examenesRealizados: updated.examenesRealizados ?? '',
        motivo: updated.motivo ?? '',
        recomendacionesObservacionesRestricciones:
          updated.recomendacionesObservacionesRestricciones ?? '',
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

export async function POST(req: Request, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

    if (auth.role !== 'MEDICO') {
      return NextResponse.json(
        { ok: false, error: 'No autorizado para cerrar esta recomendacion.' },
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

    CloseRecomendacionSchema.parse(await req.json());

    const recomendacion = await loadEditableRecomendacion(recomendacionId);
    const permission = canManageRecomendacion(recomendacion, auth);
    if (!permission.ok) {
      return NextResponse.json({ ok: false, error: permission.error }, { status: permission.status });
    }

    if (recomendacion.estado !== 'BORRADOR') {
      return NextResponse.json(
        { ok: false, error: 'La recomendacion ya fue cerrada o anulada.' },
        { status: 409 },
      );
    }

    const closed = await prisma.$transaction(async (tx) => {
      const current = await tx.recomendacionLaboral.findUnique({
        where: { id: recomendacionId },
        include: {
          firmas: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!current) {
        throw new Error('Recomendacion no encontrada.');
      }

      const nextEmpleadoId = current.empleadoId ?? auth.empleadoId;

      const updated = await tx.recomendacionLaboral.update({
        where: { id: recomendacionId },
        data: {
          empleadoId: nextEmpleadoId,
          estado: 'CERRADA',
          cerradaEn: new Date(),
        },
        select: {
          id: true,
          estado: true,
          cerradaEn: true,
        },
      });

      if (current.firmas.length === 0) {
        const juntaMedica = await tx.empleado.findMany({
          where: {
            activo: true,
            esMiembroJunta: true,
          },
          include: {
            especialidades: {
              select: {
                principal: true,
                especialidad: {
                  select: {
                    nombre: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { primerApellido: 'asc' },
            { segundoApellido: 'asc' },
            { primerNombre: 'asc' },
            { segundoNombre: 'asc' },
          ],
        });

        const firmantes = juntaMedica.filter((empleado) =>
          hasMedicinaLaboralSpecialty(empleado),
        );

        if (firmantes.length > 0) {
          await tx.recomendacionLaboralFirma.createMany({
            data: firmantes.map((empleado, index) => ({
              recomendacionLaboralId: recomendacionId,
              empleadoId: empleado.id,
              nombreCompleto:
                fullName(
                  empleado.primerNombre,
                  empleado.segundoNombre,
                  empleado.primerApellido,
                  empleado.segundoApellido,
                ) || 'MEDICO SIN NOMBRE',
              registroMedico: empleado.registroMedico,
              licencia: empleado.licencia,
              firma: empleado.firma,
              firmaMime: empleado.firmaMime,
              orden: index + 1,
            })),
          });
        }
      }

      return updated;
    });

    return NextResponse.json({
      ok: true,
      recomendacion: {
        id: closed.id,
        estado: closed.estado,
        cerradaEn: closed.cerradaEn?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error('ERROR POST /api/recomendaciones/[id]:', error);

    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? 'Datos invalidos.'
        : error instanceof Error
          ? error.message
          : 'Error cerrando recomendacion';

    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
