import { NextResponse } from 'next/server';

import { requireAbilityApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAbilityApi('admin.perfiles.manage');
    if (!authResult.ok) {
      return NextResponse.json({ ok: false, error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const perfilId = Number(id);

    if (!Number.isFinite(perfilId)) {
      return NextResponse.json({ ok: false, error: 'ID invalido' }, { status: 400 });
    }

    const current = await prisma.perfil.findUnique({
      where: { id: perfilId },
      select: { id: true, estado: true },
    });

    if (!current) {
      return NextResponse.json({ ok: false, error: 'Perfil no encontrado' }, { status: 404 });
    }

    const nextEstado = current.estado === 1 ? 0 : 1;

    const updated = await prisma.perfil.update({
      where: { id: perfilId },
      data: { estado: nextEstado },
      select: { id: true, estado: true },
    });

    return NextResponse.json({ ok: true, id: updated.id, estado: updated.estado });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error actualizando perfil' },
      { status: 500 },
    );
  }
}
