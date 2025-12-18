import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import bcrypt from 'bcryptjs';

function isAdmin(role: unknown) {
  return String(role) === 'ADMIN';
}

const upper = (v: any) => String(v ?? '').trim().toUpperCase();
const upperOrNull = (v: any) => {
  const s = String(v ?? '').trim();
  return s ? s.toUpperCase() : null;
};
const lower = (v: any) => String(v ?? '').trim().toLowerCase();

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
    const empleadoId = Number(id);
    if (!Number.isFinite(empleadoId)) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
    }

    const body = await req.json();

    const tipoDocumento = upper(body?.tipoDocumento);
    const numeroIdentidad = upper(body?.numeroIdentidad);

    const primerNombre = upper(body?.primerNombre);
    const segundoNombre = upperOrNull(body?.segundoNombre);
    const primerApellido = upper(body?.primerApellido);
    const segundoApellido = upperOrNull(body?.segundoApellido);

    const telefonos = upperOrNull(body?.telefonos);
    const direccion = upperOrNull(body?.direccion);

    const registroMedico = upperOrNull(body?.registroMedico);
    const licencia = upperOrNull(body?.licencia);

    const email = lower(body?.email);

    const perfilIdRaw = body?.perfilId;
    const perfilId = perfilIdRaw === '' || perfilIdRaw == null ? null : Number(perfilIdRaw);

    const activo = body?.activo === false ? false : true;

    const password = String(body?.password ?? '').trim(); // opcional

    // Validaciones mínimas
    if (!tipoDocumento || !numeroIdentidad) {
      return NextResponse.json(
        { ok: false, error: 'Tipo y número de documento son obligatorios' },
        { status: 400 }
      );
    }
    if (!primerNombre || !primerApellido) {
      return NextResponse.json(
        { ok: false, error: 'Primer nombre y primer apellido son obligatorios' },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json({ ok: false, error: 'Email es obligatorio' }, { status: 400 });
    }
    if (perfilId != null && !Number.isFinite(perfilId)) {
      return NextResponse.json({ ok: false, error: 'Perfil inválido' }, { status: 400 });
    }
    if (password && password.length < 6) {
      return NextResponse.json(
        { ok: false, error: 'La nueva contraseña debe tener mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    // Existe?
    const current = await prisma.empleado.findUnique({
      where: { id: empleadoId },
      select: { id: true },
    });
    if (!current) {
      return NextResponse.json({ ok: false, error: 'Empleado no encontrado' }, { status: 404 });
    }

    // Unicidad (excluyendo el mismo empleado)
    const existingByDoc = await prisma.empleado.findFirst({
      where: {
        tipoDocumento,
        numeroIdentidad,
        NOT: { id: empleadoId },
      },
      select: { id: true, activo: true },
    });
    if (existingByDoc) {
      return NextResponse.json(
        {
          ok: false,
          error:
            `Ya existe otro empleado con ese documento (ID ${existingByDoc.id})` +
            (existingByDoc.activo ? '' : ' [INACTIVO]'),
        },
        { status: 409 }
      );
    }

    const existingByEmail = await prisma.empleado.findFirst({
      where: {
        email,
        NOT: { id: empleadoId },
      },
      select: { id: true, activo: true },
    });
    if (existingByEmail) {
      return NextResponse.json(
        {
          ok: false,
          error:
            `Ya existe otro empleado con ese email (ID ${existingByEmail.id})` +
            (existingByEmail.activo ? '' : ' [INACTIVO]'),
        },
        { status: 409 }
      );
    }

    const dataToUpdate: any = {
      tipoDocumento,
      numeroIdentidad,
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      email,
      activo,
      perfilId,
      telefonos,
      direccion,
      registroMedico,
      licencia,
    };

    if (password) {
      dataToUpdate.contrasena = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.empleado.update({
      where: { id: empleadoId },
      data: dataToUpdate,
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: updated.id });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      const target = err?.meta?.target;
      const targetStr = Array.isArray(target) ? target.join(', ') : String(target ?? '');
      return NextResponse.json(
        { ok: false, error: `Conflicto de unicidad: ${targetStr || 'email/documento'}` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error actualizando empleado' },
      { status: 500 }
    );
  }
}
