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

function calcularEdadYFecha(fechaStr?: string): {
  fechaNacimiento: Date | null;
  edad: number | null;
} {
  if (!fechaStr) return { fechaNacimiento: null, edad: null };

  const fecha = new Date(`${fechaStr}T00:00:00`);
  if (isNaN(fecha.getTime())) return { fechaNacimiento: null, edad: null };

  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const m = hoy.getMonth() - fecha.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }
  if (edad < 0) edad = 0;

  return { fechaNacimiento: fecha, edad };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const form = body?.form;

    if (!form) {
      return NextResponse.json(
        { ok: false, error: 'Faltan datos del formulario' },
        { status: 400 },
      );
    }

    const numeroDocumento = String(form.numeroDocumento ?? '').trim();
    const tipoDocumento = String(form.tipoDocumento ?? '').trim();

    if (!numeroDocumento || !tipoDocumento) {
      return NextResponse.json(
        { ok: false, error: 'Tipo y número de documento son obligatorios.' },
        { status: 400 },
      );
    }

    // ==========================
    // 1) Buscar si ya existe
    // ==========================
    const existing = await prisma.usuario.findFirst({
      where: {
        identificacion: numeroDocumento,
        tipoIdentificacion: tipoDocumento,
      },
      select: { id: true },
    });

    // ==========================
    // 2) Edad y fecha de nacimiento
    // ==========================
    const { fechaNacimiento, edad } = calcularEdadYFecha(
      form.fechaNacimiento,
    );

    // ==========================
    // 3) País de residencia (FK a paises.codigo)
    //    En tu seed el código de Colombia es "COL"
    // ==========================
    let residenciaPaisCodigo = 'COL'; // por defecto

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

    // ==========================
    // 4) Depto y municipio (opcionales)
    // ==========================
    let codigoDepartamento: string | null = null;
    let codigoMunicipio: string | null = null;

    if (form.departamento) {
      const depDb = await prisma.departamento.findFirst({
        where: {
          nombre: { equals: form.departamento, mode: 'insensitive' },
        },
        select: { codigo: true },
      });
      if (depDb) codigoDepartamento = depDb.codigo;
    }

    if (form.municipio) {
      const muniDb = await prisma.municipio.findFirst({
        where: {
          nombre: { equals: form.municipio, mode: 'insensitive' },
        },
        select: { codigo: true },
      });
      if (muniDb) codigoMunicipio = muniDb.codigo;
    }

    // ==========================
    // 5) BarrioId (opcional)
    // ==========================
    let barrioId: number | null = null;
    if (codigoMunicipio && form.barrio) {
      const barrioDb = await prisma.barrio.findFirst({
        where: {
          codigoMunicipio,
          nombre: { equals: form.barrio, mode: 'insensitive' },
        },
        select: { id: true },
      });
      if (barrioDb) barrioId = barrioDb.id;
    }

    // ==========================
    // 6) Secretaría e institución (opcionales)
    // ==========================
    let secretariaId: number | null = null;
    if (form.secretariaLabora) {
      const secDb = await prisma.secretaria.findFirst({
        where: {
          nombre: { equals: form.secretariaLabora, mode: 'insensitive' },
        },
        select: { id: true },
      });
      if (secDb) secretariaId = secDb.id;
    }

    let institucionEducativaId: number | null = null;
    if (form.institucionLabora) {
      const instDb = await prisma.institucionEducativa.findFirst({
        where: {
          nombre: { equals: form.institucionLabora, mode: 'insensitive' },
        },
        select: { id: true },
      });
      if (instDb) institucionEducativaId = instDb.id;
    }

    // ==========================
    // 7) EPS obligatoria
    // ==========================
    let codigoEps: string = String(
      form.codigoEps ?? form.aseguradoraCodigo ?? '',
    ).trim();

    if (!codigoEps) {
      return NextResponse.json(
        { ok: false, error: 'Debe seleccionar una aseguradora (EPS).' },
        { status: 400 },
      );
    }

    const epsDb = await prisma.eps.findUnique({
      where: { codigo: codigoEps },
      select: { codigo: true },
    });

    if (!epsDb) {
      return NextResponse.json(
        { ok: false, error: 'La EPS seleccionada no existe en la base de datos.' },
        { status: 400 },
      );
    }
    codigoEps = epsDb.codigo;

    // ==========================
    // 8) Zona residencia -> 'U' / 'R'
    // ==========================
    const zonaResidencia =
      form.zona === 'RURAL' || form.zona === 'R'
        ? 'R'
        : 'U';

    // ==========================
    // 9) Nombres obligatorios en mayúscula
    // ==========================
    const primerNombreRaw = String(form.primerNombre ?? '').trim();
    const primerApellidoRaw = String(form.primerApellido ?? '').trim();

    if (!primerNombreRaw || !primerApellidoRaw) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Primer nombre y primer apellido son obligatorios.',
        },
        { status: 400 },
      );
    }

    const primerNombre = primerNombreRaw.toUpperCase();
    const primerApellido = primerApellidoRaw.toUpperCase();
    const segundoNombre = toUpperOrNull(form.segundoNombre);
    const segundoApellido = toUpperOrNull(form.segundoApellido);

    // ==========================
    // 10) Escalafón
    // ==========================
    const gradoEscalafonRaw = String(form.gradoEscalafon ?? '').trim();
    const gradoEscalafonDb =
      gradoEscalafonRaw.length > 2
        ? gradoEscalafonRaw.slice(0, 2)
        : gradoEscalafonRaw;

    const nivelEscalafonRaw = String(form.nivelEscalafon ?? '').trim();
    let nivelEscalafonDb: string | null = null;

    if (nivelEscalafonRaw) {
      if (nivelEscalafonRaw === 'NO_APLICA') {
        nivelEscalafonDb = '0';
      } else {
        nivelEscalafonDb = nivelEscalafonRaw.charAt(0);
      }
    }

    if (!gradoEscalafonDb || !nivelEscalafonDb) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Debe indicar grado y nivel de escalafón.',
        },
        { status: 400 },
      );
    }

    // ==========================
    // 11) Sexo (front -> BD)
    //      F (form) -> M (Mujer)
    //      M (form) -> H (Hombre)
    // ==========================
    const sexoForm = String(form.sexo ?? '').trim();
    let sexoDb: string;
    if (sexoForm === 'M') {
      sexoDb = 'H';
    } else if (sexoForm === 'F') {
      sexoDb = 'M';
    } else {
      sexoDb = 'O';
    }

    // ==========================
    // 12) Forma de vinculación
    // ==========================
    const formaVinculacionRaw = String(form.formaVinculacion ?? '').trim();
    const formaVinculacion =
      (formaVinculacionRaw || 'PROPIEDAD').toUpperCase();

    // ==========================
    // 13) Data MÍNIMA para crear/actualizar usuario
    //     (solo campos obligatorios + algunos importantes)
    // ==========================
    const dataUsuario: any = {
      carnet: truncate(numeroDocumento, 50),
      identificacion: truncate(numeroDocumento, 20),
      tipoIdentificacion: truncate(tipoDocumento, 2),

      primerNombre: truncate(primerNombre, 50),
      segundoNombre: truncate(segundoNombre, 50),
      primerApellido: truncate(primerApellido, 50),
      segundoApellido: truncate(segundoApellido, 50),

      // Contacto básico (opcionales)
      direccion: truncate(form.direccion, 255),
      telefono: truncate(form.telefono, 15),

      tipoUsuario: 'DO',     // Docente
      unidadEdad: 'A',       // Años
      edad: edad ?? null,
      sexo: sexoDb,

      residenciaPais: residenciaPaisCodigo,
      zonaResidencia,

      fechaNacimiento,
      estadoCivil: truncate(form.estadoCivil, 20),

      sector: truncate(form.sector || 'EDUCATIVO', 50),

      codigoEps,
      categoria: truncate(form.categoria, 30),

      celular: truncate(form.celular ?? form.telefono, 15),
      email: truncate(form.email, 100),

      // Ubicación opcional
      barrio: truncate(form.barrio, 50),
      barrioId,
      codigoDepartamento,
      codigoMunicipio,

      // Datos docentes
      gradoEscalafon: gradoEscalafonDb,
      nivelEscalafon: nivelEscalafonDb,
      formaVinculacion: truncate(formaVinculacion, 45),

      secretariaId,
      institucionEducativaId,
    };

    // ==========================
    // 14) Crear o actualizar
    // ==========================
    let usuario;
    if (existing) {
      usuario = await prisma.usuario.update({
        where: { id: existing.id },
        data: dataUsuario,
      });
    } else {
      usuario = await prisma.usuario.create({
        data: dataUsuario,
      });
    }

    return NextResponse.json({ ok: true, usuario });
  } catch (error: any) {
    console.error('Error guardando docente:', error, error?.meta);
    return NextResponse.json(
      {
        ok: false,
        error: error?.message ?? 'Error guardando docente',
      },
      { status: 500 },
    );
  }
}
