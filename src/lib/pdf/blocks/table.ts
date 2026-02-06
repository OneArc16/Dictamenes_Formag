import type { PDFPage, PDFFont } from 'pdf-lib';
import type { Color, PdfTheme } from '@/lib/pdf/core/pdfContext';
import { drawRect, drawTextBaseline, drawTextInCell } from '@/lib/pdf/core/pdfContext';

export type CellAlign = 'left' | 'center';
export type CellValign = 'top' | 'middle';

export type LabelLayout = 'inline' | 'stack';

export type TableCell = {
  w: number;
  h?: number;

  fill?: Color;
  border?: Color;

  text?: string;

  label?: string;
  value?: string;

  font?: PDFFont;
  bold?: PDFFont;

  size?: number;
  minSize?: number;

  labelSize?: number;
  valueSize?: number;
  minLabelSize?: number;
  minValueSize?: number;

  layout?: LabelLayout;

  padding?: number;
  lineHeight?: number;
  align?: CellAlign;
  valign?: CellValign;

  gap?: number;
};

function fitText(font: PDFFont, value: string, size: number, maxW: number) {
  if (!value) return '';
  if (font.widthOfTextAtSize(value, size) <= maxW) return value;

  let txt = value;
  while (txt.length > 1 && font.widthOfTextAtSize(txt + '…', size) > maxW) {
    txt = txt.slice(0, -1);
  }
  return txt + '…';
}

function drawInlineLabelValue(params: {
  page: PDFPage;
  x: number;
  topY: number;
  w: number;
  h: number;

  label: string;
  value: string;

  bold: PDFFont;
  font: PDFFont;

  labelSize: number;
  valueSize: number;
  minLabelSize: number;
  minValueSize: number;

  padding: number;
  gap: number;
}) {
  const {
    page,
    x,
    topY,
    w,
    h,
    label,
    value,
    bold,
    font,
    labelSize,
    valueSize,
    minLabelSize,
    minValueSize,
    padding,
    gap,
  } = params;

  const labelRaw = (label ?? '').trim();
  const valueRaw = (value ?? '').trim();

  const innerW = Math.max(0, w - padding * 2);

  // Ajusta label si es demasiado largo
  let ls = labelSize;
  while (ls > minLabelSize && bold.widthOfTextAtSize(labelRaw, ls) > innerW) {
    ls -= 0.25;
  }

  const labelW = bold.widthOfTextAtSize(labelRaw, ls);

  const valueX = x + padding + labelW + gap;
  const maxValueW = Math.max(0, x + w - padding - valueX);

  // Ajusta value si es demasiado largo
  let vs = valueSize;
  while (vs > minValueSize && font.widthOfTextAtSize(valueRaw, vs) > maxValueW) {
    vs -= 0.25;
  }

  const valueTxt = fitText(font, valueRaw, vs, maxValueW);

  const baseline = topY + (h - Math.max(ls, vs)) / 2 + Math.max(ls, vs) - 1;

  drawTextBaseline(page, bold, labelRaw, x + padding, baseline, ls);
  if (valueTxt) drawTextBaseline(page, font, valueTxt, valueX, baseline, vs);
}

/**
 * ✅ STACK BIEN HECHO:
 * - Reserva una banda superior real para el label (1 línea)
 * - Reserva una banda inferior real para el value (1 línea)
 * - Ambos con valign middle para que se vean “bonitos” como plantilla
 */
