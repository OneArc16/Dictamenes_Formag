// app/api/instituciones/by-secretaria/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // esperamos ?secretariaId=123
    const secretariaIdRaw = searchParams.get('secretariaId');

    if (!secretariaIdRaw) {
      return NextResponse.json({
        ok: true,
        instituciones: [],
      });
    }

    const secretariaId = Number(secretariaIdRaw);
    if (Number.isNaN(secretariaId)) {
      return NextResponse.json(
        { ok: false, error: 'secretariaId inválido' },
        { status: 400 },
      );
    }

    const instituciones = await prisma.institucionEducativa.findMany({
      where: {
        idSecretaria: secretariaId,
      },
      orderBy: { nombre: 'asc' },
    });

    const rows = instituciones.map((i) => ({
      id: i.id,
      nombre: i.nombre,
      idDepartamento: i.idDepartamento,
      idMunicipio: i.idMunicipio,
      idSecretaria: i.idSecretaria,
      codigoIed: i.codigoIed,
      direccion: i.direccion,
    }));

    return NextResponse.json({ ok: true, instituciones: rows });
  } catch (err: any) {
    console.error('Error cargando instituciones por secretaría', err);
    return NextResponse.json(
      {
        ok: false,
        error:
          err?.message ?? 'Error cargando instituciones por secretaría',
      },
      { status: 500 },
    );
  }
}
