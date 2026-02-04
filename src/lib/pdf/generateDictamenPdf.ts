import path from 'path';
import { promises as fs } from 'fs';
import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import { page1Fields, type PdfField } from '@/lib/pdf/overlayMaps/dictamenPage1.map';

export type DictamenPdfBasicData = {
  dictamenId: number;
  procedimientoPcl: 'A' | 'B';
  fechaDictamen?: string | null;

  ciudadDictamen?: string | null;
  contingencia?: 'ENFERMEDAD_GENERAL' | 'ATEP' | null;
  norma?: 'DECRETO_1848' | 'LEY_100' | null;
  establecimientoEducativo?: string | null;
  entidadTerritorial?: string | null;
  fechaAspectosGenerales?: string | null;

  nombres?: string | null;
  apellidos?: string | null;
  documento?: string | null;
  genero?: string | null;
  escolaridad?: string | null;
  estadoCivil?: string | null;
  fechaNacimiento?: string | null;
  edad?: string | number | null;
  direccion?: string | null;
  zona?: string | null;
  municipio?: string | null;
  departamento?: string | null;
  cargo?: string | null;
  escalafon?: string | null;
  vinculacion?: string | null;
};

type OverflowItem = {
  label: string;
  value: string;
};

function yFromTop(pageHeight: number, topY: number) {
  return pageHeight - topY;
}

function drawText(page: PDFPage, font: PDFFont, text: string, x: number, y: number, size = 9) {
  if (!text) return;
  page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
}

