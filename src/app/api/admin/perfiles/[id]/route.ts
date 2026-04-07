import { NextResponse } from 'next/server';

import { requireAbilityApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const upper = (value: unknown) => String(value ?? '').trim().toUpperCase();

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
    const nombre = upper(body?.nombre);
    const estado = Number(body?.estado) === 0 ? 0 : 1;

    if (!nombre) {
      return NextResponse.json({ ok: false, error: 'Nombre es obligatorio' }, { status: 400 });
    }

    const current = await prisma.perfil.findUnique({
      where: { id: perfilId },
      select: { id: true },
    });

    if (!current) {
      return NextResponse.json({ ok: false, error: 'Perfil no encontrado' }, { status: 404 });
    }

    const existing = await prisma.perfil.findFirst({
      where: { nombre, NOT: { id: perfilId } },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: `Ya existe otro perfil con ese nombre (ID ${existing.id})` },
        { status: 409 },
      );
    }

    const updated = await prisma.perfil.update({
      where: { id: perfilId },
      data: {
        nombre,
        estado,
        updatedBy: authResult.auth.name,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error actualizando perfil' },
      { status: 500 },
    );
  }
}
