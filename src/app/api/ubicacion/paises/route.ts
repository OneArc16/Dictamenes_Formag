// app/api/ubicacion/paises/route.ts
import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').trim();

    const where: Prisma.PaisWhereInput = q
      ? {
          OR: [
            { nombre: { contains: q, mode: 'insensitive' } },
            { codigo: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {};

    const paises = await prisma.pais.findMany({
      where,
      orderBy: { nombre: 'asc' },
      select: {
        codigo: true,
        nombre: true,
        codigoTelefono: true,
      },
    });

    return NextResponse.json({ ok: true, paises });
  } catch (err: any) {
    console.error('ERROR GET /api/ubicacion/paises:', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error cargando países' },
      { status: 500 },
    );
  }
}
