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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth')?.value;

    if (!token) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload || !isAdmin((payload as any).role)) {
      return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const empleadoId = Number(id);
    if (!Number.isFinite(empleadoId) || empleadoId <= 0) {
      return NextResponse.json({ ok: false, error: 'ID inválido' }, { status: 400 });
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
      body.idSede = form.get('idSede');
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

    const perfilIdRaw = body?.perfilId;
    const perfilId = perfilIdRaw === '' || perfilIdRaw == null ? null : Number(perfilIdRaw);
    const idSedeRaw = body?.idSede;
    const idSede = idSedeRaw === '' || idSedeRaw == null ? null : Number(idSedeRaw);

    const activo =
      body?.activo == null
        ? true
        : typeof body.activo === 'boolean'
          ? body.activo
          : toBool(body.activo);

    const password = String(body?.password ?? '').trim();
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
      return NextResponse.json({ ok: false, error: 'Primer nombre y primer apellido son obligatorios' }, { status: 400 });
    }
    if (!email) return NextResponse.json({ ok: false, error: 'Email es obligatorio' }, { status: 400 });
    if (perfilId != null && !Number.isFinite(perfilId)) {
      return NextResponse.json({ ok: false, error: 'Perfil inválido' }, { status: 400 });
    }
    if (idSede != null && !Number.isFinite(idSede)) {
      return NextResponse.json({ ok: false, error: 'Sede inválida' }, { status: 400 });
    }
    if (password && password.length < 6) {
      return NextResponse.json({ ok: false, error: 'La nueva contraseña debe tener mínimo 6 caracteres' }, { status: 400 });
    }

    // Existe? (traemos firma actual para validar junta)
    const current = await prisma.empleado.findUnique({
      where: { id: empleadoId },
      select: { id: true, firma: true },
    });
    if (!current) return NextResponse.json({ ok: false, error: 'Empleado no encontrado' }, { status: 404 });

    // Firma nueva (si viene)
    if (firmaFile && !isFirmaOk(firmaFile)) {
      return NextResponse.json({ ok: false, error: 'Firma inválida. Solo PNG/JPG y máximo 2MB.' }, { status: 400 });
    }

    // Si lo activan como junta, debe tener firma (o ya tenía o viene nueva)
    if (esMiembroJunta && !firmaFile && !current.firma) {
      return NextResponse.json({ ok: false, error: 'Si es miembro de junta, debe tener firma (PNG/JPG).' }, { status: 400 });
    }

    // Perfil activo
    if (perfilId != null) {
      const perfilOk = await prisma.perfil.findFirst({
        where: { id: perfilId, estado: 1 },
        select: { id: true },
      });
      if (!perfilOk) return NextResponse.json({ ok: false, error: 'Perfil inválido o inactivo' }, { status: 400 });
    }

    if (idSede != null) {
      const sedeOk = await prisma.sede.findFirst({
        where: { id: idSede, estado: 1 },
        select: { id: true },
      });
      if (!sedeOk) return NextResponse.json({ ok: false, error: 'Sede inválida o inactiva' }, { status: 400 });
    }

    // Unicidad excluyendo el mismo
    const existingByDoc = await prisma.empleado.findFirst({
      where: { tipoDocumento, numeroIdentidad, NOT: { id: empleadoId } },
      select: { id: true, activo: true },
    });
    if (existingByDoc) {
      return NextResponse.json(
        { ok: false, error: `Ya existe otro empleado con ese documento (ID ${existingByDoc.id})${existingByDoc.activo ? '' : ' [INACTIVO]'}` },
        { status: 409 }
      );
    }

    const existingByEmail = await prisma.empleado.findFirst({
      where: { email, NOT: { id: empleadoId } },
      select: { id: true, activo: true },
    });
    if (existingByEmail) {
      return NextResponse.json(
        { ok: false, error: `Ya existe otro empleado con ese email (ID ${existingByEmail.id})${existingByEmail.activo ? '' : ' [INACTIVO]'}` },
        { status: 409 }
      );
    }

    const existingByUsuario = await prisma.empleado.findFirst({
      where: { usuario, NOT: { id: empleadoId } },
      select: { id: true, activo: true },
    });
    if (existingByUsuario) {
      return NextResponse.json(
        { ok: false, error: `Ya existe otro empleado con ese usuario (ID ${existingByUsuario.id})${existingByUsuario.activo ? '' : ' [INACTIVO]'}` },
        { status: 409 }
      );
    }
    const tratamientoRaw = String(body?.tratamiento ?? '').trim().toUpperCase();
    const tratamiento = tratamientoRaw === 'DRA' ? 'DRA' : 'DR';

    const dataToUpdate: any = {
      tipoDocumento,
      numeroIdentidad,
      usuario,
      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,
      email,
      activo,
      perfilId,
      idSede,
      telefonos,
      direccion,
      registroMedico,
      licencia,
      esMiembroJunta,
      tratamiento,
    };

    if (password) dataToUpdate.contrasena = await bcrypt.hash(password, 10);

    if (firmaFile) {
      dataToUpdate.firma = Buffer.from(await firmaFile.arrayBuffer());
      dataToUpdate.firmaMime = firmaFile.type || null;
    }

    const tx: any[] = [];

    // Reemplazar especialidades solo si mandan alguna
    if (especialidadIds.length) {
      const uniqueIds = Array.from(new Set(especialidadIds));
      tx.push(prisma.empleadoEspecialidad.deleteMany({ where: { empleadoId } }));
      tx.push(
        prisma.empleadoEspecialidad.createMany({
          data: uniqueIds.map((especialidadId) => ({
            empleadoId,
            especialidadId,
            principal: false,
          })),
        })
      );
    }

    tx.push(
      prisma.empleado.update({
        where: { id: empleadoId },
        data: dataToUpdate,
        select: { id: true },
      })
    );

    const result = await prisma.$transaction(tx);
    const updated = result[result.length - 1];

    return NextResponse.json({ ok: true, id: updated.id });
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
    return NextResponse.json({ ok: false, error: err?.message ?? 'Error actualizando empleado' }, { status: 500 });
  }
}
