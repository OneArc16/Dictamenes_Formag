import { NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';
import { parseSedeEstado } from '@/lib/sedes/sedes';

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
    const auth = await requireAdminApi('admin.sedes.manage');
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const sedeId = Number(id);
    if (!Number.isInteger(sedeId)) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const parsed = parseSedeEstado(await req.json().catch(() => null));
    if (!parsed.ok) {
      return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    }

    const current = await prisma.sede.findUnique({ where: { id: sedeId }, select: { id: true } });
    if (!current) {
      return NextResponse.json({ ok: false, error: 'Sede no encontrada' }, { status: 404 });
    }

    const updated = await prisma.sede.update({
      where: { id: sedeId },
      data: { estado: parsed.data.estado, updatedBy: getAuditActor(auth.payload) },
      select: { id: true, estado: true },
    });

    return NextResponse.json({ ok: true, sede: updated });
  } catch (error) {
    console.error('ERROR PATCH /api/admin/sedes/[id]/estado:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error actualizando estado' },
      { status: 500 },
    );
  }
}
