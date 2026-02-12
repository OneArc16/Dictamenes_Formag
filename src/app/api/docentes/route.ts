// app/api/docentes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

// Helpers básicos
function emptyToNull(v: any): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function toUpperOrNull(v: any): string | null {
  const s = emptyToNull(v);
  return s ? s.toUpperCase() : null;
}

function truncate(v: any, max: number): string | null {
  const s = emptyToNull(v);
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

function toIntOrNull(v: any): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function calcularEdadYFecha(fechaStr?: string): { fechaNacimiento: Date | null; edad: number | null } {
  if (!fechaStr) return { fechaNacimiento: null, edad: null };

  const fecha = new Date(`${fechaStr}T00:00:00`);
  if (isNaN(fecha.getTime())) return { fechaNacimiento: null, edad: null };

  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const m = hoy.getMonth() - fecha.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) edad--;
  if (edad < 0) edad = 0;

  return { fechaNacimiento: fecha, edad };
}

// ==========================
// ✅ Anti-P2000: obtener límites VARCHAR reales y truncar
// ==========================
let usuarioCharLimitsCache: Record<string, number> | null = null;

function toSnake(s: string) {
  return s.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

async function getUsuarioCharLimits(): Promise<Record<string, number>> {
  if (usuarioCharLimitsCache) return usuarioCharLimitsCache;

  try {
    // Nota: esto cubre usuario / Usuario / USUARIO
    const rows = await prisma.$queryRaw<
      Array<{ column_name: string; character_maximum_length: number | null }>
    >`
      SELECT column_name, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND lower(table_name) = lower('Usuario')
        AND character_maximum_length IS NOT NULL
    `;

    const out: Record<string, number> = {};
    for (const r of rows) {
      if (r.column_name && r.character_maximum_length) {
        out[String(r.column_name)] = Number(r.character_maximum_length);
      }
    }

    usuarioCharLimitsCache = out;
    return out;
  } catch (e) {
    // si no podemos leer info_schema, no bloqueamos el guardado
    usuarioCharLimitsCache = {};
    return {};
  }
}

function applyDbStringLimits(data: Record<string, any>, limits: Record<string, number>) {
  const truncated: Array<{ field: string; from: number; to: number }> = [];

  for (const [key, val] of Object.entries(data)) {
    if (typeof val !== 'string') continue;

    const k1 = key;                 // camelCase
    const k2 = key.toLowerCase();   // por si info_schema devuelve lowercase
    const k3 = toSnake(key);        // snake_case por si tu tabla usa underscores

    const max =
      limits[k1] ??
      limits[k2] ??
      limits[k3] ??
      limits[k3.toLowerCase()] ??
      null;

    if (max && val.length > max) {
      data[key] = val.slice(0, max);
      truncated.push({ field: key, from: val.length, to: max });
    }
  }

  return truncated;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const form = body?.form;

    if (!form) {
      return NextResponse.json({ ok: false, error: 'Faltan datos del formulario' }, { status: 400 });
    }

    const numeroDocumento = String(form.numeroDocumento ?? '').trim();
    const tipoDocumento = String(form.tipoDocumento ?? '').trim();

    if (!numeroDocumento || !tipoDocumento) {
      return NextResponse.json(
        { ok: false, error: 'Tipo y número de documento son obligatorios.' },
        { status: 400 },
      );
    }

    // 1) Buscar si ya existe
    const existing = await prisma.usuario.findFirst({
      where: { identificacion: numeroDocumento, tipoIdentificacion: tipoDocumento },
      select: { id: true },
    });

    // 2) Edad y fecha de nacimiento
    const { fechaNacimiento, edad } = calcularEdadYFecha(form.fechaNacimiento);

    // 3) País residencia
    let residenciaPaisCodigo = 'COL';
    if (form.pais) {
      const paisDb = await prisma.pais.findFirst({
        where: {
          OR: [
            { nombre: { equals: form.pais, mode: 'insensitive' } },
            { codigo: String(form.pais) },
          ],
        },
        select: { codigo: true },
      });
      if (paisDb) residenciaPaisCodigo = paisDb.codigo;
    }

    // 4) Depto / municipio
    let codigoDepartamento: string | null = null;
    let codigoMunicipio: string | null = null;

    if (form.departamento) {
      const depDb = await prisma.departamento.findFirst({
        where: { nombre: { equals: form.departamento, mode: 'insensitive' } },
        select: { codigo: true },
      });
      if (depDb) codigoDepartamento = depDb.codigo;
    }

    if (form.municipio) {
      const muniDb = await prisma.municipio.findFirst({
        where: { nombre: { equals: form.municipio, mode: 'insensitive' } },
        select: { codigo: true },
      });
      if (muniDb) codigoMunicipio = muniDb.codigo;
    }

    // 5) BarrioId
    let barrioId: number | null = null;
    if (codigoMunicipio && form.barrio) {
      const barrioDb = await prisma.barrio.findFirst({
        where: { codigoMunicipio, nombre: { equals: form.barrio, mode: 'insensitive' } },
        select: { id: true },
      });
      if (barrioDb) barrioId = barrioDb.id;
    }

    // 6) Secretaría / institución
    let secretariaId: number | null = null;
    if (form.secretariaLabora) {
      const secDb = await prisma.secretaria.findFirst({
        where: { nombre: { equals: form.secretariaLabora, mode: 'insensitive' } },
        select: { id: true },
      });
      if (secDb) secretariaId = secDb.id;
    }

    let institucionEducativaId: number | null = null;
    if (form.institucionLabora) {
      const instDb = await prisma.institucionEducativa.findFirst({
        where: { nombre: { equals: form.institucionLabora, mode: 'insensitive' } },
        select: { id: true },
      });
      if (instDb) institucionEducativaId = instDb.id;
    }

    // ✅ 6.5) Cargo docente + escolaridad (NUEVO)
    const cargoDocenteId = toIntOrNull(form.cargoDocenteId);
    // ojo: aquí NO asumo tamaño; luego aplico límites reales del schema
    const escolaridad = emptyToNull(form.escolaridad);

    // 7) EPS obligatoria
    let codigoEps: string = String(form.codigoEps ?? form.aseguradoraCodigo ?? '').trim();
    if (!codigoEps) {
      return NextResponse.json({ ok: false, error: 'Debe seleccionar una aseguradora (EPS).' }, { status: 400 });
    }

    const epsDb = await prisma.eps.findUnique({ where: { codigo: codigoEps }, select: { codigo: true } });
    if (!epsDb) {
      return NextResponse.json({ ok: false, error: 'La EPS seleccionada no existe en la base de datos.' }, { status: 400 });
    }
    codigoEps = epsDb.codigo;

    // 8) Zona
    const zonaResidencia = form.zona === 'RURAL' || form.zona === 'R' ? 'R' : 'U';

    // 9) Nombres obligatorios
    const primerNombreRaw = String(form.primerNombre ?? '').trim();
    const primerApellidoRaw = String(form.primerApellido ?? '').trim();
    if (!primerNombreRaw || !primerApellidoRaw) {
      return NextResponse.json({ ok: false, error: 'Primer nombre y primer apellido son obligatorios.' }, { status: 400 });
    }

    const primerNombre = primerNombreRaw.toUpperCase();
    const primerApellido = primerApellidoRaw.toUpperCase();
    const segundoNombre = toUpperOrNull(form.segundoNombre);
    const segundoApellido = toUpperOrNull(form.segundoApellido);

    // 10) Escalafón
    const gradoEscalafonRaw = String(form.gradoEscalafon ?? '').trim();
    const gradoEscalafonDb = gradoEscalafonRaw.length > 2 ? gradoEscalafonRaw.slice(0, 2) : gradoEscalafonRaw;

    const nivelEscalafonRaw = String(form.nivelEscalafon ?? '').trim();
    let nivelEscalafonDb: string | null = null;
    if (nivelEscalafonRaw) {
      nivelEscalafonDb = nivelEscalafonRaw === 'NO_APLICA' ? '0' : nivelEscalafonRaw.charAt(0);
    }
    if (!gradoEscalafonDb || !nivelEscalafonDb) {
      return NextResponse.json({ ok: false, error: 'Debe indicar grado y nivel de escalafón.' }, { status: 400 });
    }

    // 11) Sexo (front -> BD)
    const sexoForm = String(form.sexo ?? '').trim();
    const sexoDb = sexoForm === 'M' ? 'H' : sexoForm === 'F' ? 'M' : 'O';

    // 12) Forma vinculación
    const formaVinculacionRaw = String(form.formaVinculacion ?? '').trim();
    const formaVinculacion = (formaVinculacionRaw || 'PROPIEDAD').toUpperCase();

    // 13) Data usuario
    const dataUsuario: any = {
      carnet: emptyToNull(numeroDocumento),
      identificacion: emptyToNull(numeroDocumento),
      tipoIdentificacion: emptyToNull(tipoDocumento),

      primerNombre: emptyToNull(primerNombre),
      segundoNombre,
      primerApellido: emptyToNull(primerApellido),
      segundoApellido,

      direccion: emptyToNull(form.direccion),
      telefono: emptyToNull(form.telefono),

      tipoUsuario: 'DO',
      unidadEdad: 'A',
      edad: edad ?? null,
      sexo: sexoDb,

      residenciaPais: residenciaPaisCodigo,
      zonaResidencia,

      fechaNacimiento,
      estadoCivil: emptyToNull(form.estadoCivil),

      sector: emptyToNull(form.sector || 'EDUCATIVO'),

      codigoEps,
      categoria: emptyToNull(form.categoria),

      celular: emptyToNull(form.celular ?? form.telefono),
      email: emptyToNull(form.email),

      barrio: emptyToNull(form.barrio),
      barrioId,
      codigoDepartamento,
      codigoMunicipio,

      gradoEscalafon: emptyToNull(gradoEscalafonDb),
      nivelEscalafon: emptyToNull(nivelEscalafonDb),
      formaVinculacion: emptyToNull(formaVinculacion),

      secretariaId,
      institucionEducativaId,

      // ✅ NUEVO
      cargoDocenteId,
      escolaridad,
    };

    // ✅ APLICAR límites reales de la BD (evita P2000)
    const limits = await getUsuarioCharLimits();
    const truncated = applyDbStringLimits(dataUsuario, limits);

    if (truncated.length) {
      console.warn('⚠️ Se truncaron campos por límite VARCHAR:', truncated);
    }

    // 14) Crear o actualizar
    let usuario;
    if (existing) {
      usuario = await prisma.usuario.update({ where: { id: existing.id }, data: dataUsuario });
    } else {
      usuario = await prisma.usuario.create({ data: dataUsuario });
    }

    return NextResponse.json({ ok: true, usuario });
  } catch (error: any) {
    console.error('Error guardando docente:', error, error?.meta);

    // ✅ Mensaje más claro para P2000
    if (error?.code === 'P2000') {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Uno de los campos de texto excede el tamaño permitido en la base de datos (VARCHAR). Revisa escolaridad / formaVinculacion / estadoCivil, etc.',
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { ok: false, error: error?.message ?? 'Error guardando docente' },
      { status: 500 },
    );
  }
}