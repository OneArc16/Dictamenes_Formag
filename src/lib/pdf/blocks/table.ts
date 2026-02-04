import type { PDFPage, PDFFont } from 'pdf-lib';
import type { Color, PdfTheme } from '@/lib/pdf/core/pdfContext';
import { drawRect, drawTextBaseline, drawTextInCell } from '@/lib/pdf/core/pdfContext';

export type CellAlign = 'left' | 'center';
export type CellValign = 'top' | 'middle';

export type TableCell = {
  w: number;
  h?: number;

  fill?: Color;
  border?: Color;

  // Texto simple
  text?: string;

  // Texto compuesto: label (bold) + value (normal)
  label?: string;
  value?: string;

  // fuentes (opcionales por celda)
  font?: PDFFont; // normal
  bold?: PDFFont; // bold (para label)

  // tamaños
  size?: number; // para text simple
  minSize?: number;

  // label/value sizes (si no vienen, usamos defaults)
  labelSize?: number; // ✅ default 12
  valueSize?: number; // ✅ default 10
  minValueSize?: number; // ✅ default 7

  // layout texto
  padding?: number;
  lineHeight?: number;
  align?: CellAlign;
  valign?: CellValign;
  gap?: number; // separación label/value
};

function fitValue(font: PDFFont, value: string, size: number, maxW: number) {
  if (font.widthOfTextAtSize(value, size) <= maxW) return value;

  let txt = value;
  while (txt.length > 1 && font.widthOfTextAtSize(txt + '…', size) > maxW) {
    txt = txt.slice(0, -1);
  }
  return txt + '…';
}

/**
 * Dibuja label (bold) + value (normal) en una sola línea,
 * centrado verticalmente en la celda, con shrink + ellipsis del value.
 *
 * ✅ NO usa drawTextBaseline para evitar líneas guía/artefactos.
 */
function drawInlineLabelValue(params: {
  page: PDFPage;
  x: number;
  topY: number;
  w: number;
  h: number;

  label: string;
  value: string;

  labelFont: PDFFont;
  valueFont: PDFFont;

  labelSize: number;
  valueSize: number;
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
    labelFont,
    valueFont,
    labelSize,
    valueSize,
    minValueSize,
    padding,
    gap,
  } = params;

  const { height } = page.getSize();

  const labelText = (label ?? '').trim();
  const valueRaw = (value ?? '').trim();

  // baseline top (coords "desde arriba")
  const baseSize = Math.max(labelSize, valueSize);
  const baselineTop = topY + (h - baseSize) / 2 + baseSize - 1;
  const yPdf = height - baselineTop;

  // label
  page.drawText(labelText, {
    x: x + padding,
    y: yPdf,
    size: labelSize,
    font: labelFont,
  });

  const labelW = labelFont.widthOfTextAtSize(labelText, labelSize);
  const valueX = x + padding + labelW + gap;
  const maxValueW = Math.max(0, x + w - padding - valueX);

  // shrink value
  let vs = valueSize;
  while (vs >= minValueSize && valueFont.widthOfTextAtSize(valueRaw, vs) > maxValueW) {
    vs -= 0.25;
  }

  const valueText = fitValue(valueFont, valueRaw, vs, maxValueW);

  page.drawText(valueText, {
    x: valueX,
    y: yPdf,
    size: vs,
    font: valueFont,
  });
}

export function drawTableRow(params: {
  page: PDFPage;
  x: number;
  topY: number;
  h: number;
  theme: PdfTheme;

  // ✅ defaults de fila (para no tener que pasar font/bold en cada celda)
  font?: PDFFont;
  bold?: PDFFont;

  cells: TableCell[];
}) {
  const { page, x, topY, h, theme, cells, font: rowFont, bold: rowBold } = params;

  let cursorX = x;

  for (const cell of cells) {
    const w = cell.w;
    const cellH = cell.h ?? h;

    drawRect(page, cursorX, topY, w, cellH, cell.fill, cell.border ?? theme.border);

    const padding = cell.padding ?? 4;

    // ✅ Caso label + value (inline)
    if (cell.label != null) {
      const labelFont = cell.bold ?? rowBold;
      const valueFont = cell.font ?? rowFont;

      if (!labelFont || !valueFont) {
        throw new Error('TableCell con label/value requiere font/bold (en celda o en drawTableRow)');
      }

      drawInlineLabelValue({
        page,
        x: cursorX,
        topY,
        w,
        h: cellH,
        label: cell.label ?? '',
        value: cell.value ?? '',
        labelFont,
        valueFont,
        labelSize: cell.labelSize ?? 12, // ✅ lo que pediste
        valueSize: cell.valueSize ?? 10,
        minValueSize: cell.minValueSize ?? 7,
        padding,
        gap: cell.gap ?? 4,
      });

      cursorX += w;
      continue;
    }

    // Texto simple
    const text = (cell.text ?? '').trim();
    if (text) {
      const useFont = cell.font ?? rowFont;
      if (!useFont) {
        throw new Error('TableCell con text requiere font (en celda o en drawTableRow)');
      }

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
          lineHeight: cell.lineHeight ?? 11,
          align: cell.align ?? 'left',
          valign: cell.valign ?? 'middle',
        });
      } else {
        // aquí sí mantenemos drawTextBaseline (tu texto simple corto)
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
