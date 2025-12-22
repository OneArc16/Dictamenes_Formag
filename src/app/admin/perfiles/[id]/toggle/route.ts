import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';

function isAdmin(role: unknown) {
  return String(role) === 'ADMIN';
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const perfilId = Number(id);

    if (!Number.isFinite(perfilId)) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const current = await prisma.perfil.findUnique({
      where: { id: perfilId },
      select: { id: true, estado: true },
    });

    if (!current) {
      return NextResponse.json({ ok: false, error: 'Perfil no encontrado' }, { status: 404 });
    }

    const nextEstado = current.estado === 1 ? 0 : 1;

    const updated = await prisma.perfil.update({
      where: { id: perfilId },
      data: { estado: nextEstado },
      select: { id: true, estado: true },
    });

    return NextResponse.json({ ok: true, id: updated.id, estado: updated.estado });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error actualizando perfil' },
      { status: 500 }
    );
  }
}
