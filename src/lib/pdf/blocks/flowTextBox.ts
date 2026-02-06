import type { PDFPage, PDFFont } from 'pdf-lib';
import type { Color, PdfTheme } from '@/lib/pdf/core/pdfContext';
import { drawRect, drawTextBaseline } from '@/lib/pdf/core/pdfContext';

function normalizeText(t: string) {
  return (t ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function breakLongWord(font: PDFFont, word: string, size: number, maxW: number) {
  // rompe palabra muy larga para que quepa
  let out: string[] = [];
  let cur = '';
  for (const ch of word) {
    const next = cur + ch;
    if (font.widthOfTextAtSize(next, size) <= maxW || cur.length === 0) {
      cur = next;
    } else {
      out.push(cur);
      cur = ch;
    }
  }
  if (cur) out.push(cur);
  return out;
}

function wrapToLines(font: PDFFont, text: string, size: number, maxW: number) {
  const t = normalizeText(text);
  const paragraphs = t.split('\n');

  const lines: string[] = [];

  for (const p of paragraphs) {
    const raw = (p ?? '').trim();

    // línea vacía preservada
    if (!raw) {
      lines.push('');
      continue;
    }

    const words = raw.split(/\s+/).filter(Boolean);

    let line = '';
    for (const w of words) {
      const candidate = line ? `${line} ${w}` : w;

      if (font.widthOfTextAtSize(candidate, size) <= maxW) {
        line = candidate;
        continue;
      }

      // si no cabe y no hay nada, romper palabra
      if (!line) {
        const parts = breakLongWord(font, w, size, maxW);
        lines.push(...parts.slice(0, -1));
        line = parts[parts.length - 1] ?? '';
        continue;
      }

      // empuja la línea actual y empieza nueva
      lines.push(line);

      // si palabra sola es muy larga -> romper
      if (font.widthOfTextAtSize(w, size) > maxW) {
        const parts = breakLongWord(font, w, size, maxW);
        lines.push(...parts.slice(0, -1));
        line = parts[parts.length - 1] ?? '';
      } else {
        line = w;
      }
    }

    if (line) lines.push(line);
  }

  return lines;
}

export function drawFlowTextBox(params: {
  page: PDFPage;
  x: number;
  topY: number;
  w: number;
  h: number;

  theme: PdfTheme;
  fill?: Color;
  border?: Color;

  font: PDFFont;
  text: string;

  size?: number;
  minSize?: number; // baja tamaño si no cabe en altura
  lineHeight?: number;
  padding?: number;
}) {
  const {
    page,
    x,
    topY,
    w,
    h,
    theme,
    fill,
    border,
    font,
    text,
  } = params;

  const padding = params.padding ?? 8;
  const baseSize = params.size ?? 10;
  const minSize = params.minSize ?? 8;
  const lineHeightBase = params.lineHeight ?? 12;

  drawRect(page, x, topY, w, h, fill, border ?? theme.border);

  const innerW = Math.max(0, w - padding * 2);
  const innerH = Math.max(0, h - padding * 2);

  if (!text?.trim() || innerW <= 0 || innerH <= 0) {
    return { overflowText: '' };
  }

  // 1) intenta con size base, si no cabe en altura, reduce size (sin romper layout)
  let size = baseSize;
  let lineHeight = lineHeightBase;

  // (mantén proporción)
  const tryFit = () => {
    const lines = wrapToLines(font, text, size, innerW);
    const maxLines = Math.floor(innerH / lineHeight);
    return { lines, maxLines };
  };

  let { lines, maxLines } = tryFit();
  while (size > minSize && lines.length > maxLines) {
    size -= 0.5;
    lineHeight = Math.max(size + 2, lineHeight - 0.5);
    ({ lines, maxLines } = tryFit());
  }

  // 2) pinta lo que cabe y devuelve overflow
  const fitLines = lines.slice(0, maxLines);
  const overflowLines = lines.slice(maxLines);

  let baselineTop = topY + padding + size; // baseline en coords "top"
  for (const ln of fitLines) {
    drawTextBaseline(page, font, ln, x + padding, baselineTop, size);
    baselineTop += lineHeight;
  }

  return { overflowText: overflowLines.join('\n') };
}
