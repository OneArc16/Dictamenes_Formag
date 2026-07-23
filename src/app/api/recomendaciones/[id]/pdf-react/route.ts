import React from 'react';
import fs from 'node:fs/promises';
import path from 'node:path';

import { renderToStream } from '@react-pdf/renderer';

import { prisma } from '@/lib/prisma';
import { RecomendacionLaboralReactPdf } from '@/lib/react-pdf/RecomendacionLaboralReactPdf';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteCtx = { params: Promise<{ id: string }> };
type PdfStream = AsyncIterable<Uint8Array | Buffer | string>;
type BinaryInput = Buffer | Uint8Array | ArrayBuffer | null | undefined;
type EspecialidadItem = {
  principal: boolean | null;
  especialidad: {
    nombre: string | null;
  } | null;
};
type EmpleadoLike = {
  esMiembroJunta?: boolean | null;
  especialidades?: EspecialidadItem[] | null;
};

type FirmaPdf = {
  nombre: string;
  especialidad: string | null;
  registroMedico: string | null;
  licencia: string | null;
  firmaSrc: string | null;
};

type FirmaSource = FirmaPdf & {
  empleadoId: number;
};

const DEFAULT_EXAMENES_REALIZADOS =
  'CONSULTA POR ESPECIALISTA EN MEDICINA DEL TRABAJO O SEGURIDAD Y SALUD EN EL TRABAJO';
const DEFAULT_MOTIVO = 'CONCEPTO MEDICO PARA RECOMENDACIONES LABORALES';

async function streamToBuffer(stream: PdfStream) {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function mimeFromExt(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.svg') return 'image/svg+xml';
  return 'application/octet-stream';
}

function guessMimeFromBytes(bytes: Buffer): string | null {
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return 'image/png';
  }

  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    return 'image/jpeg';
  }

  return null;
}

function bytesToDataUrl(bytes: BinaryInput, mime?: string | null): string | null {
  if (!bytes) return null;

  const buffer =
    bytes instanceof ArrayBuffer ? Buffer.from(bytes) : Buffer.from(bytes);

  const resolvedMime = mime || guessMimeFromBytes(buffer) || 'image/png';
  return `data:${resolvedMime};base64,${buffer.toString('base64')}`;
}

