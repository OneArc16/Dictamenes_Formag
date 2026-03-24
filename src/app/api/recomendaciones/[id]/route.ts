import { Prisma } from '@prisma/client';
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

const FORM_FIELDS = [
  'tallaM',
  'pesoKg',
  'imc',
  'examenesRealizados',
  'motivo',
  'recomendacionesObservacionesRestricciones',
] as const;

type FormField = (typeof FORM_FIELDS)[number];
type FormSnapshot = Record<FormField, string | null>;

type PermissionResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

type ManagedRecomendacion = NonNullable<Awaited<ReturnType<typeof loadManagedRecomendacion>>>;

const UpdateRecomendacionSchema = z.object({
  tallaM: z.string().nullable().optional(),
  pesoKg: z.string().nullable().optional(),
  examenesRealizados: z.string().optional(),
  motivo: z.string().optional(),
  recomendacionesObservacionesRestricciones: z.string().optional(),
});

const RecomendacionActionSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('cerrar'),
  }),
  z.object({
    action: z.literal('reabrir'),
    motivoReaperturaId: z.coerce.number().int().positive(),
  }),
]);

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

async function loadManagedRecomendacion(recomendacionId: number) {
  return prisma.recomendacionLaboral.findUnique({
    where: { id: recomendacionId },
    select: {
      id: true,
      empleadoId: true,
      estado: true,
      tallaM: true,
      pesoKg: true,
      imc: true,
      examenesRealizados: true,
      motivo: true,
      recomendacionesObservacionesRestricciones: true,
      cerradaEn: true,
      reabiertaEn: true,
      reabiertaPorId: true,
      motivoReaperturaId: true,
      updatedAt: true,
      firmas: {
        select: {
          id: true,
        },
      },
    },
  });
}

function isEditableState(estado: string) {
  return estado === 'BORRADOR' || estado === 'REABIERTO';
}

function canEditRecomendacion(
  recomendacion: ManagedRecomendacion,
  auth: AuthCtx,
): PermissionResult {
  if (auth.role !== 'MEDICO') {
    return {
      ok: false,
      status: 403,
      error: 'No autorizado para editar esta recomendacion.',
    };
  }

  if (
    recomendacion.empleadoId != null &&
    recomendacion.empleadoId !== auth.empleadoId
  ) {
    return {
      ok: false,
      status: 403,
      error: 'No tiene permiso sobre esta recomendacion.',
    };
  }

  return { ok: true };
}

function canReopenRecomendacion(
  recomendacion: ManagedRecomendacion,
  auth: AuthCtx,
): PermissionResult {
  if (auth.role === 'MEDICO') {
    if (
      recomendacion.empleadoId == null ||
      recomendacion.empleadoId !== auth.empleadoId
    ) {
      return {
        ok: false,
        status: 403,
        error: 'Solo puedes reabrir tus propias recomendaciones.',
      };
    }

    return { ok: true };
  }

  if (auth.role === 'ADMIN' || auth.role === 'ADMISIONISTA') {
    return { ok: true };
  }

  return {
    ok: false,
    status: 403,
    error: 'No autorizado para reabrir esta recomendacion.',
  };
}

function buildFormSnapshot(recomendacion: ManagedRecomendacion): FormSnapshot {
  return {
    tallaM: recomendacion.tallaM != null ? String(recomendacion.tallaM) : null,
    pesoKg: recomendacion.pesoKg != null ? String(recomendacion.pesoKg) : null,
    imc: recomendacion.imc != null ? String(recomendacion.imc) : null,
    examenesRealizados: recomendacion.examenesRealizados ?? null,
    motivo: recomendacion.motivo ?? null,
    recomendacionesObservacionesRestricciones:
      recomendacion.recomendacionesObservacionesRestricciones ?? null,
  };
}

function toJsonObject(value: Partial<FormSnapshot>): Prisma.InputJsonObject {
  return value as Prisma.InputJsonObject;
}

function getChangedFormSnapshots(before: FormSnapshot, after: FormSnapshot) {
  const previous: Partial<FormSnapshot> = {};
  const next: Partial<FormSnapshot> = {};

  for (const field of FORM_FIELDS) {
    if (before[field] !== after[field]) {
      previous[field] = before[field];
      next[field] = after[field];
    }
  }

  if (Object.keys(previous).length === 0) {
    return null;
  }

  return {
    previous: toJsonObject(previous),
    next: toJsonObject(next),
  };
}

