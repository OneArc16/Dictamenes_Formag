import { NextResponse } from 'next/server';

import { requireAuthenticatedApi } from '@/lib/auth/api-guards';
import { prisma } from '@/lib/prisma';

const DEFAULT_LIMIT = 40;

/** Búsqueda en el catálogo CUPS por código o nombre (mínimo 3 caracteres), igual que la de CIE10. */
export async function GET(req: Request) {
  const auth = await requireAuthenticatedApi();
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').trim().slice(0, 80);
    const limit = Math.min(Number(searchParams.get('limit')) || DEFAULT_LIMIT, 100);
    if (q.length < 3) return NextResponse.json({ ok: true, options: [] });

    const items = await prisma.cups.findMany({
      where: {
        estado: true,
        OR: [{ codigo: { contains: q, mode: 'insensitive' } }, { nombre: { contains: q, mode: 'insensitive' } }],
      },
      orderBy: { codigo: 'asc' },
      take: limit,
    });
    return NextResponse.json({
      ok: true,
      options: items.map((item) => ({ value: item.codigo, label: `${item.codigo} - ${item.nombre}` })),
    });
  } catch (error) {
    console.error('Error buscando CUPS:', error);
    return NextResponse.json({ ok: false, error: 'Error buscando CUPS' }, { status: 500 });
  }
}
