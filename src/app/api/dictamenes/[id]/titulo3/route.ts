// app/api/dictamenes/[id]/titulo3/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';
import crypto from 'crypto';

import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

import {
  computeTitulo3Summary,
  type FactorKey,
  type GravedadAnalisisKey,
  type Titulo3Item,
  round2,
} from '@/lib/dictamen/titulo3';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ======================
// Auth helpers (igual estilo a tus otras rutas)
// ======================
type JwtPayload = {
  sub: string;
  role?: string;
  name?: string;
  [key: string]: any;
};

type AuthCtx = {
  userId: number;
  role: 'ADMIN' | 'ADMISIONISTA' | 'MEDICO' | string;
  name?: string;
};

function normalizeRole(role: unknown): 'ADMIN' | 'ADMISIONISTA' | 'MEDICO' | string {
  const r = String(role ?? '').trim().toUpperCase();
  if (r === 'ADMINISTRADOR') return 'ADMIN';
  if (r === 'ADMICIONES' || r === 'ADMISIONES') return 'ADMISIONISTA';
  return r;
}

function canReadDictamen(role: string) {
  return role === 'MEDICO' || role === 'ADMIN' || role === 'ADMISIONISTA';
}

async function getAuthFromToken(): Promise<AuthCtx | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;

  const payload = (await verifyJwt(token)) as JwtPayload | null;
  if (!payload?.sub) return null;

  const userId = Number(payload.sub);
  if (!userId || Number.isNaN(userId)) return null;

  const role = normalizeRole(payload.role);
  return { userId, role: role as any, name: payload.name };
}

// ======================
// Helpers
// ======================
function toNumberDecimal(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof value === 'object' && value !== null && 'toString' in value) {
    const s = String((value as { toString: () => string }).toString());
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/**
 * ✅ Regla del negocio:
 * Título III se habilita SOLO si (Título I + Título II Cap.2) NO llega a 100%.
 * En tu schema: totalTitulo1 + totalCap2
 */
function getBasePclFromDictamen(dictamen: { totalTitulo1: unknown; totalCap2: unknown }) {
  const t1 = toNumberDecimal(dictamen.totalTitulo1);
  const c2 = toNumberDecimal(dictamen.totalCap2);
  return round2(t1 + c2);
}

function isTitulo3Habilitado(basePcl: number) {
  // tolerancia mínima por decimales
  return basePcl < 99.9999;
}

type RouteContext = { params: Promise<{ id: string }> };

// =======================
// GET /api/dictamenes/:id/titulo3
// =======================
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const auth = await getAuthFromToken();
    if (!auth) return NextResponse.json({ message: 'No autenticado' }, { status: 401 });

    const { userId, role } = auth;
    if (!canReadDictamen(role)) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: 'id inválido' }, { status: 400 });
    }

    const where: any = { id };
    if (role === 'MEDICO') where.empleadoId = userId;

    const dictamen = await prisma.dictamen.findFirst({
      where,
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
        { message: 'Título III aplica solo para Procedimiento A' },
        { status: 400 },
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
      habilitado: isTitulo3Habilitado(basePcl), // ✅ extra (no rompe el front)
      items,
      naFactors,
      summary,
    });
  } catch (err: any) {
    console.error('ERROR GET /api/dictamenes/[id]/titulo3:', err);
    return NextResponse.json({ message: err?.message ?? 'Error consultando Título III' }, { status: 500 });
  }
}

// =======================
// PUT /api/dictamenes/:id/titulo3
// =======================
type PutBody = {
  factor: FactorKey;
  gravedad?: GravedadAnalisisKey; // cuando no es NA/remove
  na?: boolean; // marcar N/A
  remove?: boolean; // dejar en blanco (borra)
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

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const auth = await getAuthFromToken();
    if (!auth) return NextResponse.json({ message: 'No autenticado' }, { status: 401 });

    const { userId, role } = auth;
    if (role !== 'MEDICO') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ message: 'id inválido' }, { status: 400 });
    }

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

      if (dictamen.empleadoId !== userId) {
        return { ok: false, error: { status: 403, message: 'No tiene permiso sobre este dictamen' } };
      }

      // ✅ BLOQUEO: si está cerrado y NO reabierto => no editar
      const isClosed = dictamen.estado === false && dictamen.reabierto === false;
      if (isClosed) {
        return { ok: false, error: { status: 409, message: 'Dictamen CERRADO. No se permite editar.' } };
      }

      if (dictamen.procedimientoPcl !== 'A') {
        return {
          ok: false,
          error: { status: 400, message: 'Título III aplica solo para Procedimiento A' },
        };
      }

      // ✅ REGLA: solo permitir cambios si (T1 + T2 Cap.2) < 100
      const basePcl = getBasePclFromDictamen(dictamen);
      if (!isTitulo3Habilitado(basePcl)) {
        return {
          ok: false,
          error: {
            status: 409,
            message:
              'Título III no aplica: la sumatoria (Título I + Título II Cap. 2) ya es 100% (o más).',
          },
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
            ok: false,
            error: { status: 400, message: 'gravedad es requerida si no es NA/remove' },
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
        orderBy: { factor: 'asc' },
      });

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

      return { ok: true, basePcl: summary.basePcl, items, naFactors, summary };
    });

    if (!result.ok) {
      return NextResponse.json({ message: result.error.message }, { status: result.error.status });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('ERROR PUT /api/dictamenes/[id]/titulo3:', err);
    return NextResponse.json({ message: err?.message ?? 'Error guardando Título III' }, { status: 500 });
  }
}