import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { DictamenReactPdf } from '@/lib/react-pdf/DictamenReactPdf';
import { prisma } from '@/lib/prisma';

import fs from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // evita cache

type RouteCtx = { params: { id: string } | Promise<{ id: string }> };

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
  // ✅ tu ruta real
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

  // ✅ fallback: lo trae desde el mismo host (sirviendo /public)
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

export async function GET(req: Request, ctx: RouteCtx) {
  const params = await Promise.resolve(ctx.params);
  const id = Number(params.id);

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
      tipoEvento: true,
      origenEvento: true,

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

          clase: {
            select: {
              nombre: true,
            },
          },

          deficiencia: {
            select: {
              nombre: true,
              capitulo: true,
              tabla: true,
            },
          },
        },
      },

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

  // ✅ PASA logoSrc como PROP (tu DictamenReactPdf lo espera así)
  const dictamenPdf: any = {
    ...dictamen,
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

  // ✅ aquí está la corrección clave: pasar logoSrc al componente
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