import { rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import { defaultTheme, bandCentered, drawRect, drawTextBaseline } from '@/lib/pdf/core/pdfContext';

function wrapTextLine(font: PDFFont, text: string, size: number, maxW: number): string[] {
  const t = (text ?? '').trim();
  if (!t) return [''];

  const words = t.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  const fits = (s: string) => font.widthOfTextAtSize(s, size) <= maxW;

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (fits(candidate)) {
      line = candidate;
      continue;
    }

    // empuja la línea actual si existe
    if (line) lines.push(line);

    // si la palabra sola no cabe, la partimos
    if (!fits(word)) {
      let rest = word;
      while (rest.length) {
        let cut = rest.length;
        while (cut > 1 && !fits(rest.slice(0, cut))) cut -= 1;
        lines.push(rest.slice(0, cut));
        rest = rest.slice(cut);
      }
      line = '';
      continue;
    }

    // la palabra cabe como nueva línea
    line = word;
  }

  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

function wrapText(font: PDFFont, text: string, size: number, maxW: number): string[] {
  // preserva saltos de línea
  const rawLines = String(text ?? '').replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];

  for (const raw of rawLines) {
    if (!raw.trim()) {
      out.push(''); // línea vacía = salto visible
      continue;
    }
    out.push(...wrapTextLine(font, raw, size, maxW));
  }

  // recorta líneas vacías al final para que la caja no se infle
  while (out.length && out[out.length - 1] === '') out.pop();
  return out;
}

export function renderPage1Parte3Antecedentes(params: {
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  dictamen?: any;

  x0: number;
  w: number;
  top: number;

  text: string;          // ✅ SOLO antecedentesClinicos
  showTitle?: boolean;   // ✅ título solo en la primera página
}) {
  const { page, font, bold, x0, w } = params;
  const theme = defaultTheme;

  let top = params.top;

  const showTitle = params.showTitle !== false;
  const titleH = 22;

  if (showTitle) {
    bandCentered(
      page,
      bold,
      theme,
      x0,
      top,
      w,
      titleH,
      '3. ANTECEDENTES CLÍNICOS (EPICRISIS Y ESTADO ACTUAL)',
      theme.peach
    );
    top += titleH;
  }

  const pageH = page.getSize().height;
  const bottomMargin = 18;

  const padding = 10;
  const size = 10;
  const lineHeight = 12;

  const maxBoxH = Math.max(0, pageH - bottomMargin - top);
  const maxTextW = Math.max(0, w - padding * 2);

  const fullText = String(params.text ?? '').trim();
  const allLines = wrapText(font, fullText, size, maxTextW);

  // ¿Cuántas líneas caben?
  const maxLinesNoReserve = Math.max(0, Math.floor((maxBoxH - padding * 2) / lineHeight));

  let overflow = false;
  let reserveBottom = 0;

  if (allLines.length > maxLinesNoReserve) {
    overflow = true;
    reserveBottom = 14; // espacio para “continúa…”
  }

  const maxLines = Math.max(
    0,
    Math.floor((maxBoxH - padding * 2 - reserveBottom) / lineHeight)
  );

  const linesToDraw = allLines.slice(0, maxLines);
  const overflowLines = allLines.slice(maxLines);

  const minBoxH = 50;
  const contentH = linesToDraw.length * lineHeight;
  let boxH = padding * 2 + contentH + (overflow ? reserveBottom : 0);
  boxH = Math.max(minBoxH, boxH);
  boxH = Math.min(maxBoxH, boxH);

  // Caja
  drawRect(page, x0, top, w, boxH, rgb(1, 1, 1), theme.border);

  // Texto
  let baselineTop = top + padding + size;
  const xText = x0 + padding;

  for (const ln of linesToDraw) {
    if (ln) drawTextBaseline(page, font, ln, xText, baselineTop, size);
    baselineTop += lineHeight;
  }

  // Nota de continuación
  let overflowText = '';
  if (overflow && overflowLines.length) {
    overflowText = overflowLines.join('\n');
    const note = ' ';
    const noteSize = 8;
    const tw = bold.widthOfTextAtSize(note, noteSize);
    const baseline = top + boxH - 6;
    drawTextBaseline(page, bold, note, x0 + w - 10 - tw, baseline, noteSize);
  }

  return { nextTop: top + boxH, overflowText };
}