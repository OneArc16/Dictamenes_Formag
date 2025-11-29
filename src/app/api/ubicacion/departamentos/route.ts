// app/api/ubicacion/departamentos/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // 👇 de momento NO usamos paisCodigo porque el modelo no lo tiene
    // const paisCodigo = searchParams.get('paisCodigo') ?? undefined;
    const q = searchParams.get('q')?.trim() || '';

    const where: Prisma.DepartamentoWhereInput = {};

    if (q) {
      where.nombre = {
        contains: q,
        mode: 'insensitive' as const,
      };
    }

    const departamentos = await prisma.departamento.findMany({
      where,
      orderBy: { nombre: 'asc' },
      select: {
        codigo: true,
        nombre: true,
      },
    });

    return NextResponse.json({ ok: true, departamentos });
  } catch (err: any) {
    console.error('ERROR GET /api/ubicacion/departamentos:', err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? 'Error cargando departamentos',
      },
      { status: 500 },
    );
  }
}
