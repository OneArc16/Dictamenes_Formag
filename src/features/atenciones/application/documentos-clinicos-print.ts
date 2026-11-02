import { renderToBuffer } from '@react-pdf/renderer';
import fs from 'node:fs/promises';
import path from 'node:path';
import React from 'react';

import type { AtencionDetalle } from '@/features/atenciones/application/atencion-detail';
import type { DocumentoClinicoExtras } from '@/features/atenciones/presentation/print/documento-clinico-model';
import { HistoriaClinicaPdf } from '@/features/atenciones/presentation/print/HistoriaClinicaPdf';
import { buildHistoriaClinica } from '@/features/atenciones/presentation/print/historia-clinica-model';
import { RemisionPdf } from '@/features/atenciones/presentation/print/RemisionPdf';
import { buildRemisiones } from '@/features/atenciones/presentation/print/remision-model';
import { prisma } from '@/lib/prisma';

/** Prestador que emite los documentos clínicos; la base no guarda su NIT. */
export const INSTITUCION = { nombre: 'Servicios Integrales de Salud del Magdalena', nit: '900 018 045 - 5' };

function joinName(...parts: Array<string | null | undefined>) {
  return parts.map((part) => part?.trim()).filter(Boolean).join(' ');
}

function signatureDataUrl(bytes: Uint8Array | null, mime: string | null) {
  if (!bytes?.length) return null;
  const buffer = Buffer.from(bytes);
  const type = mime || (buffer[0] === 0xff && buffer[1] === 0xd8 ? 'image/jpeg' : 'image/png');
  return `data:${type};base64,${buffer.toString('base64')}`;
}

async function logoDataUrl() {
  try {
    const bytes = await fs.readFile(path.join(process.cwd(), 'public', 'assets', 'logo-sism.png'));
    return `data:image/png;base64,${bytes.toString('base64')}`;
  } catch {
    return null;
  }
}

/** Lo que los documentos impresos necesitan y no trae el detalle de la atención: prestador, firma, cierre. */
export async function loadDocumentoClinicoExtras(citaId: number, now = new Date()): Promise<DocumentoClinicoExtras> {
  const cita = await prisma.cita.findUniqueOrThrow({
    where: { id: citaId },
    select: {
      sede: {
        select: {
          codigoHabilitacion: true,
          direccion: true,
          telefono: true,
          municipio: { select: { nombre: true } },
          centroMedico: {
            select: { codigoHabilitacion: true, direccion: true, telefono: true, municipio: { select: { nombre: true } } },
          },
        },
      },
      // La firma es la del médico que atendió la cita.
      medico: {
        select: {
          tipoDocumento: true,
          numeroIdentidad: true,
          primerNombre: true,
          segundoNombre: true,
          primerApellido: true,
          segundoApellido: true,
          registroMedico: true,
          firma: true,
          firmaMime: true,
        },
      },
      paciente: {
        select: { fechaNacimiento: true, sexo: true, estadoCivil: true, direccion: true, etnia: true, zonaResidencia: true },
      },
      historial: {
        where: { tipoEvento: 'ATENDIDA' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true },
      },
    },
  });
  const { sede, medico, paciente } = cita;
  const centro = sede.centroMedico;

  return {
    institucion: {
      ...INSTITUCION,
      codigoHabilitacion: sede.codigoHabilitacion ?? centro.codigoHabilitacion ?? null,
      direccion: sede.direccion ?? centro.direccion ?? null,
      telefono: sede.telefono ?? centro.telefono ?? null,
      ciudad: sede.municipio?.nombre ?? centro.municipio?.nombre ?? null,
    },
    paciente: {
      fechaNacimiento: paciente.fechaNacimiento?.toISOString().slice(0, 10) ?? null,
      sexo: paciente.sexo,
      estadoCivil: paciente.estadoCivil,
      direccion: paciente.direccion,
      etnia: paciente.etnia,
      zonaResidencia: paciente.zonaResidencia,
    },
    profesional: {
      nombre: joinName(medico.primerNombre, medico.segundoNombre, medico.primerApellido, medico.segundoApellido),
      tipoDocumento: medico.tipoDocumento,
      documento: medico.numeroIdentidad,
      registroMedico: medico.registroMedico,
      firmaSrc: signatureDataUrl(medico.firma, medico.firmaMime),
    },
    atendidaEn: cita.historial[0]?.createdAt.toISOString() ?? null,
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
