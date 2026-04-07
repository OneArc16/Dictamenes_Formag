import { NextResponse } from 'next/server';

import { requireAbilityApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const upper = (value: unknown) => String(value ?? '').trim().toUpperCase();

export async function POST(req: Request) {
  try {
    const authResult = await requireAbilityApi('admin.perfiles.manage');
    if (!authResult.ok) {
      return NextResponse.json({ ok: false, error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json().catch(() => ({}));
    const nombre = upper(body?.nombre);
    const estado = Number(body?.estado) === 0 ? 0 : 1;

    if (!nombre) {
      return NextResponse.json({ ok: false, error: 'Nombre es obligatorio' }, { status: 400 });
    }

    const existing = await prisma.perfil.findFirst({
      where: { nombre },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: `Ya existe un perfil con ese nombre (ID ${existing.id})` },
        { status: 409 },
      );
    }

    const created = await prisma.perfil.create({
      data: {
        nombre,
        estado,
        createdBy: authResult.auth.name,
        updatedBy: authResult.auth.name,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error creando perfil' },
      { status: 500 },
    );
  }
}
