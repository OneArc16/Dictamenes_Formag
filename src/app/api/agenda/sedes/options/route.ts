import { NextResponse } from 'next/server';

import { requireAnyAbilityApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const auth = await requireAnyAbilityApi([
    'agenda.read',
    'agenda.read.own',
    'agenda.create',
    'agenda.schedule.manage',
  ]);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });

  const sedes = await prisma.sede.findMany({
    where: { estado: 1 },
    orderBy: { nombre: 'asc' },
    select: { id: true, nombre: true },
  });
  return NextResponse.json({ ok: true, options: sedes });
}
