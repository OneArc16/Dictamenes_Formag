import { NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';
import { parseMotivoReaperturaInput } from '@/lib/recomendaciones/motivos-reapertura';

export const runtime = 'nodejs';

function getAuditActor(payload: { name?: string; sub?: string }): string | null {
  const actor = String(payload.name ?? payload.sub ?? '').trim();
  return actor || null;
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdminApi();
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => null);
    const parsed = parseMotivoReaperturaInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }

    const existing = await prisma.motivoReaperturaRecomendacion.findFirst({
      where: {
        nombre: {
          equals: parsed.data.nombre,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: `Ya existe un motivo con ese nombre (ID ${existing.id})` },
        { status: 409 },
      );
    }

    const actor = getAuditActor(auth.payload);

    const created = await prisma.motivoReaperturaRecomendacion.create({
      data: {
        ...parsed.data,
        createdBy: actor,
        updatedBy: actor,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (error) {
    console.error('ERROR POST /api/admin/motivos-reapertura:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Error creando motivo de reapertura',
      },
      { status: 500 },
    );
  }
}
