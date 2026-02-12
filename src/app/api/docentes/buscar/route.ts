// app/api/docentes/buscar/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const documento = (searchParams.get('documento') ?? '').trim();
    const tipoDocumento = (searchParams.get('tipoDocumento') ?? '').trim();

    if (!documento) {
      return NextResponse.json(
        { ok: false, error: 'El número de documento es obligatorio' },
        { status: 400 },
      );
    }

    const where: any = {
      identificacion: documento,
      tipoUsuario: 'DO',
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
        secretariaRef: true,
        institucionEducativaRef: true,
        cargoDocente: true, // FK (si existe)
      },
    });

    if (!usuario) {
      return NextResponse.json({ ok: true, docente: null });
    }

    // ✅ Fallback: si no hay FK, intentar resolver por codigoOcupacion -> CargoDocente.codigo
    let cargoId = usuario.cargoDocenteId ?? null;
    let cargoNombre = usuario.cargoDocente?.nombre ?? '';

    if (!cargoId && usuario.codigoOcupacion) {
      const cargoByCodigo = await prisma.cargoDocente.findFirst({
        where: { codigo: usuario.codigoOcupacion },
        select: { id: true, nombre: true },
      });

      if (cargoByCodigo) {
        cargoId = cargoByCodigo.id;
        cargoNombre = cargoByCodigo.nombre ?? '';
      }
    }

    const docente = {
      tipoDocumento: usuario.tipoIdentificacion ?? '',
      numeroDocumento: usuario.identificacion ?? '',
      fechaNacimiento: usuario.fechaNacimiento
        ? usuario.fechaNacimiento.toISOString().slice(0, 10)
        : '',
      edad: usuario.edad != null ? String(usuario.edad) : '',

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

      codigoEps: usuario.codigoEps ?? '',
      categoria: usuario.categoria ?? '',

      secretariaLabora: usuario.secretariaRef?.nombre ?? '',
      gradoEscalafon: usuario.gradoEscalafon ?? '',
      nivelEscalafon: usuario.nivelEscalafon ?? '',
      institucionLabora: usuario.institucionEducativaRef?.nombre ?? '',

      // ✅ NUEVOS
      escolaridad: usuario.escolaridad ?? '',
      cargoDocenteId: cargoId,
      cargoDocenteNombre: cargoNombre,
    };

    return NextResponse.json({ ok: true, docente });
  } catch (error) {
    console.error('Error en /api/docentes/buscar', error);
    return NextResponse.json(
      { ok: false, error: 'Error interno buscando docente' },
      { status: 500 },
    );
  }
}