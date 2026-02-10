import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { DictamenReactPdf } from '@/lib/react-pdf/DictamenReactPdf';
import { prisma } from '@/lib/prisma';

import fs from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteCtx = { params: Promise<{ id: string }> };

async function streamToBuffer(stream: any) {
  const chunks: any[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function mimeFromExt(p: string) {
  const ext = path.extname(p).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

async function getLogoDataUrl(req: Request) {
  const candidates = [
    path.join(process.cwd(), 'public', 'assets', 'logo-sism.png'),
    path.join(process.cwd(), 'public', 'assets', 'logo-sism.PNG'),
  ];

  for (const p of candidates) {
    try {
      const bytes = await fs.readFile(p);
      const mime = mimeFromExt(p);
      return `data:${mime};base64,${bytes.toString('base64')}`;
    } catch {
      // sigue intentando
    }
  }

  const url = new URL('/assets/logo-sism.png', req.url);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;

  const ab = await res.arrayBuffer();
  const buf = Buffer.from(ab);
  const mime = res.headers.get('content-type') || 'image/png';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

// ✅ según tu BD: M = Femenino, H = Masculino
function normalizeGenero(sexo: any, generoRaw: any) {
  const s1 = String(sexo ?? '').trim().toUpperCase();
  const s2 = String(generoRaw ?? '').trim().toUpperCase();

  const map = (v: string) => {
    if (!v) return null;
    if (v === 'M') return 'FEMENINO';
    if (v === 'H') return 'MASCULINO';
    if (v === 'F') return 'FEMENINO';
    return null;
  };

  return map(s1) ?? map(s2) ?? (s2 ? s2 : null) ?? (s1 ? s1 : null);
}

function toText(v: any): string | null {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object') {
    const pick =
      v.nombre ?? v.name ?? v.label ?? v.descripcion ?? v.descripcionFactor ?? v.descripcionCriterio ?? v.titulo ?? v.valor ?? null;
    return pick != null ? String(pick) : String(v);
  }
  return String(v);
}

function normalizeGravedad(v: any): '0' | 'I' | 'II' | 'III' | 'IV' | null {
  const raw = toText(v);
  if (!raw) return null;

  const s0 = raw
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // números 0..4
  if (s0 === '0') return '0';
  if (s0 === '1') return 'I';
  if (s0 === '2') return 'II';
  if (s0 === '3') return 'III';
  if (s0 === '4') return 'IV';

  // formas comunes: CLASE_I, CLASE II, CLASE-III, etc.
  const s = s0.replace(/[_\-]+/g, ' ');
  if (s.includes('CLASE')) {
    const t = s.replace(/\bCLASE\b/g, '').trim();
    if (t === '0' || t === 'CERO') return '0';
    if (t === 'I') return 'I';
    if (t === 'II') return 'II';
    if (t === 'III') return 'III';
    if (t === 'IV') return 'IV';
  }

  // romanos directos
  if (s === 'I') return 'I';
  if (s === 'II') return 'II';
  if (s === 'III') return 'III';
  if (s === 'IV') return 'IV';
  if (s === 'CERO') return '0';

  // descriptores (por si guardaste texto)
  if (s.includes('INEXISTENTE') || s.includes('NINGUNA')) return '0';
  if (s.includes('LEVE') || s.includes('LIGERA') || s.includes('NO HAY DIFICULTAD')) return 'I';
  if (s.includes('MODERADA')) return 'II';
  if (s.includes('SEVERA')) return 'III';
  if (s.includes('COMPLETA') || s.includes('TOTAL')) return 'IV';

  return null;
}

/**
 * ✅ Truco clave para que NO queden X incompletas:
 * - Por cada fila del análisis, creamos variantes:
 *   1) factor
 *   2) "criterio factor"
 *   3) "factor criterio"
 * Así coincide con tus keys del PDF aunque en BD venga separado.
 */
function expandAnalisisOcupacional(arr: any[]) {
  const out: any[] = [];

  for (const it of arr) {
    const criterio =
      toText(it?.criterio ?? it?.criterioNombre ?? it?.grupo ?? it?.categoria ?? it?.seccion ?? it?.valorCriterio ?? it?.valor ?? null) ?? null;

    const factor =
      toText(it?.factor ?? it?.factorNombre ?? it?.nombreFactor ?? it?.descripcionFactor ?? it?.name ?? it?.label ?? null) ?? null;

    const g =
      normalizeGravedad(it?.gravedad ?? it?.grado ?? it?.clase ?? it?.nivel ?? it?.valorGravedad ?? it?.valor ?? null);

    if (!g || (!factor && !criterio)) continue;

    // base (lo mínimo que tu bloque entiende)
    const base: any = {};
    if (factor) base.factor = factor;
    if (criterio) base.criterio = criterio;
    base.gravedad = g;

    out.push(base);

    // variantes (para matchear todas tus combinaciones de keys)
    if (factor && criterio) {
      out.push({ factor: `${criterio} ${factor}`, gravedad: g });
      out.push({ factor: `${factor} ${criterio}`, gravedad: g });
    }
  }

  return out;
}

export async function GET(req: Request, ctx: RouteCtx) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);

  if (!Number.isFinite(id)) {
    return new Response(JSON.stringify({ error: 'ID inválido' }), { status: 400 });
  }

  const dictamen = await prisma.dictamen.findUnique({
    where: { id },
    select: {
      id: true,
      numeroDictamen: true,
      fechaDictamen: true,
      procedimientoPcl: true,
      totalTitulo1: true,
      tipoEvento: true,
      origenEvento: true,
      totalCap1: true,
      claseLimitacionLaboral: true,
      totalCap2: true,
      totalTitulo3: true,

      antecedentesClinicos: true,
      condicionSalud: true,
      descripcionHallazgos: true,

      diagnosticos: {
        orderBy: { id: 'asc' },
        select: {
          id: true,
          cie10Codigo: true,
          tipo: true,
          cie10: { select: { codigo: true, nombre: true } },
        },
      },

      deficiencias: {
        orderBy: [{ deficienciaId: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          valorDeficiencia: true,
          clase: { select: { nombre: true } },
          deficiencia: { select: { nombre: true, capitulo: true, tabla: true } },
        },
      },

      limitacionesAvdAivd: {
        orderBy: [{ actividad: 'asc' }],
        select: { actividad: true, valor: true },
      },

      // ✅ IMPORTANTE: traer TODO (para no perder campos como criterio, etc.)
      analisisOcupacional: true,

      usuario: {
        select: {
          identificacion: true,
          tipoIdentificacion: true,

          primerNombre: true,
          segundoNombre: true,
          primerApellido: true,
          segundoApellido: true,

          direccion: true,
          telefono: true,

          sexo: true,
          genero: true,

          escolaridad: true,
          estadoCivil: true,

          fechaNacimiento: true,
          edad: true,

          zonaResidencia: true,

          codigoOcupacion: true,

          gradoEscalafon: true,
          formaVinculacion: true,

          sector: true,

          municipio: { select: { nombre: true } },
          departamento: { select: { nombre: true } },

          secretariaRef: { select: { nombre: true } },

          institucionEducativaRef: {
            select: {
              nombre: true,
              direccion: true,
              municipio: { select: { nombre: true } },
              departamento: { select: { nombre: true } },
              secretaria: { select: { nombre: true } },
            },
          },
        },
      },
    },
  });

  if (!dictamen) {
    return new Response(JSON.stringify({ error: 'Dictamen no encontrado' }), { status: 404 });
  }

  const logoSrc = await getLogoDataUrl(req).catch(() => null);

  const u = dictamen.usuario as any;
  const generoFix = u ? normalizeGenero(u.sexo, u.genero) : null;

  const cap2Clase =
    (dictamen as any).tituloIICapitulo2Clase ??
    (dictamen as any).limitacionPerfilLaboralClase ??
    null;

  const cap2Total =
    (dictamen as any).valorTotalTituloIICap2 ??
    (dictamen as any).totalTituloIICap2 ??
    (dictamen as any).totalTitulo2Cap2 ??
    null;

  const analisisRaw = Array.isArray((dictamen as any).analisisOcupacional) ? (dictamen as any).analisisOcupacional : [];
  const analisisFix = expandAnalisisOcupacional(analisisRaw);

  const dictamenPdf: any = {
    ...dictamen,

    // ✅ aquí es donde “se arreglan” las X
    analisisOcupacional: analisisFix,

    tituloII: {
      capitulo2: {
        clase: cap2Clase,
        valorTotal: cap2Total,
      },
    },

    usuario: u
      ? {
          ...u,
          genero: generoFix,

          // aliases que tus bloques esperan
          numeroDocumento: u.identificacion,
          documento: u.identificacion,
          cargo: u.codigoOcupacion ?? null,

          // alias legacy: institucionEducativaRef.secretariaRef
          institucionEducativaRef: u.institucionEducativaRef
            ? {
                ...u.institucionEducativaRef,
                secretariaRef: u.institucionEducativaRef.secretaria ?? null,
              }
            : null,
        }
      : null,
  };

  const element = React.createElement(DictamenReactPdf, { dictamen: dictamenPdf, logoSrc });
  const stream = await renderToStream(element);
  const buffer = await streamToBuffer(stream);

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="dictamen-${id}-reactpdf.pdf"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}