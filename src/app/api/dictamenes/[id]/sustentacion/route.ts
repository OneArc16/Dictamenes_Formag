// src/app/api/dictamenes/[id]/sustentacion/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const dictamenId = Number(id);

    if (!Number.isFinite(dictamenId) || dictamenId <= 0) {
      return NextResponse.json({ ok: false, message: 'id inválido' }, { status: 400 });
    }

    const dictamen = await prisma.dictamen.findUnique({
      where: { id: dictamenId },
      select: { id: true, sustentacionObservaciones: true, updatedAt: true, estado: true },
    });

    if (!dictamen) {
      return NextResponse.json({ ok: false, message: 'Dictamen no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      dictamenId,
      sustentacionObservaciones: dictamen.sustentacionObservaciones ?? '',
      updatedAt: dictamen.updatedAt?.toISOString?.() ?? undefined,
    });
  } catch (err: any) {
    console.error('❌ Error GET sustentacion:', err);
    return NextResponse.json({ ok: false, message: err?.message ?? 'Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const dictamenId = Number(id);

    if (!Number.isFinite(dictamenId) || dictamenId <= 0) {
      return NextResponse.json({ ok: false, message: 'id inválido' }, { status: 400 });
    }

    const body = (await req.json().catch(() => null)) as null | {
      sustentacionObservaciones?: string;
    };

    const text = String(body?.sustentacionObservaciones ?? '');

    const current = await prisma.dictamen.findUnique({
      where: { id: dictamenId },
      select: { id: true, estado: true },
    });

    if (!current) {
      return NextResponse.json({ ok: false, message: 'Dictamen no encontrado' }, { status: 404 });
    }

    // ✅ CANDADO
    if (current.estado === false) {
      return NextResponse.json(
        { ok: false, message: 'El dictamen está CERRADO y no se puede editar.' },
        { status: 409 }
      );
    }

    const updated = await prisma.dictamen.update({
      where: { id: dictamenId },
      data: { sustentacionObservaciones: text },
      select: { id: true, sustentacionObservaciones: true, updatedAt: true },
    });

    return NextResponse.json({
      ok: true,
      dictamenId,
      sustentacionObservaciones: updated.sustentacionObservaciones ?? '',
      updatedAt: updated.updatedAt?.toISOString?.() ?? undefined,
      message: 'Sustentación guardada',
    });
  } catch (err: any) {
    console.error('❌ Error PUT sustentacion:', err);
    return NextResponse.json({ ok: false, message: err?.message ?? 'Error' }, { status: 500 });
  }
}
