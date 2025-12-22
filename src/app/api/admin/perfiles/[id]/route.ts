import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';

function isAdmin(role: unknown) {
  return String(role) === 'ADMIN';
}

const upper = (v: any) => String(v ?? '').trim().toUpperCase();

export async function PATCH(
  req: Request,
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

    const body = await req.json();

    const nombre = upper(body?.nombre);
    const estado = Number(body?.estado) === 0 ? 0 : 1;

    if (!nombre) {
      return NextResponse.json({ ok: false, error: 'Nombre es obligatorio' }, { status: 400 });
    }

    const current = await prisma.perfil.findUnique({
      where: { id: perfilId },
      select: { id: true },
    });
    if (!current) {
      return NextResponse.json({ ok: false, error: 'Perfil no encontrado' }, { status: 404 });
    }

    const existing = await prisma.perfil.findFirst({
      where: { nombre, NOT: { id: perfilId } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: `Ya existe otro perfil con ese nombre (ID ${existing.id})` },
        { status: 409 }
      );
    }

    const updated = await prisma.perfil.update({
      where: { id: perfilId },
      data: { nombre, estado },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'Conflicto de unicidad' }, { status: 409 });
    }
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error actualizando perfil' },
      { status: 500 }
    );
  }
}
