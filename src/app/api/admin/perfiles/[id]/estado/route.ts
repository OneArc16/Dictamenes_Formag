import { NextResponse } from 'next/server';

import { requireAbilityApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function parseEstado(value: unknown): 0 | 1 | null {
  if (value === 1 || value === '1' || value === true) return 1;
  if (value === 0 || value === '0' || value === false) return 0;
  return null;
}

export async function PATCH(
  req: Request,
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

    const body = await req.json().catch(() => ({}));
    const estado = parseEstado(body?.estado);

    if (estado == null) {
      return NextResponse.json({ ok: false, error: 'Estado invalido (use 1/0)' }, { status: 400 });
    }

    const current = await prisma.perfil.findUnique({
      where: { id: perfilId },
      select: { id: true },
    });

    if (!current) {
      return NextResponse.json({ ok: false, error: 'Perfil no encontrado' }, { status: 404 });
    }

    const updated = await prisma.perfil.update({
      where: { id: perfilId },
      data: {
        estado,
        updatedBy: authResult.auth.name,
      },
      select: { id: true, estado: true },
    });

    return NextResponse.json({ ok: true, perfil: updated });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error actualizando estado' },
      { status: 500 },
    );
  }
}
