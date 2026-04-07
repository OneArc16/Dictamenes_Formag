import { NextResponse } from 'next/server';

import { requireAbilityApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function parsePermisoIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  return [...new Set(value.map(Number).filter((item) => Number.isFinite(item) && item > 0))].sort(
    (left, right) => left - right,
  );
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
    const permisoIds = parsePermisoIds(body?.permisoIds);

    const perfil = await prisma.perfil.findUnique({
      where: { id: perfilId },
      select: { id: true, nombre: true },
    });

    if (!perfil) {
      return NextResponse.json({ ok: false, error: 'Perfil no encontrado' }, { status: 404 });
    }

    const permisos = permisoIds.length
      ? await prisma.permiso.findMany({
          where: {
            id: { in: permisoIds },
            estado: 1,
          },
          select: { id: true },
        })
      : [];

    if (permisos.length !== permisoIds.length) {
      return NextResponse.json(
        { ok: false, error: 'Uno o mas permisos son invalidos o estan inactivos' },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.perfilPermiso.deleteMany({ where: { perfilId } });

      if (permisos.length > 0) {
        await tx.perfilPermiso.createMany({
          data: permisos.map((permiso) => ({
            perfilId,
            permisoId: permiso.id,
            permitido: true,
            createdBy: authResult.auth.name,
            updatedBy: authResult.auth.name,
          })),
        });
      }
    });

    return NextResponse.json({ ok: true, perfilId, totalPermisos: permisos.length });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Error actualizando permisos' },
      { status: 500 },
    );
  }
}
