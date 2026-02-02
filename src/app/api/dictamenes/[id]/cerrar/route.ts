import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST /api/dictamenes/:id/cerrar
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ en tu Next params es Promise
) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ ok: false, message: 'id inválido' }, { status: 400 });
    }

    const dictamen = await prisma.dictamen.findUnique({
      where: { id },
      select: {
        id: true,
        estado: true, // true = Pendiente/Editable, false = Cerrado (según tu schema)
        reabierto: true,
      },
    });

    if (!dictamen) {
      return NextResponse.json({ ok: false, message: 'Dictamen no encontrado' }, { status: 404 });
    }

    // Ya cerrado
    if (dictamen.estado === false) {
      return NextResponse.json(
        { ok: false, message: 'El dictamen ya está cerrado' },
        { status: 409 }
      );
    }

    const updated = await prisma.dictamen.update({
      where: { id },
      data: {
        estado: false,
        reabierto: false,
      },
      select: {
        id: true,
        estado: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      ok: true,
      dictamenId: updated.id,
      estado: updated.estado ? 'PENDIENTE' : 'CERRADO',
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error cerrando dictamen:', error);
    return NextResponse.json(
      { ok: false, message: error?.message ?? 'Error cerrando dictamen' },
      { status: 500 }
    );
  }
}
