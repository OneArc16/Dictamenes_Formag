import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

// ✅ Ajusta si tu prisma está en otra ruta
import { prisma } from '@/lib/prisma';

import {
  computeTitulo3Summary,
  type FactorKey,
  type GravedadAnalisisKey,
  type Titulo3Item,
} from '@/lib/dictamen/titulo3';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function toNumberDecimal(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  // Prisma.Decimal
  // @ts-expect-error
  if (typeof value?.toString === 'function') return Number(value.toString());
  return 0;
}

function getBasePclFromDictamen(dictamen: {
  totalTitulo1: unknown;
  totalCap1: unknown;
  totalCap2: unknown;
}) {
  const t1 = toNumberDecimal(dictamen.totalTitulo1);
  const c1 = toNumberDecimal(dictamen.totalCap1);
  const c2 = toNumberDecimal(dictamen.totalCap2);
  return t1 + c1 + c2;
}

// =======================
// GET /api/dictamenes/:id/titulo3
// =======================
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await context.params; // ✅ await
  const id = Number(idParam);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: 'id inválido' }, { status: 400 });
  }

  const dictamen = await prisma.dictamen.findUnique({
    where: { id },
    select: {
      id: true,
      procedimientoPcl: true,
      totalTitulo1: true,
      totalCap1: true,
      totalCap2: true,
      totalTitulo3: true,
      aplicaAnalisisOcupacional: true,
      analisisOcupacional: {
        select: { factor: true, gravedad: true, valor: true },
        orderBy: { factor: 'asc' },
      },
    },
  });

  if (!dictamen) {
    return NextResponse.json({ message: 'Dictamen no encontrado' }, { status: 404 });
  }

  if (dictamen.procedimientoPcl !== 'A') {
    return NextResponse.json(
      { message: 'Título III aplica solo para Procedimiento A' },
      { status: 400 }
    );
  }

  const basePcl = getBasePclFromDictamen(dictamen);

  // valor=1 => contado en sumatoria; valor=0 => NA
  const answered = dictamen.analisisOcupacional.filter((it) => (it.valor ?? 1) === 1);
  const naFactors = dictamen.analisisOcupacional
    .filter((it) => (it.valor ?? 1) === 0)
    .map((it) => it.factor as unknown as FactorKey);

  const items: Titulo3Item[] = answered.map((it) => ({
    factor: it.factor as unknown as FactorKey,
    gravedad: it.gravedad as unknown as GravedadAnalisisKey,
  }));

  const summary = computeTitulo3Summary({ basePcl, items });

  return NextResponse.json({
    dictamenId: dictamen.id,
    basePcl: summary.basePcl,
    storedTotalTitulo3: toNumberDecimal(dictamen.totalTitulo3),
    aplicaAnalisisOcupacional: dictamen.aplicaAnalisisOcupacional,
    items,
    naFactors,
    summary,
  });
}

// =======================
// PUT /api/dictamenes/:id/titulo3
// =======================
type PutBody = {
  factor: FactorKey;
  gravedad?: GravedadAnalisisKey; // cuando no es NA/remove
  na?: boolean;                   // marcar N/A
  remove?: boolean;               // dejar en blanco (borra)
};

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await context.params; // ✅ await
  const id = Number(idParam);

  if (!Number.isFinite(id)) {
    return NextResponse.json({ message: 'id inválido' }, { status: 400 });
  }

  const body = (await req.json()) as PutBody;

  if (!body?.factor) {
    return NextResponse.json({ message: 'factor es requerido' }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    const dictamen = await tx.dictamen.findUnique({
      where: { id },
      select: {
        id: true,
        procedimientoPcl: true,
        totalTitulo1: true,
        totalCap1: true,
        totalCap2: true,
      },
    });

    if (!dictamen) {
      return { error: { status: 404, message: 'Dictamen no encontrado' } as const };
    }

    if (dictamen.procedimientoPcl !== 'A') {
      return {
        error: { status: 400, message: 'Título III aplica solo para Procedimiento A' } as const,
      };
    }

    const wantsRemove = body.remove === true;
    const wantsNa = body.na === true;

    if (wantsRemove) {
      await tx.dictamenAnalisisOcupacional.deleteMany({
        where: { dictamenId: id, factor: body.factor as any },
      });
    } else if (wantsNa) {
      // NA persistente: gravedad=CERO, valor=0
      await tx.dictamenAnalisisOcupacional.upsert({
        where: {
          dictamenId_factor: { dictamenId: id, factor: body.factor as any },
        },
        create: {
          dictamenId: id,
          factor: body.factor as any,
          gravedad: 'CERO' as any,
          valor: 0,
        },
        update: {
          gravedad: 'CERO' as any,
          valor: 0,
        },
      });
    } else {
      if (!body.gravedad) {
        return {
          error: { status: 400, message: 'gravedad es requerida si no es NA/remove' } as const,
        };
      }

      await tx.dictamenAnalisisOcupacional.upsert({
        where: {
          dictamenId_factor: { dictamenId: id, factor: body.factor as any },
        },
        create: {
          dictamenId: id,
          factor: body.factor as any,
          gravedad: body.gravedad as any,
          valor: 1,
        },
        update: {
          gravedad: body.gravedad as any,
          valor: 1,
        },
      });
    }

    const rows = await tx.dictamenAnalisisOcupacional.findMany({
      where: { dictamenId: id },
      select: { factor: true, gravedad: true, valor: true },
    });

    const basePcl = getBasePclFromDictamen(dictamen);

    const answered = rows.filter((r) => (r.valor ?? 1) === 1);
    const naFactors = rows
      .filter((r) => (r.valor ?? 1) === 0)
      .map((r) => r.factor as unknown as FactorKey);

    const items: Titulo3Item[] = answered.map((r) => ({
      factor: r.factor as unknown as FactorKey,
      gravedad: r.gravedad as unknown as GravedadAnalisisKey,
    }));

    const summary = computeTitulo3Summary({ basePcl, items });

    const hasAny = rows.length > 0;
    const hasAnswered = items.length > 0;

    const totalTitulo3 =
      hasAnswered && summary.claseFinal
        ? new Prisma.Decimal(summary.incrementoTitulo3.toFixed(2))
        : null;

    await tx.dictamen.update({
      where: { id },
      data: {
        aplicaAnalisisOcupacional: hasAny,
        totalTitulo3,
      },
    });

    return { basePcl: summary.basePcl, items, naFactors, summary };
  });

  if ('error' in result) {
    return NextResponse.json({ message: result.error.message }, { status: result.error.status });
  }

  return NextResponse.json(result);
}
