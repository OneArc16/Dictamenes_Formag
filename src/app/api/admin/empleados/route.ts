import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAdmin(role: unknown) {
  return String(role) === 'ADMIN';
}

const upper = (v: any) => String(v ?? '').trim().toUpperCase();
const upperOrNull = (v: any) => {
  const s = String(v ?? '').trim();
  return s ? s.toUpperCase() : null;
};
const lower = (v: any) => String(v ?? '').trim().toLowerCase();

function toBool(v: any) {
  const s = String(v ?? '').trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'si' || s === 'sí';
}

function isFirmaOk(file: File) {
  const okType = file.type === 'image/png' || file.type === 'image/jpeg';
  const okSize = file.size <= 2 * 1024 * 1024; // 2MB
  return okType && okSize;
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;

    if (!token) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload || !isAdmin((payload as any).role)) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 403 });
    }

    const ct = req.headers.get('content-type') || '';
    let body: any = {};
    let firmaFile: File | null = null;
    let especialidadIds: number[] = [];

    if (ct.includes('multipart/form-data')) {
      const form = await req.formData();

      body.tipoDocumento = form.get('tipoDocumento');
      body.numeroIdentidad = form.get('numeroIdentidad');
      body.usuario = form.get('usuario');
      body.primerNombre = form.get('primerNombre');
      body.segundoNombre = form.get('segundoNombre');
      body.primerApellido = form.get('primerApellido');
      body.segundoApellido = form.get('segundoApellido');
      body.email = form.get('email');
      body.password = form.get('password');

      body.perfilId = form.get('perfilId');
      body.activo = form.get('activo');

      body.telefonos = form.get('telefonos');
      body.direccion = form.get('direccion');
      body.registroMedico = form.get('registroMedico');
      body.licencia = form.get('licencia');

      body.esMiembroJunta = form.get('esMiembroJunta');

      especialidadIds = form
        .getAll('especialidadIds')
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n) && n > 0);

      const f = form.get('firma');
      firmaFile = f instanceof File ? f : null;
    } else {
      body = await req.json();

      especialidadIds = Array.isArray(body?.especialidadIds)
        ? body.especialidadIds.map(Number).filter((n: any) => Number.isFinite(n) && n > 0)
        : [];
    }

    // Normalización
    const tipoDocumento = upper(body?.tipoDocumento);
    const numeroIdentidad = upper(body?.numeroIdentidad);
    const usuario = lower(body?.usuario);

    const primerNombre = upper(body?.primerNombre);
    const segundoNombre = upperOrNull(body?.segundoNombre);
    const primerApellido = upper(body?.primerApellido);
    const segundoApellido = upperOrNull(body?.segundoApellido);

    const telefonos = upperOrNull(body?.telefonos);
    const direccion = upperOrNull(body?.direccion);

    const registroMedico = upperOrNull(body?.registroMedico);
    const licencia = upperOrNull(body?.licencia);

    const email = lower(body?.email);
    const password = String(body?.password ?? '').trim();

    const perfilIdRaw = body?.perfilId;
    const perfilId = perfilIdRaw === '' || perfilIdRaw == null ? null : Number(perfilIdRaw);

    const activo =
      body?.activo == null
        ? true
        : typeof body.activo === 'boolean'
          ? body.activo
          : toBool(body.activo);

    const esMiembroJunta = toBool(body?.esMiembroJunta);

    // Validaciones
    if (!tipoDocumento || !numeroIdentidad) {
      return NextResponse.json({ ok: false, error: 'Tipo y número de documento son obligatorios' }, { status: 400 });
    }
    if (!usuario || usuario.length < 3) {
      return NextResponse.json({ ok: false, error: 'Usuario es obligatorio y debe tener mínimo 3 caracteres' }, { status: 400 });
    }
    if (!/^[a-z0-9._-]+$/.test(usuario)) {
      return NextResponse.json({ ok: false, error: 'Usuario solo puede tener letras, números, punto, guion o guion bajo' }, { status: 400 });
    }
    if (!primerNombre || !primerApellido) {
      return NextResponse.json(
        { ok: false, error: 'Nombres y apellidos (mínimo primer nombre y primer apellido) son obligatorios' },
        { status: 400 }
      );
    }
    if (!email) return NextResponse.json({ ok: false, error: 'Email es obligatorio' }, { status: 400 });
    if (!password || password.length < 6) {
      return NextResponse.json({ ok: false, error: 'La contraseña es obligatoria y debe tener mínimo 6 caracteres' }, { status: 400 });
    }
    if (perfilId != null && !Number.isFinite(perfilId)) {
      return NextResponse.json({ ok: false, error: 'Perfil inválido' }, { status: 400 });
    }

    // Si es junta, debe traer firma (en creación)
    if (esMiembroJunta && ct.includes('multipart/form-data')) {
      if (!firmaFile) {
        return NextResponse.json({ ok: false, error: 'Si es miembro de junta, debe cargar firma (PNG/JPG).' }, { status: 400 });
      }
      if (!isFirmaOk(firmaFile)) {
        return NextResponse.json({ ok: false, error: 'Firma inválida. Solo PNG/JPG y máximo 2MB.' }, { status: 400 });
      }
    }

    // Perfil activo
    if (perfilId != null) {
      const perfilOk = await prisma.perfil.findFirst({
        where: { id: perfilId, estado: 1 },
        select: { id: true },
      });
      if (!perfilOk) return NextResponse.json({ ok: false, error: 'Perfil inválido o inactivo' }, { status: 400 });
    }

    // Unicidad
    const existingByDoc = await prisma.empleado.findFirst({
      where: { tipoDocumento, numeroIdentidad },
      select: { id: true, activo: true },
    });
    if (existingByDoc) {
      return NextResponse.json(
        { ok: false, error: `Ya existe un empleado con ese documento (ID ${existingByDoc.id})${existingByDoc.activo ? '' : ' [INACTIVO]'}` },
        { status: 409 }
      );
    }

    const existingByEmail = await prisma.empleado.findFirst({
      where: { email },
      select: { id: true, activo: true },
    });
    if (existingByEmail) {
      return NextResponse.json(
        { ok: false, error: `Ya existe un empleado con ese email (ID ${existingByEmail.id})${existingByEmail.activo ? '' : ' [INACTIVO]'}` },
        { status: 409 }
      );
    }

    const existingByUsuario = await prisma.empleado.findFirst({
      where: { usuario },
      select: { id: true, activo: true },
    });
    if (existingByUsuario) {
      return NextResponse.json(
        { ok: false, error: `Ya existe un empleado con ese usuario (ID ${existingByUsuario.id})${existingByUsuario.activo ? '' : ' [INACTIVO]'}` },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    // Firma bytes
    let firmaBytes: Buffer | null = null;
    let firmaMime: string | null = null;

    if (firmaFile) {
      firmaMime = firmaFile.type || null;
      firmaBytes = Buffer.from(await firmaFile.arrayBuffer());
    }

    const uniqueEspecialidadIds = Array.from(new Set(especialidadIds));

    const tratamientoRaw = String(body?.tratamiento ?? '').trim().toUpperCase();
    const tratamiento = tratamientoRaw === 'DRA' ? 'DRA' : 'DR'; // default DR

    const created = await prisma.empleado.create({
      data: {
        tipoDocumento,
        numeroIdentidad,
        usuario,
        primerNombre,
        segundoNombre,
        primerApellido,
        segundoApellido,
        email,
        contrasena: hashed,
        activo,

        // ✅ como tu schema soporta perfilId, puedes usar connect (seguro)
        ...(perfilId != null ? { perfil: { connect: { id: perfilId } } } : {}),

        telefonos,
        direccion,
        registroMedico,
        licencia,

        esMiembroJunta,

        firma: firmaBytes,
        firmaMime,

        ...(uniqueEspecialidadIds.length
          ? {
              especialidades: {
                create: uniqueEspecialidadIds.map((especialidadId) => ({
                  especialidadId,
                  principal: false,
                })),
              },
            }
          : {}),
          tratamiento,
      } as any,
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      const target = err?.meta?.target;
      const targetStr = Array.isArray(target) ? target.join(', ') : String(target ?? '');
      return NextResponse.json(
        { ok: false, error: `Conflicto de unicidad: ${targetStr || 'usuario/email/documento'}` },
        { status: 409 }
      );
    }

    console.error(err);
    return NextResponse.json({ ok: false, error: err?.message ?? 'Error creando empleado' }, { status: 500 });
  }
}
