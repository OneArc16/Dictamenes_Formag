import type { PDFPage, PDFFont, RGB } from 'pdf-lib';

export type DrawTextOptions = {
  size?: number;
  minSize?: number;
  color?: RGB;
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  lineHeight?: number; // factor
  maxLines?: number; // opcional
};

function measure(font: PDFFont, text: string, size: number) {
  return font.widthOfTextAtSize(text, size);
}

function wrapLines(font: PDFFont, text: string, size: number, maxWidth: number) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (measure(font, next, size) <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      // palabra larga: forzar corte “duro”
      if (measure(font, w, size) > maxWidth) {
        let chunk = '';
        for (const ch of w) {
          const test = chunk + ch;
          if (measure(font, test, size) <= maxWidth) chunk = test;
          else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        line = chunk;
      } else {
        line = w;
      }
    }
  }

  if (line) lines.push(line);
  return lines;
}

export function drawTextInCell(
  page: PDFPage,
  font: PDFFont,
  text: string,
  x: number,
  yTop: number,
  w: number,
  h: number,
  opts: DrawTextOptions = {}
) {
  const {
    size = 9,
    minSize = 7,
    color,
    align = 'left',
    valign = 'middle',
    lineHeight = 1.15,
    maxLines,
  } = opts;

  const padX = 4;
  const padY = 3;

  const boxW = Math.max(0, w - padX * 2);
  const boxH = Math.max(0, h - padY * 2);

  let s = size;
  let lines: string[] = [];

  // shrink hasta que quepa (alto)
  while (s >= minSize) {
    lines = wrapLines(font, text ?? '', s, boxW);
    if (maxLines && lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      lines[lines.length - 1] = lines[lines.length - 1].replace(/\s+$/, '') + '…';
    }
    const neededH = lines.length * (s * lineHeight);
    if (neededH <= boxH) break;
    s -= 0.25;
  }

  // si aún no cabe, truncar agresivo
  const neededH = lines.length * (s * lineHeight);
  if (neededH > boxH) {
    lines = lines.slice(0, Math.max(1, Math.floor(boxH / (s * lineHeight))));
    if (lines.length) lines[lines.length - 1] = lines[lines.length - 1] + '…';
  }

  const totalTextH = lines.length * (s * lineHeight);

  let yStart: number;
  if (valign === 'top') yStart = yTop - padY - s;
  else if (valign === 'bottom') yStart = yTop - (h - padY) - (totalTextH - s);
  else yStart = yTop - (h / 2) - (totalTextH / 2) + (s * 0.85);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lw = measure(font, line, s);

    let tx = x + padX;
    if (align === 'center') tx = x + (w / 2) - (lw / 2);
    if (align === 'right') tx = x + w - padX - lw;

    const ty = yStart - i * (s * lineHeight);
    page.drawText(line, { x: tx, y: ty, size: s, font, color });
  }
}

export function drawInlineLabelValue(
  page: PDFPage,
  fontBold: PDFFont,
  font: PDFFont,
  label: string,
  value: string,
  x: number,
  yTop: number,
  w: number,
  h: number,
  opts: { size?: number; minValueSize?: number } = {}
) {
  const size = opts.size ?? 9;
  const minValueSize = opts.minValueSize ?? 7;

  const padX = 4;
  const labelW = fontBold.widthOfTextAtSize(label, size);
  const gap = 4;

  const vx = x + padX + labelW + gap;
  const vw = Math.max(0, w - (vx - x) - padX);

  // shrink SOLO el valor para que quepa en una línea
  let vs = size;
  const v = value ?? '';
  while (vs >= minValueSize && font.widthOfTextAtSize(v, vs) > vw) vs -= 0.25;

  // baseline centrado vertical
  const baseline = yTop - (h / 2) - (size / 2) + size * 0.85;

  page.drawText(label, { x: x + padX, y: baseline, font: fontBold, size });
  page.drawText(v, { x: vx, y: baseline, font, size: vs });
}
