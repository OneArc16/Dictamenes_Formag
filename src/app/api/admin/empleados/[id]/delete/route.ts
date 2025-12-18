import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

function isAdmin(role: unknown) {
  return String(role) === 'ADMIN';
}

export async function POST(
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

    const empleado = await prisma.empleado.findUnique({
      where: { id: empleadoId },
      select: { id: true },
    });

    if (!empleado) {
      return NextResponse.json({ ok: false, error: 'Empleado no encontrado' }, { status: 404 });
    }

    const dictamenes = await prisma.dictamen.count({
      where: { empleadoId },
    });

    if (dictamenes > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `No se puede eliminar: tiene ${dictamenes} dictamen(es) asociado(s). Inactívalo en su lugar.`,
        },
        { status: 409 }
      );
    }

    await prisma.empleado.delete({ where: { id: empleadoId } });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // FK constraint, por si algo más lo referencia
    if (err?.code === 'P2003') {
      return NextResponse.json(
        { ok: false, error: 'No se puede eliminar: está relacionado con otros registros. Inactívalo.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error eliminando empleado' },
      { status: 500 }
    );
  }
}
