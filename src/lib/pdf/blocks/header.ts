import { rgb, type PDFFont, type PDFPage, type PDFImage } from 'pdf-lib';
import type { PdfTheme } from '@/lib/pdf/core/pdfContext';
import { drawRect, yFromTop } from '@/lib/pdf/core/pdfContext';

function wrapWords(font: PDFFont, text: string, size: number, maxW: number) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';

  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) <= maxW) {
      cur = next;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function wrapParagraphs(font: PDFFont, paragraphs: string[], size: number, maxW: number) {
  const out: string[] = [];
  for (const p of paragraphs) out.push(...wrapWords(font, p, size, maxW));
  return out;
}

export function renderHeader(params: {
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  logo: PDFImage | null;
  theme: PdfTheme;
}) {
  const { page, bold, logo, theme } = params;

  const { width, height } = page.getSize();
  const x0 = 18;
  const w = width - 36;

  const headerTop = 18; // desde arriba
  const headerH = 78;

  // ✅ marco header
  drawRect(page, x0, headerTop, w, headerH, rgb(1, 1, 1), theme.border);

  // ✅ usa el ancho del logo como el original (más espacio al título)
  const logoW = 150;

  // ✅ división vertical SIN gap (rectángulo relleno)
  const dividerW = 1.2;
  const overlap = 0.6;
  const dividerX = x0 + logoW - dividerW / 2;

  page.drawRectangle({
    x: dividerX,
    y: yFromTop(page, headerTop - overlap, headerH + overlap * 2),
    width: dividerW,
    height: headerH + overlap * 2,
    color: theme.border ?? rgb(0, 0, 0),
    borderWidth: 0,
  });

  // ✅ Logo centrado
  if (logo) {
    const maxW = logoW - 16;
    const maxH = headerH - 16;

    const scale = Math.min(maxW / logo.width, maxH / logo.height);
    const drawW = logo.width * scale;
    const drawH = logo.height * scale;

    const cx = x0 + (logoW - drawW) / 2;
    const cyTop = headerTop + (headerH - drawH) / 2;

    page.drawImage(logo, {
      x: cx,
      y: yFromTop(page, cyTop, drawH),
      width: drawW,
      height: drawH,
    });
  }

  // ✅ Título: wrap + shrink para que NO se salga
  const titleParagraphs = [
    'FORMATO PARA EL DICTAMEN MEDICO LABORAL DE LA PERDIDA DE CAPACIDAD',
    'LABORAL O DEL ESTADO DE INVALIDEZ PARA LOS EDUCADORES AFILIADOS AL FONDO',
    'DE PRESTADORES SOCIALES DEL MAGISTERIO',
  ];

  const boxX = x0 + logoW;
  const boxW = w - logoW;

  const pad = 8;
  const maxTextW = boxW - pad * 2;
  const maxTextH = headerH - pad * 2;

  let size = 9;
  const minSize = 6.5;
  const gap = 2;

  let lines = wrapParagraphs(bold, titleParagraphs, size, maxTextW);

  // shrink hasta que quepa en alto
  while (size > minSize) {
    lines = wrapParagraphs(bold, titleParagraphs, size, maxTextW);
    const lineH = size + gap;
    const textH = lines.length * lineH;

    const fitsW = lines.every((l) => bold.widthOfTextAtSize(l, size) <= maxTextW);
    const fitsH = textH <= maxTextH;

    if (fitsW && fitsH) break;
    size -= 0.25;
  }

  const lineH = size + gap;
  const textH = lines.length * lineH;

  // top/bottom del cuadro del header (en coordenadas "desde arriba")
  const contentTop = headerTop + pad;
  const startBaselineTop = contentTop + (maxTextH - textH) / 2 + size; // baseline primera línea

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    const tw = bold.widthOfTextAtSize(ln, size);
    const xx = boxX + pad + (maxTextW - tw) / 2;

    const baselineTop = startBaselineTop + i * lineH;
    const yPdf = height - baselineTop;

    page.drawText(ln, {
      x: xx,
      y: yPdf,
      size,
      font: bold,
      color: (theme as any)?.text ?? rgb(0, 0, 0),
    });
  }
}
