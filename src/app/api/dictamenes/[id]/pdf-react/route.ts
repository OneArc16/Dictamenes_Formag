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

function guessMimeFromBytes(bytes: Buffer): string | null {
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';
  return null;
}

function bytesToDataUrl(bytes: any, mime?: string | null): string | null {
  if (!bytes) return null;
  const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
  const m = mime || guessMimeFromBytes(buf) || 'image/png';
  return `data:${m};base64,${buf.toString('base64')}`;
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

// âœ… segÃºn tu BD: M = Femenino, H = Masculino
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
      v.nombre ??
      v.name ??
      v.label ??
      v.descripcion ??
      v.descripcionFactor ??
      v.descripcionCriterio ??
      v.titulo ??
      v.valor ??
      null;
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

  // nÃºmeros 0..4
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

  // descriptores
  if (s.includes('INEXISTENTE') || s.includes('NINGUNA')) return '0';
  if (s.includes('LEVE') || s.includes('LIGERA') || s.includes('NO HAY DIFICULTAD')) return 'I';
  if (s.includes('MODERADA')) return 'II';
  if (s.includes('SEVERA')) return 'III';
  if (s.includes('COMPLETA') || s.includes('TOTAL')) return 'IV';

  return null;
}

/**
 * âœ… Truco clave para que NO queden X incompletas:
 * - Por cada fila del anÃ¡lisis, creamos variantes:
 *   1) factor
 *   2) "criterio factor"
 *   3) "factor criterio"
 */
function expandAnalisisOcupacional(arr: any[]) {
  const out: any[] = [];

  for (const it of arr) {
    const criterio =
      toText(
        it?.criterio ??
          it?.criterioNombre ??
          it?.grupo ??
          it?.categoria ??
          it?.seccion ??
          it?.valorCriterio ??
          it?.valor ??
          null,
      ) ?? null;

    const factor =
      toText(
        it?.factor ??
          it?.factorNombre ??
          it?.nombreFactor ??
          it?.descripcionFactor ??
          it?.name ??
          it?.label ??
          null,
      ) ?? null;

    const g = normalizeGravedad(
      it?.gravedad ??
        it?.grado ??
        it?.clase ??
        it?.nivel ??
        it?.valorGravedad ??
        it?.valor ??
        null,
    );

    if (!g || (!factor && !criterio)) continue;

    const base: any = {};
    if (factor) base.factor = factor;
    if (criterio) base.criterio = criterio;
    base.gravedad = g;

    out.push(base);

    if (factor && criterio) {
      out.push({ factor: `${criterio} ${factor}`, gravedad: g });
      out.push({ factor: `${factor} ${criterio}`, gravedad: g });
    }
  }

  return out;
}

