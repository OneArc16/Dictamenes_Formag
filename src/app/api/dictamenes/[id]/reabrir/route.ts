// app/api/dictamenes/[id]/reabrir/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';

function canReopen(role: unknown) {
  const r = String(role ?? '').toUpperCase();
  return r === 'ADMIN' || r === 'ADMISIONISTA';
}

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;
    if (!token) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload || !canReopen((payload as any).role)) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 403 });
    }

    const { id: idParam } = await ctx.params;
    const id = Number(idParam);
    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const existing = await prisma.dictamen.findUnique({
      where: { id },
      select: { id: true, estado: true, reabierto: true },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Dictamen no encontrado' }, { status: 404 });
    }

    if (existing.estado === true) {
      return NextResponse.json(
        { ok: false, error: 'El dictamen ya está pendiente (no se puede reabrir).' },
        { status: 400 }
      );
    }

    await prisma.dictamen.update({
      where: { id },
      data: { estado: true, reabierto: true },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error reabriendo dictamen' },
      { status: 500 }
    );
  }
}
