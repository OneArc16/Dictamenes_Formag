import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import bcrypt from 'bcryptjs';

function isAdmin(role: unknown) {
  return String(role) === 'ADMIN';
}

export async function POST(
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
    const empleadoId = Number(id);

    if (!Number.isFinite(empleadoId)) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();
    const password = String(body?.password ?? '').trim();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { ok: false, error: 'La contraseña debe tener mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar que existe
    const exists = await prisma.empleado.findUnique({
      where: { id: empleadoId },
      select: { id: true },
    });

    if (!exists) {
      return NextResponse.json({ ok: false, error: 'Empleado no encontrado' }, { status: 404 });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.empleado.update({
      where: { id: empleadoId },
      data: { contrasena: hashed },
      select: { id: true },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error reseteando contraseña' },
      { status: 500 }
    );
  }
}
