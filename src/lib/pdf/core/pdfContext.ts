import { rgb, type PDFPage, type PDFFont } from 'pdf-lib';

export type Color = ReturnType<typeof rgb>;

export type PdfTheme = {
  blue: Color;
  light: Color;
  peach: Color;
  border: Color;
};

export const defaultTheme: PdfTheme = {
  blue: rgb(0.69, 0.82, 0.92),
  light: rgb(0.88, 0.94, 0.98),
  peach: rgb(0.97, 0.88, 0.83),
  border: rgb(0, 0, 0),
};

// =========================
// Coordenadas top-based
// =========================
export function yFromTop(page: PDFPage, topY: number, h = 0) {
  const { height } = page.getSize();
  return height - topY - h;
}

export function drawRect(page: PDFPage, x: number, topY: number, w: number, h: number, fill?: Color, borderColor?: Color) {
  page.drawRectangle({
    x,
    y: yFromTop(page, topY, h),
    width: w,
    height: h,
    color: fill,
    borderColor,
    borderWidth: borderColor ? 1 : 0,
  });
}

// baselineTopY = distancia desde arriba a la línea base del texto
export function drawTextBaseline(page: PDFPage, font: PDFFont, text: string, x: number, baselineTopY: number, size: number, color?: Color) {
  if (!text) return;
  page.drawText(text, {
    x,
    y: yFromTop(page, baselineTopY, 0),
    size,
    font,
    color: color ?? rgb(0, 0, 0),
  });
}

export function wrapLines(font: PDFFont, text: string, maxWidth: number, size: number) {
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

export function drawTextInCell(params: {
  page: PDFPage;
  font: PDFFont;
  text: string;
  x: number;
  topY: number;
  w: number;
  h: number;
  size?: number;
  minSize?: number;
  padding?: number;
  lineHeight?: number;
  valign?: 'top' | 'middle';
  align?: 'left' | 'center';
}) {
  const {
    page,
    font,
    text,
    x,
    topY,
    w,
    h,
    size = 9,
    minSize = 7,
    padding = 4,
    lineHeight = 11,
    valign = 'top',
    align = 'left',
  } = params;

  const content = (text ?? '').trim();
  if (!content) return;

  const maxWidth = w - padding * 2;
  const boxHeight = h - padding * 2;

  let chosenSize = size;
  let lines: string[] = [];

  for (let s = size; s >= minSize; s -= 0.5) {
    const ls = wrapLines(font, content, maxWidth, s);
    const needed = ls.length * lineHeight;
    if (needed <= boxHeight) {
      chosenSize = s;
      lines = ls;
      break;
    }
    if (s <= minSize) {
      chosenSize = minSize;
      lines = ls;
    }
  }

  const maxLines = Math.max(1, Math.floor(boxHeight / lineHeight));
  const visible = lines.slice(0, maxLines);

  const usedHeight = visible.length * lineHeight;
  const startOffset = valign === 'middle' ? Math.max(0, (boxHeight - usedHeight) / 2) : 0;

  let baselineTopY = topY + padding + startOffset + chosenSize;

  for (const ln of visible) {
    let xx = x + padding;
    if (align === 'center') {
      const tw = font.widthOfTextAtSize(ln, chosenSize);
      xx = x + (w - tw) / 2;
    }
    drawTextBaseline(page, font, ln, xx, baselineTopY, chosenSize);
    baselineTopY += lineHeight;
  }
}

export function drawCenteredText(page: PDFPage, font: PDFFont, text: string, x: number, topY: number, w: number, h: number, size: number) {
  const tw = font.widthOfTextAtSize(text, size);
  const baseline = topY + (h - size) / 2 + size - 1;
  drawTextBaseline(page, font, text, x + (w - tw) / 2, baseline, size);
}

export function bandCentered(page: PDFPage, bold: PDFFont, theme: PdfTheme, x: number, topY: number, w: number, h: number, text: string, fill?: Color) {
  drawRect(page, x, topY, w, h, fill ?? theme.blue, theme.border);
  drawCenteredText(page, bold, text, x, topY, w, h, 11);
}

export function drawOuterBorder(page: PDFPage, theme: PdfTheme) {
  const { width, height } = page.getSize();
  page.drawRectangle({
    x: 18,
    y: 18,
    width: width - 36,
    height: height - 36,
    borderColor: theme.border,
    borderWidth: 1,
  });
}

export function drawCheckX(page: PDFPage, bold: PDFFont, checked: boolean, x: number, baselineTopY: number) {
  if (!checked) return;
  drawTextBaseline(page, bold, 'X', x, baselineTopY, 11);
}
