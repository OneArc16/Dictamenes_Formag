// src/app/api/dictamenes/[id]/sustentacion/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function cleanText(v: unknown): string {
  if (v == null) return '';
  return String(v);
}

// =======================
// GET /api/dictamenes/:id/sustentacion
// =======================
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ ok: false, message: 'id inválido' }, { status: 400 });
    }

    const dictamen = await prisma.dictamen.findUnique({
      where: { id },
      select: { id: true, sustentacionObservaciones: true, updatedAt: true },
    });

    if (!dictamen) {
      return NextResponse.json({ ok: false, message: 'Dictamen no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      dictamenId: dictamen.id,
      sustentacionObservaciones: dictamen.sustentacionObservaciones ?? '',
      updatedAt: dictamen.updatedAt,
    });
  } catch (error: any) {
    console.error('❌ GET /dictamenes/[id]/sustentacion:', error);
    return NextResponse.json(
      { ok: false, message: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}

// =======================
// PUT /api/dictamenes/:id/sustentacion
// body: { sustentacionObservaciones: string }
// =======================
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ ok: false, message: 'id inválido' }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const sustentacionObservaciones = cleanText(body?.sustentacionObservaciones);

    // (Opcional) validación mínima
    // if (sustentacionObservaciones.length > 20000) {
    //   return NextResponse.json({ ok: false, message: 'Texto demasiado largo' }, { status: 400 });
    // }

    const updated = await prisma.dictamen.update({
      where: { id },
      data: { sustentacionObservaciones },
      select: { id: true, sustentacionObservaciones: true, updatedAt: true },
    });

    return NextResponse.json({
      ok: true,
      dictamenId: updated.id,
      sustentacionObservaciones: updated.sustentacionObservaciones ?? '',
      updatedAt: updated.updatedAt,
    });
  } catch (error: any) {
    console.error('❌ PUT /dictamenes/[id]/sustentacion:', error);
    return NextResponse.json(
      { ok: false, message: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
