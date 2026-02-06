import type { PDFPage, PDFFont } from 'pdf-lib';
import { drawTextBaseline } from '@/lib/pdf/core/pdfContext';

function wrapSingleLine(font: PDFFont, line: string, size: number, maxW: number): string[] {
  const txt = (line ?? '').replace(/\s+/g, ' ').trim();
  if (!txt) return [''];

  const words = txt.split(' ');
  const out: string[] = [];
  let cur = '';

  const fits = (s: string) => font.widthOfTextAtSize(s, size) <= maxW;

  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;

    if (fits(test)) {
      cur = test;
      continue;
    }

    if (cur) out.push(cur);

    // palabra muy larga -> partirla
    if (fits(w)) {
      cur = w;
      continue;
    }

    let chunk = '';
    for (const ch of w) {
      const t2 = chunk + ch;
      if (fits(t2)) chunk = t2;
      else {
        if (chunk) out.push(chunk);
        chunk = ch;
      }
    }
    cur = chunk;
  }

  if (cur) out.push(cur);
  return out;
}

export function wrapText(font: PDFFont, text: string, size: number, maxW: number): string[] {
  const raw = (text ?? '').replace(/\r\n/g, '\n').split('\n');
  const lines: string[] = [];

  for (const r of raw) {
    if (!r || r.trim() === '') {
      lines.push('');
      continue;
    }
    lines.push(...wrapSingleLine(font, r, size, maxW));
  }

  return lines;
}

export function drawTextFlow(params: {
  page: PDFPage;
  font: PDFFont;

  text: string;

  x: number;
  topY: number;
  w: number;
  h: number;

  size: number;
  lineHeight: number;
  padding: number;

  // opcional: deja un espacio al final para notas ("Continúa...")
  reserveBottom?: number;
}) {
  const { page, font, text, x, topY, w, h, size, lineHeight, padding } = params;
  const reserveBottom = params.reserveBottom ?? 0;

  const maxW = Math.max(0, w - padding * 2);
  const usableH = Math.max(0, h - padding * 2 - reserveBottom);

  // n líneas si: firstBaseline = padding+size ; lastBaseline <= usableH+padding
  const maxLines = Math.max(0, Math.floor(1 + (usableH - size) / lineHeight));

  const all = wrapText(font, text ?? '', size, maxW);
  const draw = all.slice(0, maxLines);
  const rest = all.slice(maxLines);

  let baseline = topY + padding + size;

  for (const ln of draw) {
    if (ln === '') {
      baseline += lineHeight;
      continue;
    }
    drawTextBaseline(page, font, ln, x + padding, baseline, size);
    baseline += lineHeight;
  }

  return {
    drawnLines: draw.length,
    remainingText: rest.join('\n'),
  };
}
