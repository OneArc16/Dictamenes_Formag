import { NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';
import { parseMotivoReaperturaInput } from '@/lib/recomendaciones/motivos-reapertura';

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
    const auth = await requireAdminApi('admin.motivos_reapertura.manage');
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const motivoId = Number(id);
    if (!Number.isFinite(motivoId)) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const parsed = parseMotivoReaperturaInput(body);
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }

    const current = await prisma.motivoReapertura.findUnique({
      where: { id: motivoId },
      select: { id: true },
    });

    if (!current) {
      return NextResponse.json({ ok: false, error: 'Motivo no encontrado' }, { status: 404 });
    }

    const existing = await prisma.motivoReapertura.findFirst({
      where: {
        nombre: {
          equals: parsed.data.nombre,
          mode: 'insensitive',
        },
        NOT: { id: motivoId },
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: `Ya existe otro motivo con ese nombre (ID ${existing.id})` },
        { status: 409 },
      );
    }

    const { alcances, ...data } = parsed.data;
    const updated = await prisma.$transaction(async (tx) => {
      await tx.motivoReaperturaAlcance.deleteMany({
        where: { motivoReaperturaId: motivoId },
      });
      return tx.motivoReapertura.update({
        where: { id: motivoId },
        data: {
          ...data,
          updatedBy: getAuditActor(auth.payload),
          alcances: {
            create: alcances.map((alcance) => ({ alcance })),
          },
        },
        select: { id: true },
      });
    });

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (error) {
    console.error('ERROR PATCH /api/admin/motivos-reapertura/[id]:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Error actualizando motivo de reapertura',
      },
      { status: 500 },
    );
  }
}

