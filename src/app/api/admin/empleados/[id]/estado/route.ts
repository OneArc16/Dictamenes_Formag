import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

function isAdmin(role: unknown) {
  return String(role) === 'ADMIN';
}

function parseBool(v: any, defaultVal = true) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (['1', 'true', 'si', 'sí', 'yes', 'y'].includes(s)) return true;
    if (['0', 'false', 'no', 'n'].includes(s)) return false;
  }
  return defaultVal;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;

    if (!token) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload || !isAdmin((payload as any).role)) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const empleadoId = Number(id);
    if (!Number.isFinite(empleadoId)) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const activo = parseBool(body?.activo, true);

    const updated = await prisma.empleado.update({
      where: { id: empleadoId },
      data: { activo },
      select: { id: true, activo: true },
    });

    return NextResponse.json({ ok: true, id: updated.id, activo: updated.activo });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error actualizando estado' },
      { status: 500 }
    );
  }
}
