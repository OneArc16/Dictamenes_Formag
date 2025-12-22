import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

function isAdmin(role: unknown) {
  return String(role) === 'ADMIN';
}

function parseEstado(v: any): 0 | 1 | null {
  // Acepta: 1/0, "1"/"0", true/false
  if (v === 1 || v === '1' || v === true) return 1;
  if (v === 0 || v === '0' || v === false) return 0;
  return null;
}

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

    const body = await req.json().catch(() => ({}));
    const estado = parseEstado(body?.estado);

    if (estado == null) {
      return NextResponse.json(
        { ok: false, error: 'Estado inválido (use 1/0)' },
        { status: 400 }
      );
    }

    const current = await prisma.perfil.findUnique({
      where: { id: perfilId },
      select: { id: true },
    });

    if (!current) {
      return NextResponse.json({ ok: false, error: 'Perfil no encontrado' }, { status: 404 });
    }

    const updated = await prisma.perfil.update({
      where: { id: perfilId },
      data: { estado },
      select: { id: true, estado: true },
    });

    return NextResponse.json({ ok: true, perfil: updated });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error actualizando estado' },
      { status: 500 }
    );
  }
}
