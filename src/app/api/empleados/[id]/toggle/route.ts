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
    const empleadoId = Number(id);

    if (!Number.isFinite(empleadoId)) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const current = await prisma.empleado.findUnique({
      where: { id: empleadoId },
      select: { id: true, activo: true },
    });

    if (!current) {
      return NextResponse.json({ ok: false, error: 'Empleado no encontrado' }, { status: 404 });
    }

    const updated = await prisma.empleado.update({
      where: { id: empleadoId },
      data: { activo: !current.activo },
      select: { id: true, activo: true },
    });

    return NextResponse.json({ ok: true, id: updated.id, activo: updated.activo });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error actualizando empleado' },
      { status: 500 }
    );
  }
}
