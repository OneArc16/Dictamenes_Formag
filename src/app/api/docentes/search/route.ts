// app/api/docentes/search/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function mapSexoToFrontend(sexo: string | null): string {
  if (!sexo) return '';
  const s = sexo.toUpperCase();

  // BD: H = Hombre, M = Mujer
  // Formulario: M = Masculino, F = Femenino
  if (s === 'H') return 'M'; // Masculino
  if (s === 'M' || s === 'F') return 'F'; // por si hay datos viejos con F
  return 'O';
}

function mapZonaToFrontend(z: string | null): string {
  if (!z) return '';
  const v = z.toUpperCase();
  if (v === 'U') return 'URBANA';
  if (v === 'R') return 'RURAL';
  return '';
}

function mapNivelEscalafonToFrontend(n: string | null): string {
  if (!n) return '';
  if (n === '0') return 'NO_APLICA';
  return n.toUpperCase(); // A, B, C, D
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim();

  if (!q) {
    return NextResponse.json({ ok: true, rows: [] });
  }

  const isNumeric = /^\d+$/.test(q);

  try {
    const usuarios = await prisma.usuario.findMany({
      where: isNumeric
        ? {
            identificacion: q,
          }
        : {
            OR: [
              { primerNombre: { contains: q, mode: 'insensitive' } },
              { segundoNombre: { contains: q, mode: 'insensitive' } },
              { primerApellido: { contains: q, mode: 'insensitive' } },
              { segundoApellido: { contains: q, mode: 'insensitive' } },
              { identificacion: { contains: q, mode: 'insensitive' } },
            ],
          },
      select: {
        id: true,
        identificacion: true,
        tipoIdentificacion: true,
        primerNombre: true,
        segundoNombre: true,
        primerApellido: true,
        segundoApellido: true,

        // 🔹 Campos que te faltaban
        sexo: true,
        edad: true,
        telefono: true,
        celular: true,
        direccion: true,

        estadoCivil: true,
        zonaResidencia: true,
        categoria: true,
        gradoEscalafon: true,
        nivelEscalafon: true,
        formaVinculacion: true,

        fechaNacimiento: true,

        codigoEps: true,
        eps: {
          select: {
            nombreEntidad: true,
          },
        },

        codigoDepartamento: true,
        codigoMunicipio: true,
        departamento: {
          select: { nombre: true },
        },
        municipio: {
          select: { nombre: true },
        },
        barrio: true,
        barrioRef: {
          select: { nombre: true },
        },
        secretariaRef: {
          select: { nombre: true },
        },
        institucionEducativaRef: {
          select: { nombre: true },
        },
      },
      take: 25,
      orderBy: [{ primerApellido: 'asc' }, { primerNombre: 'asc' }],
    });

    const rows = usuarios.map((u) => {
      const telefono = u.celular || u.telefono || null;
      const departamentoNombre = u.departamento?.nombre ?? null;
      const municipioNombre = u.municipio?.nombre ?? null;
      const barrioNombre = u.barrioRef?.nombre ?? u.barrio ?? null;
      const secretariaNombre = u.secretariaRef?.nombre ?? null;
      const institucionNombre = u.institucionEducativaRef?.nombre ?? null;
      const nombreEps = u.eps?.nombreEntidad ?? null;

      return {
        // 🔹 Campos "limpios" para el nuevo formulario
        id: u.id,
        identificacion: u.identificacion,
        tipoIdentificacion: u.tipoIdentificacion,
        primerNombre: u.primerNombre,
        segundoNombre: u.segundoNombre,
        primerApellido: u.primerApellido,
        segundoApellido: u.segundoApellido,

        sexo: mapSexoToFrontend(u.sexo),
        edad: u.edad,
        telefono,
        direccion: u.direccion,

        estadoCivil: u.estadoCivil,
        zonaResidencia: mapZonaToFrontend(u.zonaResidencia),
        categoria: u.categoria,
        gradoEscalafon: u.gradoEscalafon,
        nivelEscalafon: mapNivelEscalafonToFrontend(u.nivelEscalafon),
        formaVinculacion: u.formaVinculacion,

        fechaNacimiento: u.fechaNacimiento,

        // 🔹 Aseguradora / EPS
        codigoEps: u.codigoEps,
        aseguradoraCodigo: u.codigoEps,
        aseguradoraNombre: nombreEps,
        epsNombre: nombreEps,

        // 🔹 Ubicación
        departamento: departamentoNombre,
        municipio: municipioNombre,
        barrio: barrioNombre,

        secretaria: secretariaNombre,
        institucionEducativa: institucionNombre,

        // 🔹 Campos con nombres "viejos" por si algún otro lado los usa
        IdUsuario: u.id,
        Identificaci_n_usuario: u.identificacion,
        Tipo_identificaci_n: u.tipoIdentificacion,
        Primer_nombre: u.primerNombre,
        Segundo_nombre: u.segundoNombre,
        Primer_apellido: u.primerApellido,
        Segundo_apellido: u.segundoApellido,
        Sexo: mapSexoToFrontend(u.sexo),
        Edad: u.edad,
        Celular: u.celular,
        Tel_fono: u.telefono,
        Direcci_n: u.direccion,
        Codigo_eps: u.codigoEps,
      };
    });

    return NextResponse.json({ ok: true, rows });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error consultando usuarios' },
      { status: 500 },
    );
  }
}
