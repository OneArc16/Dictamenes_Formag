// app/api/docentes/search/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').trim();

    if (!q) {
      return NextResponse.json({ ok: true, rows: [] });
    }

    const isNumeric = /^\d+$/.test(q);

    const where: any = {
      tipoUsuario: 'DO', // solo docentes
    };

    if (isNumeric) {
      where.identificacion = { contains: q, mode: 'insensitive' };
    } else {
      where.OR = [
        { primerNombre: { contains: q, mode: 'insensitive' } },
        { segundoNombre: { contains: q, mode: 'insensitive' } },
        { primerApellido: { contains: q, mode: 'insensitive' } },
        { segundoApellido: { contains: q, mode: 'insensitive' } },
      ];
    }

    const usuarios = await prisma.usuario.findMany({
      where,
      select: {
        id: true,
        carnet: true,
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

        // Relaciones tal como están en el schema
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

        gradoEscalafon: true,
        nivelEscalafon: true,
        eps: {
          select: { nombreEntidad: true },
        },
      },
      take: 10,
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
      nombre: `${u.primerNombre} ${u.segundoNombre ?? ''} ${u.primerApellido} ${
        u.segundoApellido ?? ''
      }`
        .replace(/\s+/g, ' ')
        .trim(),
      edad: u.edad,
      sexo: u.sexo,
      direccion: u.direccion,
      telefono: u.telefono,
      zonaResidencia: u.zonaResidencia,
      barrio: u.barrio,
      departamento: u.departamento?.nombre ?? null,
      municipio: u.municipio?.nombre ?? null,
      secretaria: u.secretariaRef?.nombre ?? null,
      institucionEducativa: u.institucionEducativaRef?.nombre ?? null,
      gradoEscalafon: u.gradoEscalafon,
      nivelEscalafon: u.nivelEscalafon,
      eps: u.eps?.nombreEntidad ?? null,
    }));

    return NextResponse.json({ ok: true, rows });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error buscando docente' },
      { status: 500 }
    );
  }
}