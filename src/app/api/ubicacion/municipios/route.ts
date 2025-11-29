// app/api/ubicacion/municipios/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const departamento = searchParams.get('departamento') ?? '';
    const q = searchParams.get('q')?.trim() || '';

    // 🔹 Si no hay departamento, devolvemos lista vacía pero sin error
    if (!departamento) {
      return NextResponse.json({
        ok: true,
        municipios: [],
      });
    }

    const where: Prisma.MunicipioWhereInput = {
      codigoDepartamento: departamento,
    };

    if (q) {
      where.nombre = {
        contains: q,
        mode: 'insensitive',
      };
    }

    const municipios = await prisma.municipio.findMany({
      where,
      orderBy: { nombre: 'asc' },
      select: {
        codigo: true,
        nombre: true,
        codigoDepartamento: true,
      },
    });

    return NextResponse.json({ ok: true, municipios });
  } catch (err: any) {
    console.error('ERROR GET /api/ubicacion/municipios:', err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? 'Error cargando municipios',
      },
      { status: 500 },
    );
  }
}
