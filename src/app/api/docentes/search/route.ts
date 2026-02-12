// app/api/docentes/search/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

function mapSexoToFrontend(sexo: string | null): string {
  if (!sexo) return '';
  const s = sexo.toUpperCase();
  if (s === 'H') return 'M';
  if (s === 'M' || s === 'F') return 'F';
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
  return n.toUpperCase();
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
        ? { identificacion: q, tipoUsuario: 'DO' }
        : {
            tipoUsuario: 'DO',
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
        eps: { select: { nombreEntidad: true } },

        departamento: { select: { nombre: true } },
        municipio: { select: { nombre: true } },

        barrio: true,
        barrioRef: { select: { nombre: true } },

        secretariaRef: { select: { nombre: true } },
        institucionEducativaRef: { select: { nombre: true } },

        // ✅ NUEVOS
        escolaridad: true,
        cargoDocenteId: true,
        cargoDocente: { select: { id: true, nombre: true } },

        // ✅ Para fallback si no hay FK
        codigoOcupacion: true,
      },
      take: 25,
      orderBy: [{ primerApellido: 'asc' }, { primerNombre: 'asc' }],
    });

    // ✅ Fallback masivo por codigoOcupacion
    const codigosSinFk = Array.from(
      new Set(
        usuarios
          .filter((u) => !u.cargoDocenteId && u.codigoOcupacion)
          .map((u) => u.codigoOcupacion as string),
      ),
    );

    const cargosByCodigo = codigosSinFk.length
      ? await prisma.cargoDocente.findMany({
          where: { codigo: { in: codigosSinFk } },
          select: { id: true, codigo: true, nombre: true },
        })
      : [];

    const mapCargoCodigo = new Map<string, { id: number; nombre: string }>();
    for (const c of cargosByCodigo) {
      if (c.codigo) mapCargoCodigo.set(c.codigo, { id: c.id, nombre: c.nombre });
    }

    const rows = usuarios.map((u) => {
      const telefono = u.celular || u.telefono || null;
      const nombreEps = u.eps?.nombreEntidad ?? null;

      // cargo por FK
      let cargoId = u.cargoDocenteId ?? null;
      let cargoNombre = u.cargoDocente?.nombre ?? null;

      // fallback por código
      if (!cargoId && u.codigoOcupacion) {
        const found = mapCargoCodigo.get(u.codigoOcupacion);
        if (found) {
          cargoId = found.id;
          cargoNombre = found.nombre;
        }
      }

      return {
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

        codigoEps: u.codigoEps,
        epsNombre: nombreEps,

        departamento: u.departamento?.nombre ?? null,
        municipio: u.municipio?.nombre ?? null,
        barrio: u.barrioRef?.nombre ?? u.barrio ?? null,

        secretaria: u.secretariaRef?.nombre ?? null,
        institucionEducativa: u.institucionEducativaRef?.nombre ?? null,

        // ✅ NUEVOS
        escolaridad: u.escolaridad ?? null,
        cargoDocenteId: cargoId,
        cargoDocenteNombre: cargoNombre,
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