function fullName(e: any): string {
  const parts = [e?.primerNombre, e?.segundoNombre, e?.primerApellido, e?.segundoApellido].filter(Boolean);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function normalizeSpecialtyName(value: any) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getOrderedSpecialties(empleado: any) {
  const items = Array.isArray(empleado?.especialidades) ? empleado.especialidades : [];
  return [...items].sort((a, b) => Number(Boolean(b?.principal)) - Number(Boolean(a?.principal)));
}

function getPreferredSpecialty(empleado: any): string | null {
  const ordered = getOrderedSpecialties(empleado);
  const medicinaLaboral = ordered
    .map((item) => item?.especialidad?.nombre)
    .find((value) => normalizeSpecialtyName(value).includes('MEDICINA LABORAL'));

  if (medicinaLaboral) return String(medicinaLaboral).trim();

  const first = ordered
    .map((item) => item?.especialidad?.nombre)
    .find((value) => String(value ?? '').trim().length > 0);

  return first ? String(first).trim() : null;
}
export async function GET(req: Request, ctx: RouteCtx) {
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);

  if (!Number.isFinite(id)) {
    return new Response(JSON.stringify({ error: 'ID invÃ¡lido' }), { status: 400 });
  }

  const dictamen = await prisma.dictamen.findUnique({
    where: { id },
    select: {
      id: true,
      numeroDictamen: true,
      fechaDictamen: true,
      procedimientoPcl: true,

      totalTitulo1: true,
      totalCap1: true,
      claseLimitacionLaboral: true,
      totalCap2: true,
      totalTitulo3: true,

      // SustentaciÃ³n / origen
      sustentacionObservaciones: true,
      fechaEstructuracionInvalidez: true,
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
          clase: { select: { nombre: true } },
          deficiencia: { select: { nombre: true, capitulo: true, tabla: true } },
        },
      },

      limitacionesAvdAivd: {
        orderBy: [{ actividad: 'asc' }],
        select: { actividad: true, valor: true },
      },

      analisisOcupacional: true,

      // âœ… firmas â€œcongeladasâ€ del cierre (dictamen_junta)
      junta: {
        orderBy: { orden: 'asc' },
        select: {
          orden: true,
          nombreCompleto: true,
          registroMedico: true,
          licencia: true,
          firma: true,
          firmaMime: true,
          empleadoId: true,
          empleado: {
            select: {
              tratamiento: true,
              especialidades: {
                select: {
                  principal: true,
                  especialidad: {
                    select: {
                      nombre: true,
                    },
                  },
                },
              },
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

          // âœ… ESCOLARIDAD (ya la estabas trayendo)
          escolaridad: true,

          estadoCivil: true,

          fechaNacimiento: true,
          edad: true,

          zonaResidencia: true,

          codigoOcupacion: true,

          // âœ… CARGO DOCENTE (relaciÃ³n)
          cargoDocenteId: true,
          cargoDocente: { select: { id: true, codigo: true, nombre: true } },
          nivelEscalafon: true,
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

  // âœ… 1) Si ya existe snapshot en dictamen_junta -> eso manda (PDF â€œcongeladoâ€)
  // âœ… 2) Si NO existe -> fallback a mÃ©dicos activos de junta (para dictamen en ediciÃ³n)
  let juntaPdf: any[] =
    (dictamen as any).junta?.map((j: any) => ({
      orden: j.orden,
      empleadoId: j.empleadoId ?? null,
      nombreCompleto: j.nombreCompleto,
      especialidad: getPreferredSpecialty(j?.empleado),
      registroMedico: j.registroMedico ?? null,
      licencia: j.licencia ?? null,
      firmaSrc: bytesToDataUrl(j.firma, j.firmaMime),
      tratamiento: j?.empleado?.tratamiento ?? 'DR',
    })) ?? [];

  if (juntaPdf.length === 0) {
    const activosJunta = await prisma.empleado.findMany({
      where: { activo: true, esMiembroJunta: true },
      orderBy: [{ primerApellido: 'asc' }, { primerNombre: 'asc' }],
      select: {
        id: true,
        primerNombre: true,
        segundoNombre: true,
        primerApellido: true,
        segundoApellido: true,
        registroMedico: true,
        licencia: true,
        firma: true,
        tratamiento: true,
        especialidades: {
          select: {
            principal: true,
            especialidad: {
              select: {
                nombre: true,
              },
            },
          },
        },
      },
    });

    juntaPdf = activosJunta.map((e: any, idx: number) => ({
      orden: idx + 1,
      empleadoId: e.id,
      nombreCompleto: fullName(e),
      especialidad: getPreferredSpecialty(e),
      registroMedico: e.registroMedico ?? null,
      licencia: e.licencia ?? null,
      firmaSrc: bytesToDataUrl(e.firma, null),
      tratamiento: e.tratamiento ?? 'DR',
    }));
  }

  // âœ… Normalizaciones para CARGO + ESCOLARIDAD
  const cargoDoc = u?.cargoDocente ?? null;
  const cargoDocenteNombre = cargoDoc?.nombre ? String(cargoDoc.nombre) : null;
  const cargoDocenteCodigo = cargoDoc?.codigo != null ? String(cargoDoc.codigo) : null;
  const cargoDocenteId = cargoDoc?.id ?? u?.cargoDocenteId ?? null;

  // fallback por si hay usuarios viejos con codigoOcupacion
  const cargoFallback = cargoDocenteNombre ?? (u?.codigoOcupacion ? String(u.codigoOcupacion) : null);

  const escolaridadFix = toText(u?.escolaridad);

  const dictamenPdf: any = {
    ...dictamen,
    analisisOcupacional: analisisFix,

    tituloII: {
      capitulo2: {
        clase: cap2Clase,
        valorTotal: cap2Total,
      },
    },

    // âœ… lo pasamos con 2 nombres por si en el bloque lo llamas distinto
    junta: juntaPdf,
    juntaMedica: juntaPdf,

    usuario: u
      ? {
          ...u,
          genero: generoFix,

          // aliases que tus bloques esperan
          numeroDocumento: u.identificacion,
          documento: u.identificacion,

          // âœ… CAMPOS â€œLISTOS PARA IMPRIMIRâ€ EN EL PDF
          escolaridad: escolaridadFix,
          cargo: cargoFallback,

          // âœ… aliases extra (por si tu componente los usa)
          cargoDocenteId,
          cargoDocenteNombre,
          cargoDocenteCodigo,

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



