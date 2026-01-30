import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getTotalCap2,
  normalizeClaseCap2,
  ProcedimientoPcl,
} from '@/lib/dictamen/capitulo2';

export const runtime = 'nodejs';

/**
 * PATCH /api/dictamenes/:id/capitulo2
 * Body:
 *  - claseLimitacionLaboral: 'I'|'II'|'III'|'IV'|null
 *
 * Guarda:
 *  - dictamenes.claseLimitacionLaboral = clase
 *  - dictamenes.totalCap2 = valor según procedimientoPcl del dictamen
 */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const dictamenId = Number(id);

    if (Number.isNaN(dictamenId) || dictamenId <= 0) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json().catch(() => null);
    const claseRaw = body?.claseLimitacionLaboral ?? null;

    const clase = claseRaw === null ? null : normalizeClaseCap2(String(claseRaw));
    if (claseRaw !== null && !clase) {
      return NextResponse.json({ ok: false, error: 'Clase inválida' }, { status: 400 });
    }

    // Traer procedimiento del dictamen desde DB (no confiar en el cliente)
    const dictamen = await prisma.dictamen.findUnique({
      where: { id: dictamenId },
      select: { id: true, procedimientoPcl: true },
    });

    if (!dictamen) {
      return NextResponse.json({ ok: false, error: 'Dictamen no existe' }, { status: 404 });
    }

    const procedimiento = dictamen.procedimientoPcl as ProcedimientoPcl; // 'A'|'B'
    const totalCap2 = clase ? getTotalCap2(procedimiento, clase) : null;

    const updated = await prisma.dictamen.update({
      where: { id: dictamenId },
      data: {
        claseLimitacionLaboral: clase,
        totalCap2: totalCap2,
      },
      select: {
        id: true,
        claseLimitacionLaboral: true,
        totalCap2: true,
      },
    });

    return NextResponse.json({ ok: true, dictamen: updated });
  } catch (err: any) {
    console.error('ERROR PATCH /api/dictamenes/[id]/capitulo2:', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error guardando capítulo 2' },
      { status: 500 },
    );
  }
}
