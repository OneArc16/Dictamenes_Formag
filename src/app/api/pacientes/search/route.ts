import { NextResponse } from 'next/server';
import { dnaPrisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') ?? '').trim();

  if (!q) {
    return NextResponse.json({ ok: true, rows: [] });
  }

  // Heurística: si es numérico => buscar por documento exacto; si no, por nombres/apellidos
  const isNumeric = /^\d+$/.test(q);

  // Campos que devolveremos (ajusta si quieres más/menos)
  const select = {
    IdUsuario: true,
    Identificaci_n_usuario: true,
    Tipo_identificaci_n: true,
    Primer_nombre: true,
    Segundo_nombre: true,
    Primer_apellido: true,
    Segundo_apellido: true,
    Sexo: true,
    Edad: true,
    Celular: true,
    Tel_fono: true,
    Direcci_n: true,
    Codigo_eps: true,
  } as const;

  try {
    const rows = await dnaPrisma.usuarios.findMany({
      where: isNumeric
        ? {
            Identificaci_n_usuario: q, // documento exacto
          }
        : {
            OR: [
              { Primer_nombre: { contains: q, mode: 'insensitive' } },
              { Segundo_nombre: { contains: q, mode: 'insensitive' } },
              { Primer_apellido: { contains: q, mode: 'insensitive' } },
              { Segundo_apellido: { contains: q, mode: 'insensitive' } },
              { Identificaci_n_usuario: { contains: q, mode: 'insensitive' } },
            ],
          },
      select,
      take: 25,
      orderBy: [{ Primer_apellido: 'asc' }, { Primer_nombre: 'asc' }],
    });

    return NextResponse.json({ ok: true, rows });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Error consultando DNA' },
      { status: 500 }
    );
  }
}
