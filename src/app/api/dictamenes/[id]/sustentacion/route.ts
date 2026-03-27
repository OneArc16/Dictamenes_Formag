import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { type Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import {
  buildDictamenHistoryChanges,
  buildDictamenHistorySnapshot,
  parseDictamenHistorySnapshot,
  resolveDictamenEstadoHistorial,
} from '@/lib/dictamen/historial';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

type SustentacionBody = {
  sustentacionObservaciones?: unknown;
};

function normalizeRole(role: unknown): string {
  const normalized = String(role ?? '').trim().toUpperCase();

  if (normalized === 'ADMINISTRADOR') return 'ADMIN';
  if (normalized === 'ADMICIONES' || normalized === 'ADMISIONES') return 'ADMISIONISTA';

  return normalized;
}

function canReadDictamen(role: string) {
  return role === 'MEDICO' || role === 'ADMIN' || role === 'ADMISIONISTA';
}

function canEditDictamen(dictamen: { empleadoId: number | null }, auth: AuthCtx) {
  if (auth.role !== 'MEDICO') {
    return {
      ok: false as const,
      status: 403,
      error: 'No autorizado para editar este dictamen.',
    };
  }

  if (dictamen.empleadoId != null && dictamen.empleadoId !== auth.empleadoId) {
    return {
      ok: false as const,
      status: 403,
      error: 'No tiene permiso sobre este dictamen.',
    };
  }

  return { ok: true as const };
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

async function readBody(request: NextRequest): Promise<SustentacionBody | null> {
  try {
    return (await request.json()) as SustentacionBody;
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthFromToken();
    if (!auth) {
      return NextResponse.json({ ok: false, message: 'No autenticado' }, { status: 401 });
    }

    if (!canReadDictamen(auth.role)) {
      return NextResponse.json({ ok: false, message: 'No autorizado' }, { status: 403 });
    }

    const { id } = await context.params;
    const dictamenId = Number(id);

    if (!Number.isFinite(dictamenId) || dictamenId <= 0) {
      return NextResponse.json({ ok: false, message: 'id invalido' }, { status: 400 });
    }

    const where: { id: number; empleadoId?: number } = { id: dictamenId };
    if (auth.role === 'MEDICO') {
      where.empleadoId = auth.empleadoId;
    }

    const dictamen = await prisma.dictamen.findFirst({
      where,
      select: {
        id: true,
        sustentacionObservaciones: true,
        updatedAt: true,
      },
    });

    if (!dictamen) {
      return NextResponse.json({ ok: false, message: 'Dictamen no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      dictamenId,
      sustentacionObservaciones: dictamen.sustentacionObservaciones ?? '',
      updatedAt: dictamen.updatedAt?.toISOString?.() ?? undefined,
    });
  } catch (error: unknown) {
    console.error('ERROR GET sustentacion:', error);
    const message = error instanceof Error ? error.message : 'Error consultando sustentacion';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthFromToken();
    if (!auth) {
      return NextResponse.json({ ok: false, message: 'No autenticado' }, { status: 401 });
    }

    const { id } = await context.params;
    const dictamenId = Number(id);

    if (!Number.isFinite(dictamenId) || dictamenId <= 0) {
      return NextResponse.json({ ok: false, message: 'id invalido' }, { status: 400 });
    }

    const rawBody = await readBody(req);
    const text = String(rawBody?.sustentacionObservaciones ?? '');

    const current = await prisma.dictamen.findUnique({
      where: { id: dictamenId },
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
      },
    });

    if (!current) {
      return NextResponse.json({ ok: false, message: 'Dictamen no encontrado' }, { status: 404 });
    }

    const permission = canEditDictamen(current, auth);
    if (!permission.ok) {
      return NextResponse.json({ ok: false, message: permission.error }, { status: permission.status });
    }

    if (current.estado === false && current.reabierto === false) {
      return NextResponse.json(
        { ok: false, message: 'El dictamen esta CERRADO y no se puede editar.' },
        { status: 409 },
      );
    }

    const previousJson = buildDictamenHistorySnapshot(current);
    const nextJson = buildDictamenHistorySnapshot({
      ...current,
      sustentacionObservaciones: text,
    });

    const changes = buildDictamenHistoryChanges(
      parseDictamenHistorySnapshot(previousJson as unknown as Prisma.JsonValue),
      parseDictamenHistorySnapshot(nextJson as unknown as Prisma.JsonValue),
    );

    if (changes.length === 0) {
      return NextResponse.json({
        ok: true,
        dictamenId,
        sustentacionObservaciones: current.sustentacionObservaciones ?? '',
        message: 'Sin cambios por guardar',
      });
    }

    const estadoActual = resolveDictamenEstadoHistorial(current);

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.dictamen.update({
        where: { id: dictamenId },
        data: { sustentacionObservaciones: text },
        select: { id: true, sustentacionObservaciones: true, updatedAt: true },
      });

      await tx.dictamenHistorial.create({
        data: {
          dictamenId,
          empleadoId: auth.empleadoId,
          tipo: 'EDICION',
          estadoAnterior: estadoActual,
          estadoNuevo: estadoActual,
          formularioAnterior: previousJson,
          formularioNuevo: nextJson,
        },
      });

      return next;
    });

    return NextResponse.json({
      ok: true,
      dictamenId,
      sustentacionObservaciones: updated.sustentacionObservaciones ?? '',
      updatedAt: updated.updatedAt?.toISOString?.() ?? undefined,
      message: 'Sustentacion guardada',
    });
  } catch (error: unknown) {
    console.error('ERROR PUT sustentacion:', error);
    const message = error instanceof Error ? error.message : 'Error guardando sustentacion';
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
