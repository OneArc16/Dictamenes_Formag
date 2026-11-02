import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { AuthorizationContext } from '@/lib/auth/authorization';
import { getAtencionDetalle } from '@/features/atenciones/application/atencion-detail';
import { renderHistoriaClinicaPdf } from '@/features/atenciones/application/historia-clinica-print';

import { ReceptionError } from './errors';
import { assertAttendedAppointmentSite } from './reception-service';

export type ClinicalDocumentKind = 'hc' | 'incapacidad' | 'remision';

type TextLine = { text: string; heading?: boolean; pageBreakBefore?: boolean };

function readableText(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[–—]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[^\x20-\x7E]/g, ' ');
}

function wrapText(value: string, font: PDFFont, size: number, maxWidth: number) {
  const lines: string[] = [];
  for (const paragraph of readableText(value).split(/\r?\n/)) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = '';
    for (const word of words) {
      if (font.widthOfTextAtSize(word, size) > maxWidth) {
        if (line) lines.push(line);
        line = '';
        let part = '';
        for (const character of word) {
          if (font.widthOfTextAtSize(part + character, size) > maxWidth && part) {
            lines.push(part);
            part = character;
          } else part += character;
        }
        line = part;
        continue;
      }
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else line = candidate;
    }
    if (line) lines.push(line);
    if (!words.length) lines.push(' ');
  }
  return lines;
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'America/Bogota' }).format(new Date(value));
}

function appointmentHeader(detail: NonNullable<Awaited<ReturnType<typeof getAtencionDetalle>>>) {
  return [
    { text: 'Atencion clinica', heading: true },
    { text: `Paciente: ${detail.docente.nombreCompleto}` },
    { text: `Documento: ${detail.docente.tipoDocumento} ${detail.docente.documento}` },
    { text: `Fecha: ${dateLabel(detail.inicioProgramado)} | Sede: ${detail.sedeNombre}` },
    { text: `Especialidad: ${detail.especialidadNombre} | Medico: ${detail.medicoNombre}` },
  ];
}

function documentLines(detail: NonNullable<Awaited<ReturnType<typeof getAtencionDetalle>>>, kind: Exclude<ClinicalDocumentKind, 'hc'>, remisionId?: number): TextLine[] {
  if (kind === 'incapacidad') {
    if (!detail.incapacidades.length) throw new ReceptionError('CLINICAL_DOCUMENT_UNAVAILABLE', 'La cita no tiene incapacidades para imprimir.', 404);
    return [
      { text: 'Incapacidades', heading: true }, ...appointmentHeader(detail).slice(1),
      ...detail.incapacidades.flatMap((item, index) => [
        { text: `Incapacidad ${index + 1}`, heading: true },
        { text: `Numero: ${item.numeroInterno} | Categoria: ${item.categoria}` },
        { text: `Periodo: ${item.fechaInicio} a ${item.fechaFin} | Dias: ${item.dias}` },
        { text: `Prorroga: ${item.prorroga ? 'Si' : 'No'}` },
        { text: `Diagnosticos: ${item.diagnosticos.map((diagnostico) => `${diagnostico.codigo} - ${diagnostico.nombre}`).join('; ') || 'No registrados'}` },
        { text: `Observaciones: ${item.observaciones ?? 'Sin observaciones'}` },
      ]),
    ];
  }
  const remisiones = remisionId === undefined ? detail.remisiones : detail.remisiones.filter((item) => item.id === remisionId);
  if (!remisiones.length) throw new ReceptionError('CLINICAL_DOCUMENT_UNAVAILABLE', 'La remisión solicitada no está disponible para imprimir.', 404);
  return [
    { text: 'Remisiones', heading: true }, ...appointmentHeader(detail).slice(1),
    ...remisiones.flatMap((item, index) => [
      { text: `Remision ${index + 1}`, heading: true, pageBreakBefore: index > 0 },
      { text: `Servicio: ${item.cups.codigo} - ${item.cups.nombre}` },
      { text: `Diagnosticos: ${item.diagnosticos.map((diagnostico) => `${diagnostico.codigo} - ${diagnostico.nombre}`).join('; ') || 'No registrados'}` },
      { text: `Motivo: ${item.motivo ?? 'No especificado'}` },
      { text: `Fecha: ${dateLabel(item.fecha)} | Medico: ${item.medicoNombre ?? detail.medicoNombre}` },
    ]),
  ];
}

async function renderPdf(lines: TextLine[]) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const width = 612;
  const height = 792;
  const margin = 48;
  let y = 0;
  const addPage = (): PDFPage => {
    y = height - margin;
    return pdf.addPage([width, height]);
  };
  let page = addPage();
  for (const entry of lines) {
    if (entry.pageBreakBefore && y < height - margin) page = addPage();
    const heading = Boolean(entry.heading);
    const size = heading ? 12 : 10;
    const lineHeight = heading ? 19 : 15;
    const activeFont = heading ? bold : font;
    for (const text of wrapText(entry.text, activeFont, size, width - margin * 2)) {
      if (y < margin) page = addPage();
      page.drawText(text, { x: margin, y, size, font: activeFont, color: rgb(0.12, 0.16, 0.2) });
      y -= lineHeight;
    }
    if (heading) y -= 3;
  }
  return Buffer.from(await pdf.save());
}

export async function renderClinicalDocument(auth: AuthorizationContext, appointmentId: number, kind: ClinicalDocumentKind, remisionId?: number) {
  await assertAttendedAppointmentSite(auth, appointmentId);
  const detail = await getAtencionDetalle(auth, appointmentId);
  if (!detail || detail.estado !== 'ATENDIDA') {
    throw new ReceptionError('CLINICAL_DOCUMENT_NOT_RENDERABLE', 'La cita no permite imprimir documentos clínicos.', 409);
  }
  if (kind === 'hc') return renderHistoriaClinicaPdf(detail);
  return renderPdf(documentLines(detail, kind, remisionId));
}
