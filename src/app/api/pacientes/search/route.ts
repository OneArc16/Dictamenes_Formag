// app/api/docentes/search/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

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
            // SOLO docentes, documento EXACTO
            tipoUsuario: 'DO',
            identificacion: q,
          }
        : {
            // SOLO docentes, búsqueda por nombre / apellido / doc parcial
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
        fechaNacimiento: true,
        edad: true,
        sexo: true,
        direccion: true,
        telefono: true,
        zonaResidencia: true,
        barrio: true,

        gradoEscalafon: true,
        nivelEscalafon: true,

        // Relaciones
        eps: {
          select: { nombreEntidad: true },
        },
        departamento: {
          select: { nombre: true },
        },
        municipio: {
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

    const rows = usuarios.map((u) => ({
      id: u.id,
      identificacion: u.identificacion,
      tipoIdentificacion: u.tipoIdentificacion,
      primerNombre: u.primerNombre,
      segundoNombre: u.segundoNombre,
      primerApellido: u.primerApellido,
      segundoApellido: u.segundoApellido,
      fechaNacimiento: u.fechaNacimiento,
      edad: u.edad,
      sexo: u.sexo,
      direccion: u.direccion,
      telefono: u.telefono,
      zonaResidencia: u.zonaResidencia,
      barrio: u.barrio,

      // Estos nombres son los que usa el modal
      departamento: u.departamento?.nombre ?? null,
      municipio: u.municipio?.nombre ?? null,
      secretaria: u.secretariaRef?.nombre ?? null,
      institucionEducativa: u.institucionEducativaRef?.nombre ?? null,
      gradoEscalafon: u.gradoEscalafon,
      nivelEscalafon: u.nivelEscalafon,

      // EPS por si la necesitas luego
      eps: u.eps?.nombreEntidad ?? null,
    }));

    return NextResponse.json({ ok: true, rows });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error consultando usuarios' },
      { status: 500 },
    );
  }
}
