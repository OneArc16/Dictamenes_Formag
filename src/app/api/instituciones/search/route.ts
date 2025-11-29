// app/api/instituciones/search/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

/**
 * GET /api/instituciones/search
 *
 * Query params:
 *  - q           : texto a buscar (mínimo 3 caracteres)
 *  - secretariaId: id numérico de la secretaría (opcional)
 *  - municipio   : código del municipio (opcional)
 *  - limit       : máximo de resultados (opcional, default 50, máx 100)
 *
 * Ejemplos:
 *  /api/instituciones/search?q=INEM&secretariaId=3817&municipio=47001
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get('q') || '').trim();
    const secretariaIdRaw = (searchParams.get('secretariaId') || '').trim();
    const municipio = (searchParams.get('municipio') || '').trim();
    const limitRaw = searchParams.get('limit');

    // Límite seguro
    let limit = 50;
    if (limitRaw) {
      const n = Number(limitRaw);
      if (!Number.isNaN(n) && n > 0) {
        limit = Math.min(100, n);
      }
    }

    // Si no hay texto o tiene menos de 3 caracteres, devolvemos vacío
    if (!q || q.length < 3) {
      return NextResponse.json({ ok: true, instituciones: [] });
    }

    const where: any = {};

    // Filtrar por secretaría si viene
    if (secretariaIdRaw) {
      const secId = Number(secretariaIdRaw);
      if (!Number.isNaN(secId)) {
        // Ajusta el nombre del campo si en tu modelo es distinto
        where.idSecretaria = secId;
      }
    }

    // Filtrar por municipio si viene
    if (municipio) {
      // Ajusta el nombre del campo si en tu modelo es distinto
      where.idMunicipio = municipio;
    }

    // Búsqueda por nombre (case-insensitive)
    where.nombre = {
      contains: q,
      mode: 'insensitive',
    };

    const institucionesRaw = await prisma.institucionEducativa.findMany({
      where,
      orderBy: { nombre: 'asc' },
      take: limit,
      select: {
        id: true,
        nombre: true,
        // estos campos los venías usando en el frontend:
        idDepartamento: true,
        idMunicipio: true,
        idSecretaria: true,
      },
    });

    // 🔹 Deduplicar por nombre normalizado (quita repetidos)
    const seen = new Set<string>();
    const instituciones: typeof institucionesRaw = [];

    for (const inst of institucionesRaw) {
      const key = inst.nombre.trim().toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      instituciones.push(inst);
    }

    return NextResponse.json({ ok: true, instituciones });
  } catch (err: any) {
    console.error('ERROR GET /api/instituciones/search:', err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? 'Error buscando instituciones',
      },
      { status: 500 },
    );
  }
}
