// app/api/dictamenes/[id]/reabrir/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';

type JwtPayload = {
  sub: string;
  role?: string;
  name?: string;
  [key: string]: any;
};

type AuthCtx = {
  userId: number;
  role: string;
};

async function getAuthFromToken(): Promise<AuthCtx | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth')?.value;
  if (!token) return null;

  const payload = (await verifyJwt(token)) as JwtPayload | null;
  if (!payload?.sub) return null;

  const userId = Number(payload.sub);
  if (!userId || Number.isNaN(userId)) return null;

  const role = String(payload.role ?? '').toUpperCase();
  return { userId, role };
}

function canReopen(role: string) {
  return role === 'ADMIN' || role === 'ADMISIONISTA';
}

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  try {
    const auth = await getAuthFromToken();
    if (!auth) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

    if (!canReopen(auth.role)) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 403 });
    }

    const { id: idParam } = await context.params;
    const id = Number(idParam);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const existing = await prisma.dictamen.findUnique({
      where: { id },
      select: { id: true, estado: true, reabierto: true },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Dictamen no encontrado' }, { status: 404 });
    }

    // Si ya está reabierto, lo dejamos idempotente
    if (existing.reabierto) {
      return NextResponse.json({
        ok: true,
        dictamen: { id: existing.id, estado: 'REABIERTO' as const },
        message: 'El dictamen ya estaba reabierto',
      });
    }

    // Solo reabrimos si está cerrado (estado=false)
    if (existing.estado === true) {
      return NextResponse.json(
        { ok: false, error: 'El dictamen no está cerrado, no se puede reabrir.' },
        { status: 400 }
      );
    }

    const updated = await prisma.dictamen.update({
      where: { id },
      data: {
        reabierto: true,
        estado: true, // vuelve a "pendiente" pero tu UI lo mostrará como REABIERTO por el flag reabierto
      },
      select: { id: true, estado: true, reabierto: true },
    });

    return NextResponse.json({
      ok: true,
      dictamen: { id: updated.id, estado: 'REABIERTO' as const },
    });
  } catch (err: any) {
    console.error('ERROR POST /api/dictamenes/[id]/reabrir:', err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error reabriendo dictamen' },
      { status: 500 }
    );
  }
}
