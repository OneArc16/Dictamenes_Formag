import { NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';
import { parseSedeInput } from '@/lib/sedes/sedes';

export const runtime = 'nodejs';

function getAuditActor(payload: { name?: string; sub?: string }): string | null {
  const actor = String(payload.name ?? payload.sub ?? '').trim();
  return actor || null;
}

export async function POST(req: Request) {
  try {
    const auth = await requireAdminApi('admin.sedes.manage');
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const parsed = parseSedeInput(await req.json().catch(() => null));
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }

    const centro = await prisma.centroMedico.findUnique({
      where: { id: parsed.data.centroMedicoId },
      select: { id: true },
    });
    if (!centro) {
      return NextResponse.json({ ok: false, error: 'Centro médico no encontrado' }, { status: 400 });
    }

    const existing = await prisma.sede.findFirst({
      where: {
        centroMedicoId: parsed.data.centroMedicoId,
        nombre: { equals: parsed.data.nombre, mode: 'insensitive' },
      },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: `Ya existe una sede con ese nombre (ID ${existing.id})` },
        { status: 409 },
      );
    }

    const actor = getAuditActor(auth.payload);
    const created = await prisma.sede.create({
      data: { ...parsed.data, createdBy: actor, updatedBy: actor },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (error) {
    console.error('ERROR POST /api/admin/sedes:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error creando sede' },
      { status: 500 },
    );
  }
}
