import { NextRequest, NextResponse } from 'next/server';
import { type Prisma } from '@prisma/client';

import { requireAbilityApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';
import {
  buildDictamenHistoryChanges,
  buildDictamenHistorySnapshot,
  parseDictamenHistorySnapshot,
  resolveDictamenEstadoHistorial,
} from '@/lib/dictamen/historial';
import { canEditDictamen } from '@/lib/dictamen/permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


type SustentacionBody = {
  sustentacionObservaciones?: unknown;
};

async function readBody(request: NextRequest): Promise<SustentacionBody | null> {
  try {
    return (await request.json()) as SustentacionBody;
  } catch {
    return null;
  }
}

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAbilityApi('dictamen.read');
    if (!authResult.ok) {
      return NextResponse.json({ ok: false, message: authResult.error }, { status: authResult.status });
    }

    const auth = authResult.auth;

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
    const authResult = await requireAbilityApi('dictamen.edit');
    if (!authResult.ok) {
      return NextResponse.json({ ok: false, message: authResult.error }, { status: authResult.status });
    }

    const auth = authResult.auth;

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
