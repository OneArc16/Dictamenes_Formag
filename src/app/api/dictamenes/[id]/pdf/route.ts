import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

import { generateDictamenPdfDynamic } from '@/lib/pdf/generateDictamenPdfDynamic';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteCtx) {
  const { id: idRaw } = await params;
  const id = Number(idRaw);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: 'id inválido' }, { status: 400 });
  }

  const url = new URL(req.url);
  const debug = url.searchParams.get('debug') === '1';

  const dictamen = await prisma.dictamen.findUnique({
    where: { id },
    include: {
      usuario: {
        include: {
          municipio: true,
          departamento: true,
          institucionEducativaRef: true,
          secretariaRef: true,
        },
      },
      empleado: true,
      diagnosticos: {
        include: { cie10: true },
        orderBy: { id: 'asc' },
      },
    },
  });

  if (!dictamen) {
    return NextResponse.json({ message: 'Dictamen no encontrado' }, { status: 404 });
  }

  // estado=false => CERRADO
  if (dictamen.estado !== false) {
    return NextResponse.json(
      { message: 'Solo se puede imprimir cuando el dictamen esté CERRADO' },
      { status: 403 }
    );
  }

  const pdfBytes = await generateDictamenPdfDynamic({ dictamen, debug });

  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="dictamen.pdf"',
      'Cache-Control': 'no-store',
    },
  });
}
