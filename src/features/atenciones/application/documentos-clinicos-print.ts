import { renderToBuffer } from '@react-pdf/renderer';
import fs from 'node:fs/promises';
import path from 'node:path';
import React from 'react';

import type { AtencionDetalle } from '@/features/atenciones/application/atencion-detail';
import type { DocumentoClinicoExtras } from '@/features/atenciones/presentation/print/documento-clinico-model';
import { HistoriaClinicaPdf } from '@/features/atenciones/presentation/print/HistoriaClinicaPdf';
import { buildHistoriaClinica } from '@/features/atenciones/presentation/print/historia-clinica-model';
import { IncapacidadPdf } from '@/features/atenciones/presentation/print/IncapacidadPdf';
import { buildIncapacidades } from '@/features/atenciones/presentation/print/incapacidad-model';
import { RemisionPdf } from '@/features/atenciones/presentation/print/RemisionPdf';
import { buildRemisiones } from '@/features/atenciones/presentation/print/remision-model';
import { prisma } from '@/lib/prisma';

import { datosRegistroDeAtencion } from './datos-registro';

/** Prestador que emite los documentos clínicos; la base no guarda su NIT. */
export const INSTITUCION = { nombre: 'Servicios Integrales de Salud del Magdalena', nit: '900 018 045 - 5' };

export async function logoDataUrl() {
  try {
    const bytes = await fs.readFile(path.join(process.cwd(), 'public', 'assets', 'logo-sism.png'));
    return `data:image/png;base64,${bytes.toString('base64')}`;
  } catch {
    return null;
  }
}

/** Lo que los documentos impresos necesitan y no trae el detalle de la atención: prestador, firma, cierre. */
export async function loadDocumentoClinicoExtras(citaId: number, now = new Date()): Promise<DocumentoClinicoExtras> {
  const [registro, atendida] = await Promise.all([
    // Finalizada con copia: paciente, médico y sede tal como estaban al firmar.
    datosRegistroDeAtencion(prisma, citaId),
    prisma.citaHistorial.findFirst({
      where: { citaId, tipoEvento: 'ATENDIDA' },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
  ]);
  const { paciente, profesional, sede } = registro;

  return {
    institucion: { ...INSTITUCION, ...sede },
    paciente: {
      fechaNacimiento: paciente.fechaNacimiento,
      sexo: paciente.sexo,
      estadoCivil: paciente.estadoCivil,
      direccion: paciente.direccion,
      etnia: paciente.etnia,
      zonaResidencia: paciente.zonaResidencia,
    },
    profesional,
    atendidaEn: atendida?.createdAt.toISOString() ?? null,
    generadoEn: now.toISOString(),
  };
}

async function render(detalle: AtencionDetalle, create: (extras: DocumentoClinicoExtras, logoSrc: string | null) => React.ReactElement) {
  const [extras, logoSrc] = await Promise.all([loadDocumentoClinicoExtras(detalle.id), logoDataUrl()]);
  return Buffer.from(await renderToBuffer(create(extras, logoSrc) as never));
}

export function renderHistoriaClinicaPdf(detalle: AtencionDetalle) {
  return render(detalle, (extras, logoSrc) =>
    React.createElement(HistoriaClinicaPdf, { hc: buildHistoriaClinica(detalle, extras), logoSrc }),
  );
}

/** Una hoja por remisión; con `remisionId`, solo esa. */
export function renderRemisionesPdf(detalle: AtencionDetalle, remisionId?: number) {
  return render(detalle, (extras, logoSrc) =>
    React.createElement(RemisionPdf, { doc: buildRemisiones(detalle, extras, remisionId), logoSrc }),
  );
}

/** Una hoja por incapacidad de la atención. */
export function renderIncapacidadesPdf(detalle: AtencionDetalle) {
  return render(detalle, (extras, logoSrc) =>
    React.createElement(IncapacidadPdf, { doc: buildIncapacidades(detalle, extras), logoSrc }),
  );
}
