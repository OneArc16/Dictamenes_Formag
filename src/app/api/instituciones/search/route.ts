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
 *  - municipio   : código DANE o valor que tengas en idMunicipio (opcional)
 *  - limit       : máximo de resultados (opcional, default 50, máx 100)
 *
 * Ejemplo:
 *  /api/instituciones/search?q=INEM&secretariaId=3817&municipio=47001
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const qRaw = (searchParams.get('q') || '').trim();
    const secretariaIdRaw = (searchParams.get('secretariaId') || '').trim();
    const municipioRaw = (searchParams.get('municipio') || '').trim();
    const limitRaw = searchParams.get('limit');

    // Límite seguro
    let limit = 50;
    if (limitRaw) {
      const n = Number(limitRaw);
      if (!Number.isNaN(n) && n > 0) limit = Math.min(100, n);
    }

    // Si no hay texto o tiene menos de 3 caracteres, devolvemos vacío
    if (!qRaw || qRaw.length < 3) {
      return NextResponse.json({ ok: true, instituciones: [] });
    }

    // =========================
    // Helpers
    // =========================
    const buildNombreFilters = (q: string) => {
      // Divide por espacios y busca cada token (más robusto que contains del string completo)
      const parts = q
        .split(/\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

      // Si solo hay 1 token, usa el q original (mejor UX)
      const tokens = parts.length ? parts : [q];

      // Prisma: mode:'insensitive' funciona en Postgres.
      // Si tu DB no lo soporta, quítalo.
      return tokens.map((t) => ({
        nombre: {
          contains: t,
          mode: 'insensitive',
        },
      }));
    };

    const buildSecretariaFilter = (secRaw: string) => {
      if (!secRaw) return null;
      const secId = Number(secRaw);
      if (Number.isNaN(secId)) return null;
      return { idSecretaria: secId };
    };

    const buildMunicipioFilter = (munRaw: string) => {
      if (!munRaw) return null;

      const candidates = new Set<string>();
      candidates.add(munRaw);

      // si viene numérico tipo 47001 ó 5001 -> agrega versiones
      if (/^\d{4,8}$/.test(munRaw)) {
        // intenta con 5 dígitos (DANE típico)
        if (munRaw.length < 5) candidates.add(munRaw.padStart(5, '0'));
        // intenta sin ceros a la izquierda (por si en DB guardaron 5001 en vez de 05001)
        candidates.add(munRaw.replace(/^0+/, ''));
      }

      const list = [...candidates].filter(Boolean);

      // Match exacto o startsWith (sirve si en DB está 47001000 y tú envías 47001)
      return {
        OR: list.flatMap((v) => [
          { idMunicipio: v },
          { idMunicipio: { startsWith: v } },
        ]),
      };
    };

    const nombreFilters = buildNombreFilters(qRaw);
    const secretariaFilter = buildSecretariaFilter(secretariaIdRaw);
    const municipioFilter = buildMunicipioFilter(municipioRaw);

    // Arma intentos: de más estricto a más laxo
    const attempts: any[] = [];

    // 1) nombre + secretaría + municipio
    attempts.push({
      AND: [...nombreFilters, secretariaFilter, municipioFilter].filter(Boolean),
    });

    // 2) nombre + secretaría
    attempts.push({
      AND: [...nombreFilters, secretariaFilter].filter(Boolean),
    });

    // 3) nombre + municipio
    attempts.push({
      AND: [...nombreFilters, municipioFilter].filter(Boolean),
    });

    // 4) solo nombre
    attempts.push({
      AND: [...nombreFilters].filter(Boolean),
    });

    // Evita intentos duplicados si no mandan filtros
    const uniqAttempts = attempts.filter((w, idx) => {
      const s = JSON.stringify(w);
      return attempts.findIndex((x) => JSON.stringify(x) === s) === idx;
    });

    // =========================
    // Ejecuta intentos hasta obtener resultados
    // =========================
    let institucionesRaw: Array<{
      id: number;
      nombre: string;
      idDepartamento: string | null;
      idMunicipio: string | null;
      idSecretaria: number | null;
    }> = [];

    for (const where of uniqAttempts) {
      institucionesRaw = await prisma.institucionEducativa.findMany({
        where,
        orderBy: { nombre: 'asc' },
        take: limit,
        select: {
          id: true,
          nombre: true,
          idDepartamento: true,
          idMunicipio: true,
          idSecretaria: true,
        },
      });

      if (institucionesRaw.length > 0) break;
    }

    // Deduplicar por nombre normalizado
    const seen = new Set<string>();
    const instituciones: typeof institucionesRaw = [];

    for (const inst of institucionesRaw) {
      const key = inst.nombre.trim().toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      instituciones.push(inst);
    }

    return NextResponse.json({
      ok: true,
      instituciones,
    });
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
