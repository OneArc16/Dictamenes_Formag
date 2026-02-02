// src/app/api/dictamenes/[id]/cerrar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ en tu Next params es Promise
) {
  try {
    const { id } = await context.params;
    const dictamenId = Number(id);

    if (!Number.isFinite(dictamenId) || dictamenId <= 0) {
      return NextResponse.json({ ok: false, message: 'id inválido' }, { status: 400 });
    }

    const current = await prisma.dictamen.findUnique({
      where: { id: dictamenId },
      select: { id: true, estado: true, reabierto: true },
    });

    if (!current) {
      return NextResponse.json({ ok: false, message: 'Dictamen no encontrado' }, { status: 404 });
    }

    // Si ya está cerrado, respondemos OK idempotente
    if (current.estado === false) {
      return NextResponse.json({ ok: true, dictamenId, message: 'El dictamen ya está cerrado.' });
    }

    await prisma.dictamen.update({
      where: { id: dictamenId },
      data: {
        estado: false,      // ✅ cerrado
        reabierto: false,   // ✅ por defecto no reabierto
        // si tienes campos tipo "cerradoEn", agrégalo aquí:
        // cerradoEn: new Date(),
      },
    });

    return NextResponse.json({ ok: true, dictamenId, message: 'Dictamen cerrado correctamente.' });
  } catch (err: any) {
    console.error('❌ Error POST /api/dictamenes/[id]/cerrar:', err);
    return NextResponse.json(
      { ok: false, message: err?.message ?? 'Error cerrando dictamen' },
      { status: 500 }
    );
  }
}

// (Opcional) Si alguien intenta otros métodos, devolvemos 405 claro
export function GET() {
  return NextResponse.json({ ok: false, message: 'Method Not Allowed' }, { status: 405 });
}
export function PUT() {
  return NextResponse.json({ ok: false, message: 'Method Not Allowed' }, { status: 405 });
}
export function DELETE() {
  return NextResponse.json({ ok: false, message: 'Method Not Allowed' }, { status: 405 });
}
