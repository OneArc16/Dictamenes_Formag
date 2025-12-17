import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import bcrypt from 'bcryptjs';

function isAdmin(role: unknown) {
  return String(role) === 'ADMIN';
}

export async function POST(req: Request) {
  try {
    // Auth (JWT cookie)
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

    const tipoDocumento = String(body?.tipoDocumento ?? '').trim();
    const numeroIdentidad = String(body?.numeroIdentidad ?? '').trim();
    const primerNombre = String(body?.primerNombre ?? '').trim();
    const primerApellido = String(body?.primerApellido ?? '').trim();
    const email = String(body?.email ?? '').trim().toLowerCase();
    const password = String(body?.password ?? '').trim();

    const segundoNombre = body?.segundoNombre ? String(body.segundoNombre).trim() : null;
    const segundoApellido = body?.segundoApellido ? String(body.segundoApellido).trim() : null;
    const telefonos = body?.telefonos ? String(body.telefonos).trim() : null;
    const direccion = body?.direccion ? String(body.direccion).trim() : null;

    const registroMedico = body?.registroMedico ? String(body.registroMedico).trim() : null;
    const licencia = body?.licencia ? String(body.licencia).trim() : null;

    const perfilIdRaw = body?.perfilId;
    const perfilId = perfilIdRaw === '' || perfilIdRaw == null ? null : Number(perfilIdRaw);

    const activo = body?.activo === false ? false : true;

    // Validaciones mínimas (para login ordenado)
    if (!tipoDocumento || !numeroIdentidad) {
      return NextResponse.json(
        { ok: false, error: 'Tipo y número de documento son obligatorios' },
        { status: 400 }
      );
    }
    if (!primerNombre || !primerApellido) {
      return NextResponse.json(
        { ok: false, error: 'Nombres y apellidos (mínimo primer nombre y primer apellido) son obligatorios' },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json({ ok: false, error: 'Email es obligatorio' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { ok: false, error: 'La contraseña es obligatoria y debe tener mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    // Validar perfil si viene
    if (perfilId != null && !Number.isFinite(perfilId)) {
      return NextResponse.json({ ok: false, error: 'Perfil inválido' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const created = await prisma.empleado.create({
      data: {
        tipoDocumento,
        numeroIdentidad,
        primerNombre,
        segundoNombre,
        primerApellido,
        segundoApellido,
        email,
        contrasena: hashed,
        activo,
        perfilId,
        telefonos,
        direccion,
        registroMedico,
        licencia,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (err: any) {
    // Prisma unique error
    if (err?.code === 'P2002') {
      return NextResponse.json(
        { ok: false, error: 'Ya existe un empleado con ese email o documento' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error creando empleado' },
      { status: 500 }
    );
  }
}
