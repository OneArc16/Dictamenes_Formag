import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const documento = (searchParams.get('documento') ?? '').trim();
    const tipoDocumento = (searchParams.get('tipoDocumento') ?? '').trim();

    if (!documento) {
      return NextResponse.json(
        { ok: false, error: 'El número de documento es obligatorio' },
        { status: 400 }
      );
    }

    const where: any = {
      identificacion: documento,
      tipoUsuario: 'DO', // solo docentes
    };

    if (tipoDocumento) {
      where.tipoIdentificacion = tipoDocumento;
    }

    const usuario = await prisma.usuario.findFirst({
      where,
      include: {
        departamento: true,
        municipio: true,
        barrioRef: true,
        paisResidencia: true,
      },
    });

    // Si no existe, devolvemos ok=true pero docente=null
    if (!usuario) {
      return NextResponse.json({ ok: true, docente: null });
    }

    const docente = {
      tipoDocumento: usuario.tipoIdentificacion ?? '',
      numeroDocumento: usuario.identificacion ?? '',
      fechaNacimiento: usuario.fechaNacimiento
        ? usuario.fechaNacimiento.toISOString().slice(0, 10)
        : '',
      primerNombre: usuario.primerNombre ?? '',
      segundoNombre: usuario.segundoNombre ?? '',
      primerApellido: usuario.primerApellido ?? '',
      segundoApellido: usuario.segundoApellido ?? '',
      sexo: usuario.sexo ?? '',
      direccion: usuario.direccion ?? '',
      barrio: usuario.barrioRef?.nombre ?? usuario.barrio ?? '',
      departamento: usuario.departamento?.nombre ?? '',
      municipio: usuario.municipio?.nombre ?? '',
      zona:
        usuario.zonaResidencia === 'U'
          ? 'URBANA'
          : usuario.zonaResidencia === 'R'
          ? 'RURAL'
          : '',
      telefono:
        usuario.celular ||
        usuario.telefono ||
        usuario.telefonoSecundario ||
        '',
      pais: usuario.paisResidencia?.nombre ?? '',
      secretariaLabora: usuario.secretaria ?? '',
      gradoEscalafon: usuario.gradoEscalafon ?? '',
      nivelEscalafon: usuario.nivelEscalafon ?? '',
      institucionLabora: usuario.institucionEducativa ?? '',
    };

    return NextResponse.json({ ok: true, docente });
  } catch (error) {
    console.error('Error en /api/docentes/buscar', error);
    return NextResponse.json(
      { ok: false, error: 'Error interno buscando docente' },
      { status: 500 }
    );
  }
}
