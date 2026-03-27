import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';

type JwtPayload = {
  sub?: string;
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

const ReabrirDictamenSchema = z.object({
  motivoReaperturaId: z.coerce.number().int().positive(),
});

function normalizeRole(role: unknown): string {
  const normalized = String(role ?? '').trim().toUpperCase();

  if (normalized === 'ADMINISTRADOR') return 'ADMIN';
  if (normalized === 'ADMICIONES' || normalized === 'ADMISIONES') return 'ADMISIONISTA';

  return normalized;
}

async function getAuthFromToken(): Promise<AuthCtx | null> {
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

function canReopen(role: string) {
  return role === 'ADMIN' || role === 'ADMISIONISTA';
}

async function loadManagedDictamen(dictamenId: number) {
  return prisma.dictamen.findUnique({
    where: { id: dictamenId },
    select: {
      id: true,
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
    },
  });
}

type ManagedDictamen = NonNullable<Awaited<ReturnType<typeof loadManagedDictamen>>>;

function resolveEstadoHistorial(dictamen: Pick<ManagedDictamen, 'estado' | 'reabierto'>) {
  if (!dictamen.estado) return 'CERRADO' as const;
  return dictamen.reabierto ? ('REABIERTO' as const) : ('PENDIENTE' as const);
}

function toIsoString(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function buildDictamenSnapshot(dictamen: ManagedDictamen): Prisma.InputJsonObject {
  return {
    numeroDictamen: dictamen.numeroDictamen ?? null,
    fechaDictamen: toIsoString(dictamen.fechaDictamen),
    procedimientoPcl: dictamen.procedimientoPcl ?? null,
    tipoDictamen: dictamen.tipoDictamen ?? null,
    antecedentesClinicos: dictamen.antecedentesClinicos ?? null,
    condicionSalud: dictamen.condicionSalud ?? null,
    descripcionHallazgos: dictamen.descripcionHallazgos ?? null,
    sustentacionObservaciones: dictamen.sustentacionObservaciones ?? null,
    fechaEstructuracionInvalidez: toIsoString(dictamen.fechaEstructuracionInvalidez),
    tipoEvento: dictamen.tipoEvento ?? null,
    origenEvento: dictamen.origenEvento ?? null,
    aplicaAnalisisOcupacional: dictamen.aplicaAnalisisOcupacional,
  } as Prisma.InputJsonObject;
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const auth = await getAuthFromToken();
    if (!auth) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

    if (!canReopen(auth.role)) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 403 });
    }

    const { id: idParam } = await context.params;
    const dictamenId = Number(idParam);

    if (!Number.isFinite(dictamenId) || dictamenId <= 0) {
      return NextResponse.json({ ok: false, error: 'ID invalido' }, { status: 400 });
    }

    const body = ReabrirDictamenSchema.parse(await req.json());
    const existing = await loadManagedDictamen(dictamenId);

    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Dictamen no encontrado' }, { status: 404 });
    }

    if (existing.estado === true) {
      return NextResponse.json(
        {
          ok: false,
          error: existing.reabierto
            ? 'El dictamen ya esta reabierto.'
            : 'El dictamen no esta cerrado, no se puede reabrir.',
        },
        { status: 409 },
      );
    }

    const motivoReapertura = await prisma.motivoReapertura.findFirst({
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

    const snapshot = buildDictamenSnapshot(existing);
    const estadoAnterior = resolveEstadoHistorial(existing);

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.dictamen.update({
        where: { id: dictamenId },
        data: {
          estado: true,
          reabierto: true,
          reabiertoEn: new Date(),
          reabiertoPorId: auth.empleadoId,
          motivoReaperturaId: motivoReapertura.id,
        },
        select: {
          id: true,
          estado: true,
          reabierto: true,
        },
      });

      await tx.dictamenHistorial.create({
        data: {
          dictamenId,
          empleadoId: auth.empleadoId,
          motivoReaperturaId: motivoReapertura.id,
          tipo: 'REAPERTURA',
          estadoAnterior,
          estadoNuevo: 'REABIERTO',
          formularioAnterior: snapshot,
          formularioNuevo: snapshot,
        },
      });

      return next;
    });

    return NextResponse.json({
      ok: true,
      dictamen: { id: updated.id, estado: 'REABIERTO' as const },
      motivoReapertura: motivoReapertura.nombre,
    });
  } catch (error) {
    console.error('ERROR POST /api/admisiones/dictamenes/[id]/reabrir:', error);

    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? 'Datos invalidos.'
        : error instanceof Error
          ? error.message
          : 'Error reabriendo dictamen';

    const status = error instanceof z.ZodError ? 400 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