async function getLogoDataUrl(req: Request) {
  const candidates = [
    path.join(process.cwd(), 'public', 'assets', 'logo-sism.png'),
    path.join(process.cwd(), 'public', 'assets', 'logo-sism.PNG'),
  ];

  for (const candidate of candidates) {
    try {
      const bytes = await fs.readFile(candidate);
      return `data:${mimeFromExt(candidate)};base64,${bytes.toString('base64')}`;
    } catch {
      // sigue intentando
    }
  }

  const url = new URL('/assets/logo-sism.png', req.url);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;

  const buffer = Buffer.from(await res.arrayBuffer());
  const mime = res.headers.get('content-type') || 'image/png';
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

function formatDateDMY(value?: Date | string | null) {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';

  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = String(date.getUTCFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function formatDecimal(value: unknown, suffix?: string) {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text) return null;
  return suffix ? `${text} ${suffix}` : text;
}

function fullName(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function normalizeGenero(sexo: unknown, genero: unknown) {
  const one = String(sexo ?? '').trim().toUpperCase();
  const two = String(genero ?? '').trim().toUpperCase();

  const map = (value: string) => {
    if (!value) return null;
    if (value === 'M' || value === 'F') return 'FEMENINO';
    if (value === 'H') return 'MASCULINO';
    return null;
  };

  return map(one) ?? map(two) ?? (two || one || null);
}

function normalizeText(value: string | null | undefined, fallback?: string) {
  const normalized = String(value ?? '').trim();
  if (normalized.length > 0) return normalized;
  return fallback ?? '';
}

function normalizeSpecialtyName(value: string | null | undefined) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getOrderedSpecialties(empleado: EmpleadoLike | null | undefined) {
  const items = Array.isArray(empleado?.especialidades) ? empleado.especialidades : [];
  return [...items].sort(
    (a, b) => Number(Boolean(b?.principal)) - Number(Boolean(a?.principal)),
  );
}

function getMedicinaLaboralSpecialty(empleado: EmpleadoLike | null | undefined): string | null {
  const ordered = getOrderedSpecialties(empleado);
  const matched = ordered
    .map((item) => item?.especialidad?.nombre)
    .find((value) => normalizeSpecialtyName(value).includes('MEDICINA LABORAL'));

  return matched ?? null;
}

function isEligibleBoardDoctor(empleado: EmpleadoLike | null | undefined) {
  return Boolean(empleado?.esMiembroJunta) && Boolean(getMedicinaLaboralSpecialty(empleado));
}

export async function GET(req: Request, ctx: RouteCtx) {
  const { id: idParam } = await ctx.params;
  const recomendacionId = Number(idParam);

  if (!Number.isFinite(recomendacionId) || recomendacionId <= 0) {
    return new Response(JSON.stringify({ error: 'ID invalido' }), { status: 400 });
  }

  const recomendacion = await prisma.recomendacionLaboral.findUnique({
    where: { id: recomendacionId },
    include: {
      usuario: {
        include: {
          eps: true,
          cargoDocente: true,
          secretariaRef: true,
          institucionEducativaRef: {
            include: {
              secretaria: true,
            },
          },
        },
      },
      empleado: {
        include: {
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
      firmas: {
        orderBy: { orden: 'asc' },
        include: {
          empleado: {
            select: {
              esMiembroJunta: true,
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
    },
  });

  if (!recomendacion) {
    return new Response(JSON.stringify({ error: 'Recomendacion no encontrada' }), {
      status: 404,
    });
  }

  const docente = recomendacion.usuario;
  const logoSrc = await getLogoDataUrl(req).catch(() => null);

  const juntaMedica = await prisma.empleado.findMany({
    where: {
      activo: true,
      esMiembroJunta: true,
    },
    include: {
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
    orderBy: [
      { primerApellido: 'asc' },
      { segundoApellido: 'asc' },
      { primerNombre: 'asc' },
      { segundoNombre: 'asc' },
    ],
  });

  const firmasSnapshot: FirmaSource[] = recomendacion.firmas
    .filter(
      (firma) => Number.isFinite(firma.empleadoId) && isEligibleBoardDoctor(firma.empleado),
    )
    .map((firma) => ({
      empleadoId: firma.empleadoId as number,
      nombre: firma.nombreCompleto,
      especialidad: getMedicinaLaboralSpecialty(firma.empleado),
      registroMedico: firma.registroMedico,
      licencia: firma.licencia,
      firmaSrc: bytesToDataUrl(firma.firma, firma.firmaMime),
    }));

  const firmasJuntaActual: FirmaSource[] = juntaMedica
    .filter((empleado) => isEligibleBoardDoctor(empleado))
    .map((empleado) => ({
      empleadoId: empleado.id,
      nombre:
        fullName(
          empleado.primerNombre,
          empleado.segundoNombre,
          empleado.primerApellido,
          empleado.segundoApellido,
        ) || 'MEDICO SIN NOMBRE',
      especialidad: getMedicinaLaboralSpecialty(empleado),
      registroMedico: empleado.registroMedico,
      licencia: empleado.licencia,
      firmaSrc: bytesToDataUrl(empleado.firma, empleado.firmaMime),
    }));

  const firmasSnapshotByEmpleadoId = new Map(
    firmasSnapshot.map((firma) => [firma.empleadoId, firma]),
  );

  const firmas = firmasJuntaActual.map(({ empleadoId, ...firmaActual }) => {
    const snapshot = firmasSnapshotByEmpleadoId.get(empleadoId);
    return snapshot ?? firmaActual;
  });

  const pdfData = {
    numeroReferencia: recomendacion.numeroRecomendacion,
    fechaAtencion: formatDateDMY(recomendacion.fechaRecomendacion),
    docente: {
      nombreCompleto:
        fullName(
          docente.primerNombre,
          docente.segundoNombre,
          docente.primerApellido,
          docente.segundoApellido,
        ) || 'DOCENTE SIN NOMBRE',
      documento: `${docente.tipoIdentificacion} ${docente.identificacion}`,
      genero: normalizeGenero(docente.sexo, docente.genero),
      estadoCivil: docente.estadoCivil,
      empresa: docente.eps?.nombreEntidad ?? null,
      cargo: docente.cargoDocente?.nombre ?? null,
      secretaria:
        docente.secretariaRef?.nombre ??
        docente.institucionEducativaRef?.secretaria?.nombre ??
        null,
      institucion: docente.institucionEducativaRef?.nombre ?? null,
      direccion: docente.direccion,
      telefono: docente.telefono ?? docente.celular ?? null,
      edad: docente.edad != null ? String(docente.edad) : null,
      talla: formatDecimal(recomendacion.tallaM, 'm'),
      peso: formatDecimal(recomendacion.pesoKg, 'Kg'),
      imc: formatDecimal(recomendacion.imc),
    },
    examenesRealizados: normalizeText(
      recomendacion.examenesRealizados,
      DEFAULT_EXAMENES_REALIZADOS,
    ),
    motivo: normalizeText(recomendacion.motivo, DEFAULT_MOTIVO),
    recomendaciones: normalizeText(
      recomendacion.recomendacionesObservacionesRestricciones,
      'Sin recomendaciones registradas.',
    ),
    firmas,
  };

  const element = React.createElement(RecomendacionLaboralReactPdf, {
      recomendacion: pdfData,
      logoSrc,
    });
  const stream = await renderToStream(
    element as React.ReactElement<import('@react-pdf/renderer').DocumentProps>,
  );

  const buffer = await streamToBuffer(stream as PdfStream);

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="recomendacion-${recomendacionId}.pdf"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}





