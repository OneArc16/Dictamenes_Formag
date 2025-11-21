// app/api/docentes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function emptyToNull(v: any) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function toUpperOrNull(v: any): string | null {
  const s = emptyToNull(v);
  return s ? s.toUpperCase() : null;
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
    // 1) Buscar si ya existe el usuario
    // ==========================
    const existing = await prisma.usuario.findFirst({
      where: {
        identificacion: numeroDocumento,
        tipoIdentificacion: tipoDocumento,
      },
      select: { id: true },
    });

    // ==========================
    // 2) Calcular edad y fecha de nacimiento
    // ==========================
    const { fechaNacimiento, edad } = calcularEdadYFecha(
      form.fechaNacimiento,
    );

    // ==========================
    // 3) Resolver país de residencia (FK a paises)
    // ==========================
    let residenciaPaisCodigo = '057'; // Colombia por defecto

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

      if (paisDb) {
        residenciaPaisCodigo = paisDb.codigo;
      }
    }

    // ==========================
    // 4) Resolver departamento y municipio (por nombre)
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
    // 5) Resolver barrioId por nombre + municipio (opcional)
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
    // 6) Resolver Secretaría e Institución por nombre (opcionales)
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
    // 7) Resolver EPS / Aseguradora (código)
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
        : form.zona === 'URBANA' || form.zona === 'U'
        ? 'U'
        : 'U';

    // ==========================
    // 9) Validar nombres obligatorios mínimos
    //     y ponerlos en MAYÚSCULA
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

    // ===== Escalafón: grado (máx 2 caracteres) y nivel (1 carácter) =====
    const gradoEscalafonRaw = String(form.gradoEscalafon ?? '').trim();
    const gradoEscalafonDb =
      gradoEscalafonRaw.length > 2
        ? gradoEscalafonRaw.slice(0, 2)
        : gradoEscalafonRaw;

    const nivelEscalafonRaw = String(form.nivelEscalafon ?? '').trim();
    let nivelEscalafonDb: string | null = null;

    if (nivelEscalafonRaw) {
      if (nivelEscalafonRaw === 'NO_APLICA') {
        // Mapeamos "NO_APLICA" a un solo carácter
        nivelEscalafonDb = '0';
      } else {
        // Cualquier otro valor, nos quedamos con el primer carácter
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
    // 10) Mapear sexo del formulario a código BD
    //     Front:
    //       F -> Femenino
    //       M -> Masculino
    //     BD:
    //       H -> Hombre
    //       M -> Mujer
    // ==========================
    const sexoForm = String(form.sexo ?? '').trim();
    let sexoDb: string;

    if (sexoForm === 'M') {
      // Masculino en el form -> 'H' en BD
      sexoDb = 'H';
    } else if (sexoForm === 'F') {
      // Femenino en el form -> 'M' en BD
      sexoDb = 'M';
    } else {
      // Otro / vacío -> 'O' (ajusta si tu BD usa otro código)
      sexoDb = 'O';
    }

    // Forma de vinculación (propiedad / provisionalidad, etc.)
    const formaVinculacion =
      String(form.formaVinculacion ?? '').trim().toUpperCase() || 'PROPIEDAD';

    // ==========================
    // 11) Armar data para Prisma
    // ==========================
    const dataUsuario = {
      carnet: numeroDocumento,
      identificacion: numeroDocumento,
      tipoIdentificacion: tipoDocumento,

      primerNombre,
      segundoNombre,
      primerApellido,
      segundoApellido,

      direccion: emptyToNull(form.direccion),
      telefono: emptyToNull(form.telefono),

      tipoUsuario: 'DO', // Docente
      codigoOcupacion: emptyToNull(form.codigoOcupacion),

      unidadEdad: 'A', // Años
      edad: edad ?? null,
      sexo: sexoDb,

      residenciaPais: residenciaPaisCodigo,
      zonaResidencia,

      fechaNacimiento,
      estadoCivil: emptyToNull(form.estadoCivil),

      sector: emptyToNull(form.sector) ?? 'EDUCATIVO',

      discapacidad: false,
      estrato: form.estrato ? Number(form.estrato) : null,

      codigoEps,
      categoria: emptyToNull(form.categoria),

      etnia: emptyToNull(form.etnia),
      lugarNacimiento: emptyToNull(form.lugarNacimiento),

      nroHijos: form.nroHijos ? Number(form.nroHijos) : 0,
      escolaridad: emptyToNull(form.escolaridad),

      celular: emptyToNull(form.celular ?? form.telefono),
      email: emptyToNull(form.email),
      religion: emptyToNull(form.religion),
      telefonoSecundario: emptyToNull(form.telefonoSecundario),

      barrio: emptyToNull(form.barrio),
      barrioId,

      codigoDepartamento,
      codigoMunicipio,

      gradoEscalafon: gradoEscalafonDb,
      nivelEscalafon: nivelEscalafonDb,
      formaVinculacion,

      secretariaId,
      institucionEducativaId,
    };

    // ==========================
    // 12) Crear o actualizar usuario
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
    console.error('Error guardando docente:', error);
    return NextResponse.json(
      { ok: false, error: error?.message ?? 'Error guardando docente' },
      { status: 500 },
    );
  }
}
