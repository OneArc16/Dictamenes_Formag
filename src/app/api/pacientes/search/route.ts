import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim();

  if (!q) {
    return NextResponse.json({ ok: true, rows: [] });
  }

  // Heurística: si es numérico => buscar por documento exacto; si no, por nombres/apellidos
  const isNumeric = /^\d+$/.test(q);

  try {
    const usuarios = await prisma.usuario.findMany({
      where: isNumeric
        ? {
            // documento exacto
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
        sexo: true,
        edad: true,
        celular: true,
        telefono: true,
        direccion: true,
        codigoEps: true,
      },
      take: 25,
      orderBy: [{ primerApellido: 'asc' }, { primerNombre: 'asc' }],
    });

    // 🔁 Mapeo para mantener la misma forma de respuesta que tenías en DNA
    const rows = usuarios.map((u) => ({
      IdUsuario: u.id,
      Identificaci_n_usuario: u.identificacion,
      Tipo_identificaci_n: u.tipoIdentificacion,
      Primer_nombre: u.primerNombre,
      Segundo_nombre: u.segundoNombre,
      Primer_apellido: u.primerApellido,
      Segundo_apellido: u.segundoApellido,
      Sexo: u.sexo,
      Edad: u.edad,
      Celular: u.celular,
      Tel_fono: u.telefono,
      Direcci_n: u.direccion,
      Codigo_eps: u.codigoEps,
    }));

    return NextResponse.json({ ok: true, rows });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error consultando usuarios' },
      { status: 500 }
    );
  }
}
