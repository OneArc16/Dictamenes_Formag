import { NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';
import { parseMotivoReaperturaEstado } from '@/lib/recomendaciones/motivos-reapertura';

export const runtime = 'nodejs';

function getAuditActor(payload: { name?: string; sub?: string }): string | null {
  const actor = String(payload.name ?? payload.sub ?? '').trim();
  return actor || null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireAdminApi();
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const motivoId = Number(id);
    if (!Number.isFinite(motivoId)) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const parsed = parseMotivoReaperturaEstado(body);
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }

    const current = await prisma.motivoReaperturaRecomendacion.findUnique({
      where: { id: motivoId },
      select: { id: true },
    });

    if (!current) {
      return NextResponse.json({ ok: false, error: 'Motivo no encontrado' }, { status: 404 });
    }

    const updated = await prisma.motivoReaperturaRecomendacion.update({
      where: { id: motivoId },
      data: {
        estado: parsed.data.estado,
        updatedBy: getAuditActor(auth.payload),
      },
      select: { id: true, estado: true },
    });

    return NextResponse.json({ ok: true, motivo: updated });
  } catch (error) {
    console.error('ERROR PATCH /api/admin/motivos-reapertura/[id]/estado:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Error actualizando estado',
      },
      { status: 500 },
    );
  }
}