function wrapLines(font: PDFFont, text: string, maxWidth: number, size: number) {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let line = '';

  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    const width = font.widthOfTextAtSize(test, size);
    if (width <= maxWidth) line = test;
    else {
      if (line) lines.push(line);
      line = w;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function fitTextInBox(args: {
  font: PDFFont;
  text: string;
  maxWidth: number;
  boxHeight: number;
  size: number;
  minSize: number;
  lineHeight: number;
}) {
  const { font, text, maxWidth, boxHeight, size, minSize, lineHeight } = args;

  // Intentar bajar tamaño hasta que quepa
  for (let s = size; s >= minSize; s -= 0.5) {
    const lines = wrapLines(font, text, maxWidth, s);
    const needed = lines.length * lineHeight;
    if (needed <= boxHeight) {
      return { fit: true, size: s, lines, overflow: '' };
    }
  }

  // No cabe ni con minSize: cortamos a las líneas que caben
  const linesAtMin = wrapLines(font, text, maxWidth, minSize);
  const maxLines = Math.max(1, Math.floor(boxHeight / lineHeight));
  const lines = linesAtMin.slice(0, maxLines);
  const overflow = linesAtMin.slice(maxLines).join('\n');

  return { fit: false, size: minSize, lines, overflow };
}

function drawMarker(page: PDFPage, font: PDFFont, label: string, x: number, y: number) {
  page.drawCircle({ x, y, size: 2.2, color: rgb(0.9, 0.1, 0.1) });
  page.drawText(label, { x: x + 4, y: y + 1, size: 6, font, color: rgb(0.9, 0.1, 0.1) });
}

function resolveValue(data: DictamenPdfBasicData, key: string): string {
  if (key === 'dictamenId') return String(data.dictamenId ?? '');
  if (key === 'fechaDictamen') return data.fechaDictamen ? String(data.fechaDictamen) : '';

  if (key === 'checkProcA') return data.procedimientoPcl === 'A' ? 'X' : '';
  if (key === 'checkProcB') return data.procedimientoPcl === 'B' ? 'X' : '';

  if (key === 'checkEnfermedadGeneral') return data.contingencia === 'ENFERMEDAD_GENERAL' ? 'X' : '';
  if (key === 'checkAtep') return data.contingencia === 'ATEP' ? 'X' : '';

  if (key === 'checkDecreto1848') return data.norma === 'DECRETO_1848' ? 'X' : '';
  if (key === 'checkLey100') return data.norma === 'LEY_100' ? 'X' : '';

  const v = (data as any)[key];
  if (v == null) return '';
  return String(v);
}

function renderFields(
  page: PDFPage,
  font: PDFFont,
  data: DictamenPdfBasicData,
  fields: PdfField[],
  debug: boolean,
  overflows: OverflowItem[]
) {
  const { height } = page.getSize();

  for (const f of fields) {
    const y = yFromTop(height, f.topY);
    const value = resolveValue(data, f.key);
    const size = f.size ?? 9;

    if (debug) drawMarker(page, font, f.key, f.x, y);

    if (!value) continue;

    // Si tiene caja definida => auto-fit
    if (f.maxWidth && f.boxHeight) {
      const fit = fitTextInBox({
        font,
        text: value,
        maxWidth: f.maxWidth,
        boxHeight: f.boxHeight,
        size,
        minSize: f.minSize ?? 7,
        lineHeight: f.lineHeight ?? 11,
      });

      // Dibuja líneas
      let cursorY = y;
      for (const line of fit.lines) {
        drawText(page, font, line, f.x, cursorY, fit.size);
        cursorY -= (f.lineHeight ?? 11);
      }

      // Si sobró, manda a anexo
      if (fit.overflow && f.overflowToAnnex) {
        const label = f.label ?? f.key;
        overflows.push({ label, value });
        // deja marca “VER ANEXO”
        drawText(page, font, 'VER ANEXO', f.x + (f.maxWidth - 60), y, 7);
      }

      continue;
    }

    // Sin caja: texto simple
    drawText(page, font, value, f.x, y, size);
  }
}

function addAnnexPages(pdfDoc: PDFDocument, font: PDFFont, dictamenId: number, items: OverflowItem[]) {
  if (!items.length) return;

  const page = pdfDoc.addPage(); // Letter default
  const { width, height } = page.getSize();

  // Header
  page.drawText(`ANEXOS - Dictamen #${dictamenId}`, { x: 40, y: height - 50, size: 14, font });
  page.drawLine({ start: { x: 40, y: height - 60 }, end: { x: width - 40, y: height - 60 }, thickness: 1, color: rgb(0, 0, 0) });

  let cursorY = height - 90;

  for (const it of items) {
    // salto si no cabe
    if (cursorY < 80) {
      cursorY = height - 50;
      const p = pdfDoc.addPage();
      cursorY = p.getSize().height - 50;
      // Nota: simplificado (si quieres paginar perfecto lo refinamos)
    }

    page.drawText(it.label.toUpperCase(), { x: 40, y: cursorY, size: 10, font, color: rgb(0, 0, 0) });
    cursorY -= 14;

    // párrafo simple (wrap por ancho fijo)
    const maxWidth = width - 80;
    const words = it.value.replace(/\s+/g, ' ').trim().split(' ');
    let line = '';
    const size = 9;

    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      const wlen = font.widthOfTextAtSize(test, size);
      if (wlen <= maxWidth) line = test;
      else {
        page.drawText(line, { x: 40, y: cursorY, size, font });
        cursorY -= 12;
        line = w;
      }
      if (cursorY < 70) break;
    }
    if (line && cursorY >= 70) {
      page.drawText(line, { x: 40, y: cursorY, size, font });
      cursorY -= 18;
    } else {
      cursorY -= 18;
    }
  }
}

export async function generateDictamenPdfBasic(options: { data: DictamenPdfBasicData; debug?: boolean }) {
  const { data, debug = false } = options;

  const templatePath = path.join(process.cwd(), 'public', 'templates', 'dictamen', 'formato-blanco.pdf');
  const templateBytes = await fs.readFile(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page1 = pdfDoc.getPages()[0];

  const overflows: OverflowItem[] = [];

  renderFields(page1, font, data, page1Fields, debug, overflows);

  // ✅ Anexos por overflow
  addAnnexPages(pdfDoc, font, data.dictamenId, overflows);

  return pdfDoc.save();
}
