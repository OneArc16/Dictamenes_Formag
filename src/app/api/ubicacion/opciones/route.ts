// app/api/ubicacion/opciones/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      paises,
      departamentos,
      municipios,
      barrios,
      secretariasRows,
      institucionesRows,
      epsRows,
    ] = await Promise.all([
      prisma.pais.findMany({
        orderBy: { nombre: 'asc' },
      }),
      prisma.departamento.findMany({
        orderBy: { nombre: 'asc' },
      }),
      prisma.municipio.findMany({
        orderBy: { nombre: 'asc' },
      }),
      prisma.barrio.findMany({
        orderBy: { nombre: 'asc' },
      }),
      prisma.secretaria.findMany({
        orderBy: { nombre: 'asc' },
      }),
      prisma.institucionEducativa.findMany({
        orderBy: { nombre: 'asc' },
      }),
      prisma.eps.findMany({
        orderBy: { nombreEntidad: 'asc' },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      paises: paises.map((p) => ({
        codigo: p.codigo,
        nombre: p.nombre,
      })),
      departamentos: departamentos.map((d) => ({
        codigo: d.codigo,
        nombre: d.nombre,
      })),
      municipios: municipios.map((m) => ({
        codigo: m.codigo,
        nombre: m.nombre,
        codigoDepartamento: m.codigoDepartamento,
      })),
      barrios: barrios.map((b) => ({
        id: b.id,
        nombre: b.nombre,
        codigoMunicipio: b.codigoMunicipio,
      })),
      // 🔹 Secretarías
      secretarias: secretariasRows.map((s) => ({
        id: s.id,
        nombre: s.nombre,
      })),
      // 🔹 Instituciones (por si las usas en otros lados)
      instituciones: institucionesRows.map((i) => ({
        id: i.id,
        nombre: i.nombre,
        idDepartamento: i.idDepartamento,
        idMunicipio: i.idMunicipio,
        idSecretaria: i.idSecretaria,
        codigoIed: i.codigoIed,
        direccion: i.direccion,
      })),
      // 🔹 EPS para el combo de aseguradora
      eps: epsRows.map((e) => ({
        codigo: e.codigo,
        nombre: e.nombreEntidad,
      })),
    });
  } catch (error) {
    console.error('Error cargando opciones de ubicación', error);
    return NextResponse.json(
      { ok: false, error: 'Error cargando opciones de ubicación' },
      { status: 500 },
    );
  }
}