function drawStackLabelValue(params: {
  page: PDFPage;
  x: number;
  topY: number;
  w: number;
  h: number;

  label: string;
  value: string;

  bold: PDFFont;
  font: PDFFont;

  labelSize: number;
  valueSize: number;
  minLabelSize: number;
  minValueSize: number;

  padding: number;
  lineHeight: number;
  align: CellAlign;
}) {
  const {
    page,
    x,
    topY,
    w,
    h,
    label,
    value,
    bold,
    font,
    labelSize,
    valueSize,
    minLabelSize,
    minValueSize,
    padding,
    lineHeight,
    align,
  } = params;

  // Banda mínima necesaria para que el texto exista
  const minLabelH = Math.max(lineHeight, labelSize + 2);
  const minValueH = Math.max(lineHeight, valueSize + 2);

  // Si la celda es muy bajita, cae a inline (evita cosas raras)
  if (h < minLabelH + minValueH) {
    drawInlineLabelValue({
      page,
      x,
      topY,
      w,
      h,
      label,
      value,
      bold,
      font,
      labelSize,
      valueSize,
      minLabelSize,
      minValueSize,
      padding,
      gap: 3,
    });
    return;
  }

  // ✅ Split “bonito”: ~45% label, ~55% value, pero respetando mínimos
  let labelH = Math.max(minLabelH, Math.floor(h * 0.45));
  let valueH = h - labelH;

  // Asegurar mínimos
  if (valueH < minValueH) {
    const need = minValueH - valueH;
    labelH = Math.max(minLabelH, labelH - need);
    valueH = h - labelH;
  }

  // LABEL (arriba)
  drawTextInCell({
    page,
    font: bold,
    text: (label ?? '').trim(),
    x,
    topY,
    w,
    h: labelH,
    size: labelSize,
    minSize: minLabelSize,
    padding,
    lineHeight,
    align: 'left',
    valign: 'middle',
  });

  // VALUE (abajo)
  drawTextInCell({
    page,
    font,
    text: (value ?? '').trim(),
    x,
    topY: topY + labelH,
    w,
    h: valueH,
    size: valueSize,
    minSize: minValueSize,
    padding,
    lineHeight,
    align,
    valign: 'middle',
  });
}

export function drawTableRow(params: {
  page: PDFPage;
  x: number;
  topY: number;
  h: number;
  theme: PdfTheme;
  cells: TableCell[];
  font?: PDFFont;
  bold?: PDFFont;
}) {
  const { page, x, topY, h, theme, cells } = params;

  let cursorX = x;

  for (const cell of cells) {
    const w = cell.w;
    const cellH = cell.h ?? h;

    drawRect(page, cursorX, topY, w, cellH, cell.fill, cell.border ?? theme.border);

    const padding = cell.padding ?? 4;
    const lineHeight = cell.lineHeight ?? 11;

    // label/value
    if (cell.label != null) {
      const useBold = cell.bold ?? params.bold;
      const useFont = cell.font ?? params.font;
      if (!useBold || !useFont) throw new Error('TableCell label/value requiere font y bold.');

      const base = cell.size ?? 9;
      const labelSize = cell.labelSize ?? base;
      const valueSize = cell.valueSize ?? base;

      const minLabelSize = cell.minLabelSize ?? Math.min(10, labelSize);
      const minValueSize = cell.minValueSize ?? 7;

      const layout: LabelLayout = cell.layout ?? 'inline';

      if (layout === 'stack') {
        drawStackLabelValue({
          page,
          x: cursorX,
          topY,
          w,
          h: cellH,
          label: cell.label ?? '',
          value: cell.value ?? '',
          bold: useBold,
          font: useFont,
          labelSize,
          valueSize,
          minLabelSize,
          minValueSize,
          padding,
          lineHeight,
          align: cell.align ?? 'left',
        });
      } else {
        drawInlineLabelValue({
          page,
          x: cursorX,
          topY,
          w,
          h: cellH,
          label: cell.label ?? '',
          value: cell.value ?? '',
          bold: useBold,
          font: useFont,
          labelSize,
          valueSize,
          minLabelSize,
          minValueSize,
          padding,
          gap: cell.gap ?? 3,
        });
      }

      cursorX += w;
      continue;
    }

    // text simple
    const text = (cell.text ?? '').trim();
    if (text) {
      const useFont = cell.font ?? params.font;
      if (!useFont) throw new Error('TableCell text requiere font.');

      const size = cell.size ?? 9;

      const useWrap = text.includes('\n') || text.length > 18;

      if (useWrap) {
        drawTextInCell({
          page,
          font: useFont,
          text,
          x: cursorX,
          topY,
          w,
          h: cellH,
          size,
          minSize: cell.minSize ?? 7,
          padding,
          lineHeight,
          align: cell.align ?? 'left',
          valign: cell.valign ?? 'middle',
        });
      } else {
        const baseline = topY + (cellH - size) / 2 + size - 1;
        if ((cell.align ?? 'left') === 'center') {
          const tw = useFont.widthOfTextAtSize(text, size);
          drawTextBaseline(page, useFont, text, cursorX + (w - tw) / 2, baseline, size);
        } else {
          drawTextBaseline(page, useFont, text, cursorX + padding, baseline, size);
        }
      }
    }

    cursorX += w;
  }

  return { nextTopY: topY + h };
}
