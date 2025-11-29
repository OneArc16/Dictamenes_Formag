// app/api/ubicacion/barrios/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const municipio = (searchParams.get('municipio') ?? '').trim();
    const q = (searchParams.get('q') ?? '').trim();

    if (!municipio) {
      return NextResponse.json(
        { ok: false, error: 'Falta el parámetro "municipio".' },
        { status: 400 },
      );
    }

    const where: any = { codigoMunicipio: municipio };

    if (q) {
      where.nombre = {
        contains: q,
        mode: 'insensitive' as const,
      };
    }

    const barrios = await prisma.barrio.findMany({
      where,
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        codigoMunicipio: true,
      },
    });

    return NextResponse.json({ ok: true, barrios });
  } catch (err: any) {
    console.error('ERROR GET /api/ubicacion/barrios:', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error cargando barrios' },
      { status: 500 },
    );
  }
}
