import { NextResponse } from 'next/server';

import { requireAnyAbilityApi } from '@/lib/auth/api-guards';
import { hasAbility } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAnyAbilityApi([
    'agenda.read',
    'agenda.read.own',
    'agenda.create',
    'agenda.schedule.manage',
  ]);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  const canBrowseAllSites =
    hasAbility(auth.auth, 'agenda.site.select') ||
    hasAbility(auth.auth, 'agenda.schedule.manage');
  const assignedSiteId = canBrowseAllSites
    ? undefined
    : (
        await prisma.empleado.findFirst({
          where: { id: auth.auth.empleadoId, activo: true },
          select: { idSede: true },
        })
      )?.idSede ?? undefined;
  const sedes = await prisma.sede.findMany({
    where: canBrowseAllSites
      ? { estado: 1 }
      : { estado: 1, id: assignedSiteId ?? -1 },
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true },
  });
  return NextResponse.json({ ok: true, options: sedes });
}
