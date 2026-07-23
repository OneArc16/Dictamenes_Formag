import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { requireAbilityApi } from '@/lib/auth/api-guards';
import { checkPclAccess } from '@/lib/dictamen/pcl-access';
import type { AuthorizationContext } from '@/lib/auth/authorization';
import { prisma } from '@/lib/prisma';
import {
  computeTitulo3Summary,
  type FactorKey,
  type GravedadAnalisisKey,
  type Titulo3Item,
  round2,
} from '@/lib/dictamen/titulo3';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type AuthCtx = AuthorizationContext;

type RouteContext = { params: Promise<{ id: string }> };

type PutBody = {
  factor: FactorKey;
  gravedad?: GravedadAnalisisKey;
  na?: boolean;
  remove?: boolean;
};

type PutOk = {
  ok: true;
  basePcl: number;
  items: Titulo3Item[];
  naFactors: FactorKey[];
  summary: ReturnType<typeof computeTitulo3Summary>;
};

type PutErr = {
  ok: false;
  error: { status: number; message: string };
};

type PutResult = PutOk | PutErr;

function toNumberDecimal(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (typeof value === 'object' && value !== null && 'toString' in value) {
    const parsed = Number(String((value as { toString: () => string }).toString()));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function getBasePclFromDictamen(dictamen: { totalTitulo1: unknown; totalCap2: unknown }) {
  const titulo1 = toNumberDecimal(dictamen.totalTitulo1);
  const capitulo2 = toNumberDecimal(dictamen.totalCap2);
  return round2(titulo1 + capitulo2);
}

function isTitulo3Habilitado(basePcl: number) {
  return basePcl < 99.9999;
}

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const authResult = await requireAbilityApi('dictamen.read');
    if (!authResult.ok) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const auth: AuthCtx = authResult.auth;
    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: 'id invalido' }, { status: 400 });
    }
    const gate = await checkPclAccess(id, auth, {
      allowHistoricalClosed: true,
    });
    if (!gate.ok) return NextResponse.json({ code: gate.code, message: gate.error }, { status: gate.status });

    const dictamen = await prisma.dictamen.findFirst({
      where: { id },
      select: {
        id: true,
        estado: true,
        reabierto: true,
        empleadoId: true,
        procedimientoPcl: true,
        totalTitulo1: true,
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
        { message: 'Titulo III aplica solo para Procedimiento A' },
        { status: 400 },
      );
    }

    const basePcl = getBasePclFromDictamen(dictamen);
    const answered = dictamen.analisisOcupacional.filter((item) => (item.valor ?? 1) === 1);
    const naFactors = dictamen.analisisOcupacional
      .filter((item) => (item.valor ?? 1) === 0)
      .map((item) => item.factor as unknown as FactorKey);

    const items: Titulo3Item[] = answered.map((item) => ({
      factor: item.factor as unknown as FactorKey,
      gravedad: item.gravedad as unknown as GravedadAnalisisKey,
    }));

    const summary = computeTitulo3Summary({ basePcl, items });

    return NextResponse.json({
      dictamenId: dictamen.id,
      basePcl: summary.basePcl,
      storedTotalTitulo3: toNumberDecimal(dictamen.totalTitulo3),
      aplicaAnalisisOcupacional: dictamen.aplicaAnalisisOcupacional,
      habilitado: isTitulo3Habilitado(basePcl),
      items,
      naFactors,
      summary,
    });
  } catch (error) {
    console.error('ERROR GET /api/dictamenes/[id]/titulo3:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error consultando Titulo III' },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const authResult = await requireAbilityApi('dictamen.edit');
    if (!authResult.ok) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const auth: AuthCtx = authResult.auth;

    const { id: idParam } = await context.params;
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: 'id invalido' }, { status: 400 });
    }
    const gate = await checkPclAccess(id, auth, { edit: true, markStarted: true });
    if (!gate.ok) return NextResponse.json({ code: gate.code, message: gate.error }, { status: gate.status });

    const body = (await req.json()) as PutBody;
    if (!body?.factor) {
      return NextResponse.json({ message: 'factor es requerido' }, { status: 400 });
    }

    const result: PutResult = await prisma.$transaction(async (tx) => {
      const dictamen = await tx.dictamen.findUnique({
        where: { id },
        select: {
          id: true,
          empleadoId: true,
          estado: true,
          reabierto: true,
          procedimientoPcl: true,
          totalTitulo1: true,
          totalCap2: true,
        },
      });

      if (!dictamen) {
        return { ok: false, error: { status: 404, message: 'Dictamen no encontrado' } };
      }

      if (dictamen.empleadoId !== auth.empleadoId) {
        return { ok: false, error: { status: 403, message: 'No tiene permiso sobre este dictamen' } };
      }

      const isClosed = dictamen.estado === false && dictamen.reabierto === false;
      if (isClosed) {
        return { ok: false, error: { status: 409, message: 'Dictamen CERRADO. No se permite editar.' } };
      }

      if (dictamen.procedimientoPcl !== 'A') {
        return {
          ok: false,
          error: { status: 400, message: 'Titulo III aplica solo para Procedimiento A' },
        };
      }

      const basePcl = getBasePclFromDictamen(dictamen);
      if (!isTitulo3Habilitado(basePcl)) {
        return {
          ok: false,
          error: {
            status: 409,
            message:
              'Titulo III no aplica: la sumatoria (Titulo I + Titulo II Cap. 2) ya es 100% (o mas).',
          },
        };
      }

      const wantsRemove = body.remove === true;
      const wantsNa = body.na === true;

      if (wantsRemove) {
        await tx.dictamenAnalisisOcupacional.deleteMany({
          where: { dictamenId: id, factor: body.factor as never },
        });
      } else if (wantsNa) {
        await tx.dictamenAnalisisOcupacional.upsert({
          where: {
            dictamenId_factor: { dictamenId: id, factor: body.factor as never },
          },
          create: {
            dictamenId: id,
            factor: body.factor as never,
            gravedad: 'CERO' as never,
            valor: 0,
          },
          update: {
            gravedad: 'CERO' as never,
            valor: 0,
          },
        });
      } else {
        if (!body.gravedad) {
          return {
            ok: false,
            error: { status: 400, message: 'gravedad es requerida si no es NA/remove' },
          };
        }

        await tx.dictamenAnalisisOcupacional.upsert({
          where: {
            dictamenId_factor: { dictamenId: id, factor: body.factor as never },
          },
          create: {
            dictamenId: id,
            factor: body.factor as never,
            gravedad: body.gravedad as never,
            valor: 1,
          },
          update: {
            gravedad: body.gravedad as never,
            valor: 1,
          },
        });
      }

      const rows = await tx.dictamenAnalisisOcupacional.findMany({
        where: { dictamenId: id },
        select: { factor: true, gravedad: true, valor: true },
        orderBy: { factor: 'asc' },
      });

      const answered = rows.filter((row) => (row.valor ?? 1) === 1);
      const naFactors = rows
        .filter((row) => (row.valor ?? 1) === 0)
        .map((row) => row.factor as unknown as FactorKey);

      const items: Titulo3Item[] = answered.map((row) => ({
        factor: row.factor as unknown as FactorKey,
        gravedad: row.gravedad as unknown as GravedadAnalisisKey,
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

      return { ok: true, basePcl: summary.basePcl, items, naFactors, summary };
    });

    if (!result.ok) {
      return NextResponse.json({ message: result.error.message }, { status: result.error.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('ERROR PUT /api/dictamenes/[id]/titulo3:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error guardando Titulo III' },
      { status: 500 },
    );
  }
}
