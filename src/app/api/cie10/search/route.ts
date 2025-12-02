// src/app/api/cie10/search/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_LIMIT = 40;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get('q') ?? '').trim();
    const limitParam = searchParams.get('limit');
    const limit =
      limitParam != null ? Math.min(Number(limitParam) || DEFAULT_LIMIT, 100) : DEFAULT_LIMIT;

    // Si no hay al menos 3 caracteres, no buscamos nada pesado
    if (q.length < 3) {
      return NextResponse.json({
        ok: true,
        options: [] as { value: string; label: string }[],
      });
    }

    const cie10List = await prisma.cie10.findMany({
      where: {
        estado: true,
        OR: [
          {
            codigo: {
              contains: q,
              mode: 'insensitive',
            },
          },
          {
            nombre: {
              contains: q,
              mode: 'insensitive',
            },
          },
        ],
      },
      orderBy: {
        codigo: 'asc',
      },
      take: limit,
    });

    const options = cie10List.map((item) => ({
      value: item.codigo,
      label: `${item.codigo} - ${item.nombre}`,
    }));

    return NextResponse.json({
      ok: true,
      options,
    });
  } catch (err) {
    console.error('Error buscando CIE10:', err);
    return NextResponse.json(
      { ok: false, error: 'Error buscando CIE10' },
      { status: 500 },
    );
  }
}
