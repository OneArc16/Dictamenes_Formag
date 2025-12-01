import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const q = searchParams.get('q')?.trim() || '';
    const limitParam = searchParams.get('limit');

    const where: any = { estado: true };

    if (q.length >= 2) {
      where.OR = [
        { codigo: { contains: q, mode: 'insensitive' } },
        { nombre: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Si mandas ?limit=, lo respeta. Si no, trae TODO.
    let take: number | undefined;

    if (limitParam) {
      const parsed = parseInt(limitParam, 10);
      if (!Number.isNaN(parsed) && parsed > 0) {
        take = parsed;
      }
    }

    const cie10 = await prisma.cie10.findMany({
      where,
      orderBy: { codigo: 'asc' },
      ...(take ? { take } : {}),
    });

    return NextResponse.json(
      cie10.map((c) => ({
        codigo: c.codigo,
        nombre: c.nombre,
      }))
    );
  } catch (error) {
    console.error('Error /api/cie10:', error);
    return NextResponse.json(
      { error: 'Error obteniendo listado CIE10' },
      { status: 500 }
    );
  }
}