async function ensureLaboralFirmas(
  tx: Prisma.TransactionClient,
  recomendacionId: number,
  currentFirmasCount: number,
) {
  if (currentFirmasCount > 0) {
    return;
  }

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

  const firmantes = juntaMedica.filter((empleado) => hasMedicinaLaboralSpecialty(empleado));

  if (firmantes.length === 0) {
    return;
  }

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

function serializeRecomendacionResponse(
  recomendacion: Pick<
    ManagedRecomendacion,
    | 'id'
    | 'estado'
    | 'tallaM'
    | 'pesoKg'
    | 'imc'
    | 'examenesRealizados'
    | 'motivo'
    | 'recomendacionesObservacionesRestricciones'
    | 'cerradaEn'
    | 'reabiertaEn'
    | 'updatedAt'
  >,
) {
  return {
    id: recomendacion.id,
    estado: recomendacion.estado,
    tallaM: recomendacion.tallaM != null ? String(recomendacion.tallaM) : null,
    pesoKg: recomendacion.pesoKg != null ? String(recomendacion.pesoKg) : null,
    imc: recomendacion.imc != null ? String(recomendacion.imc) : null,
    examenesRealizados: recomendacion.examenesRealizados ?? '',
    motivo: recomendacion.motivo ?? '',
    recomendacionesObservacionesRestricciones:
      recomendacion.recomendacionesObservacionesRestricciones ?? '',
    cerradaEn: recomendacion.cerradaEn?.toISOString() ?? null,
    reabiertaEn: recomendacion.reabiertaEn?.toISOString() ?? null,
    updatedAt: recomendacion.updatedAt.toISOString(),
  };
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const auth = await requireAuth();
    if (!auth) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
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

    const recomendacion = await loadManagedRecomendacion(recomendacionId);
    if (!recomendacion) {
      return NextResponse.json(
        { ok: false, error: 'Recomendacion no encontrada.' },
        { status: 404 },
      );
    }

    const permission = canEditRecomendacion(recomendacion, auth);
    if (!permission.ok) {
      return NextResponse.json({ ok: false, error: permission.error }, { status: permission.status });
    }

    if (!isEditableState(recomendacion.estado)) {
      return NextResponse.json(
        { ok: false, error: 'La recomendacion ya no admite cambios.' },
        { status: 409 },
      );
    }

    const beforeSnapshot = buildFormSnapshot(recomendacion);
    const nextSnapshot: FormSnapshot = { ...beforeSnapshot };

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

      const imc = computeImc(tallaM, pesoKg);

      updateData.tallaM = tallaM;
      updateData.pesoKg = pesoKg;
      updateData.imc = imc;

      nextSnapshot.tallaM = tallaM;
      nextSnapshot.pesoKg = pesoKg;
      nextSnapshot.imc = imc;
    }

    if (hasExamenesRealizados) {
      const normalized = normalizeTextValue(body.examenesRealizados);
      updateData.examenesRealizados = normalized;
      nextSnapshot.examenesRealizados = normalized;
    }

    if (hasMotivo) {
      const normalized = normalizeTextValue(body.motivo);
      updateData.motivo = normalized;
      nextSnapshot.motivo = normalized;
    }

    if (hasRecomendacionesObservacionesRestricciones) {
      const normalized = normalizeTextValue(body.recomendacionesObservacionesRestricciones);
      updateData.recomendacionesObservacionesRestricciones = normalized;
      nextSnapshot.recomendacionesObservacionesRestricciones = normalized;
    }

    const changedSnapshots = getChangedFormSnapshots(beforeSnapshot, nextSnapshot);
    const needsAssignment = updateData.empleadoId != null;

    if (!changedSnapshots && !needsAssignment) {
      return NextResponse.json({
        ok: true,
        recomendacion: serializeRecomendacionResponse(recomendacion),
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.recomendacionLaboral.update({
        where: { id: recomendacionId },
        data: updateData,
        select: {
          id: true,
          estado: true,
          tallaM: true,
          pesoKg: true,
          imc: true,
          examenesRealizados: true,
          motivo: true,
          recomendacionesObservacionesRestricciones: true,
          cerradaEn: true,
          reabiertaEn: true,
          updatedAt: true,
        },
      });

      if (changedSnapshots) {
        await tx.recomendacionLaboralHistorial.create({
          data: {
            recomendacionLaboralId: recomendacionId,
            empleadoId: auth.empleadoId,
            tipo: 'EDICION',
            estadoAnterior: recomendacion.estado,
            estadoNuevo: recomendacion.estado,
            formularioAnterior: changedSnapshots.previous,
            formularioNuevo: changedSnapshots.next,
          },
        });
      }

      return next;
    });

    return NextResponse.json({
      ok: true,
      recomendacion: serializeRecomendacionResponse(updated),
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

    const { id: idParam } = await context.params;
    const recomendacionId = Number(idParam);

    if (!Number.isFinite(recomendacionId) || recomendacionId <= 0) {
      return NextResponse.json(
        { ok: false, error: 'ID de recomendacion invalido.' },
        { status: 400 },
      );
    }

    const body = RecomendacionActionSchema.parse(await req.json());
    const recomendacion = await loadManagedRecomendacion(recomendacionId);

    if (!recomendacion) {
      return NextResponse.json(
        { ok: false, error: 'Recomendacion no encontrada.' },
        { status: 404 },
      );
    }

    if (body.action === 'cerrar') {
      const permission = canEditRecomendacion(recomendacion, auth);
      if (!permission.ok) {
        return NextResponse.json({ ok: false, error: permission.error }, { status: permission.status });
      }

      if (!isEditableState(recomendacion.estado)) {
        return NextResponse.json(
          { ok: false, error: 'La recomendacion ya fue cerrada o anulada.' },
          { status: 409 },
        );
      }

      const currentSnapshot = buildFormSnapshot(recomendacion);

      const closed = await prisma.$transaction(async (tx) => {
        const nextEmpleadoId = recomendacion.empleadoId ?? auth.empleadoId;

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
            tallaM: true,
            pesoKg: true,
            imc: true,
            examenesRealizados: true,
            motivo: true,
            recomendacionesObservacionesRestricciones: true,
            cerradaEn: true,
            reabiertaEn: true,
            updatedAt: true,
          },
        });

        await tx.recomendacionLaboralHistorial.create({
          data: {
            recomendacionLaboralId: recomendacionId,
            empleadoId: auth.empleadoId,
            tipo: 'CIERRE',
            estadoAnterior: recomendacion.estado,
            estadoNuevo: 'CERRADA',
            formularioAnterior: toJsonObject(currentSnapshot),
            formularioNuevo: toJsonObject(currentSnapshot),
          },
        });

        await ensureLaboralFirmas(tx, recomendacionId, recomendacion.firmas.length);

        return updated;
      });

      return NextResponse.json({
        ok: true,
        recomendacion: serializeRecomendacionResponse(closed),
      });
    }

    const permission = canReopenRecomendacion(recomendacion, auth);
    if (!permission.ok) {
      return NextResponse.json({ ok: false, error: permission.error }, { status: permission.status });
    }

    if (recomendacion.estado !== 'CERRADA') {
      return NextResponse.json(
        { ok: false, error: 'Solo se pueden reabrir recomendaciones cerradas.' },
        { status: 409 },
      );
    }

    const motivoReapertura = await prisma.motivoReaperturaRecomendacion.findFirst({
      where: {
        id: body.motivoReaperturaId,
        estado: true,
      },
      select: {
        id: true,
        nombre: true,
      },
    });

    if (!motivoReapertura) {
      return NextResponse.json(
        { ok: false, error: 'El motivo de reapertura no existe o esta inactivo.' },
        { status: 404 },
      );
    }

    const currentSnapshot = buildFormSnapshot(recomendacion);

    const reopened = await prisma.$transaction(async (tx) => {
      const updated = await tx.recomendacionLaboral.update({
        where: { id: recomendacionId },
        data: {
          estado: 'REABIERTO',
          reabiertaEn: new Date(),
          reabiertaPorId: auth.empleadoId,
          motivoReaperturaId: motivoReapertura.id,
        },
        select: {
          id: true,
          estado: true,
          tallaM: true,
          pesoKg: true,
          imc: true,
          examenesRealizados: true,
          motivo: true,
          recomendacionesObservacionesRestricciones: true,
          cerradaEn: true,
          reabiertaEn: true,
          updatedAt: true,
        },
      });

      await tx.recomendacionLaboralHistorial.create({
        data: {
          recomendacionLaboralId: recomendacionId,
          empleadoId: auth.empleadoId,
          motivoReaperturaId: motivoReapertura.id,
          tipo: 'REAPERTURA',
          estadoAnterior: recomendacion.estado,
          estadoNuevo: 'REABIERTO',
          formularioAnterior: toJsonObject(currentSnapshot),
          formularioNuevo: toJsonObject(currentSnapshot),
        },
      });

      return updated;
    });

    return NextResponse.json({
      ok: true,
      recomendacion: serializeRecomendacionResponse(reopened),
      motivoReapertura: motivoReapertura.nombre,
    });
  } catch (error) {
    console.error('ERROR POST /api/recomendaciones/[id]:', error);

    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? 'Datos invalidos.'
        : error instanceof Error
          ? error.message
          : 'Error actualizando recomendacion';

    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
