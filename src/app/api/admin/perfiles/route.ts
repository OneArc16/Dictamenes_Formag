import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';

function isAdmin(role: unknown) {
  return String(role) === 'ADMIN';
}

const upper = (v: any) => String(v ?? '').trim().toUpperCase();

export async function POST(req: Request) {
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

    const body = await req.json();

    const nombre = upper(body?.nombre);
    const estado = Number(body?.estado) === 0 ? 0 : 1;

    if (!nombre) {
      return NextResponse.json({ ok: false, error: 'Nombre es obligatorio' }, { status: 400 });
    }

    const existing = await prisma.perfil.findFirst({
      where: { nombre },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { ok: false, error: `Ya existe un perfil con ese nombre (ID ${existing.id})` },
        { status: 409 }
      );
    }

    const created = await prisma.perfil.create({
      data: { nombre, estado },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'Conflicto de unicidad' }, { status: 409 });
    }
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error creando perfil' },
      { status: 500 }
    );
  }
}
