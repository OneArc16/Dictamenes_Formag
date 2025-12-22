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

    // ✅ Mayúscula (excepto email)
    const tipoDocumento = upper(body?.tipoDocumento);
    const numeroIdentidad = upper(body?.numeroIdentidad); // si es numérico no cambia, si trae letras sí

    const primerNombre = upper(body?.primerNombre);
    const segundoNombre = upperOrNull(body?.segundoNombre);
    const primerApellido = upper(body?.primerApellido);
    const segundoApellido = upperOrNull(body?.segundoApellido);

    const telefonos = upperOrNull(body?.telefonos);
    const direccion = upperOrNull(body?.direccion);

    const registroMedico = upperOrNull(body?.registroMedico);
    const licencia = upperOrNull(body?.licencia);

    const email = lower(body?.email); // 👈 siempre minúscula
    const password = String(body?.password ?? '').trim();

    const perfilIdRaw = body?.perfilId;
    const perfilId = perfilIdRaw === '' || perfilIdRaw == null ? null : Number(perfilIdRaw);

    const activo = body?.activo === false ? false : true;

    // Validaciones mínimas
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
    if (perfilId != null && !Number.isFinite(perfilId)) {
      return NextResponse.json({ ok: false, error: 'Perfil inválido' }, { status: 400 });
    }

    // ✅ NUEVO: si envían perfilId, debe existir y estar ACTIVO
    if (perfilId != null) {
      const perfilOk = await prisma.perfil.findFirst({
        where: { id: perfilId, estado: 1 },
        select: { id: true },
      });

      if (!perfilOk) {
        return NextResponse.json(
          { ok: false, error: 'Perfil inválido o inactivo' },
          { status: 400 }
        );
      }
    }

    // Chequeos explícitos
    const existingByDoc = await prisma.empleado.findFirst({
      where: { tipoDocumento, numeroIdentidad },
      select: { id: true, activo: true },
    });
    if (existingByDoc) {
      return NextResponse.json(
        {
          ok: false,
          error: `Ya existe un empleado con ese documento (ID ${existingByDoc.id})` +
            (existingByDoc.activo ? '' : ' [INACTIVO]'),
        },
        { status: 409 }
      );
    }

    const existingByEmail = await prisma.empleado.findFirst({
      where: { email },
      select: { id: true, activo: true },
    });
    if (existingByEmail) {
      return NextResponse.json(
        {
          ok: false,
          error: `Ya existe un empleado con ese email (ID ${existingByEmail.id})` +
            (existingByEmail.activo ? '' : ' [INACTIVO]'),
        },
        { status: 409 }
      );
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
    if (err?.code === 'P2002') {
      const target = err?.meta?.target;
      const targetStr = Array.isArray(target) ? target.join(', ') : String(target ?? '');
      return NextResponse.json(
        { ok: false, error: `Conflicto de unicidad: ${targetStr || 'email/documento'}` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error creando empleado' },
      { status: 500 }
    );
  }
}
