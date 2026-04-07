import { NextResponse } from 'next/server';

import { requireAnyAbilityApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const auth = await requireAnyAbilityApi([
      'recomendacion.reopen',
      'dictamen.reopen',
    ]);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const options = await prisma.motivoReapertura.findMany({
      where: { estado: true },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      select: {
        id: true,
        nombre: true,
        descripcion: true,
      },
    });

    return NextResponse.json({ ok: true, options });
  } catch (error) {
    console.error('ERROR GET /api/motivos-reapertura:', error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Error consultando motivos de reapertura',
      },
      { status: 500 },
    );
  }
}