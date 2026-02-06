import type { PDFPage, PDFFont } from 'pdf-lib';
import { defaultTheme, drawRect, drawTextInCell } from '@/lib/pdf/core/pdfContext';

type DxItem = {
  cie10Codigo?: string | null;
  cie10?: { codigo?: string | null; nombre?: string | null } | null;
  cie10Label?: string | null; // por si lo traes en el DTO
};

function getDxCodigo(d: any): string {
  return String(d?.cie10Codigo ?? d?.cie10?.codigo ?? '').trim();
}

function getDxNombre(d: any): string {
  return String(d?.cie10Label ?? d?.cie10?.nombre ?? d?.nombre ?? '').trim();
}

export function renderPage1Parte4Diagnosticos(params: {
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  dictamen: any;

  x0: number;
  w: number;
  top: number;

  /** Si estás continuando en otra página, pásalos desde el generator */
  items?: DxItem[];
}) {
  const { page, font, bold, dictamen, x0, w } = params;
  const theme = defaultTheme;

  let top = params.top;

  const all = (params.items ?? (dictamen?.diagnosticos ?? [])) as DxItem[];
  const items = all.filter((d) => getDxCodigo(d) || getDxNombre(d));

  const pageH = page.getSize().height;
  const bottom = 18;

  // Medidas parecidas al formato
  const headerH = 26;
  const rowH = 20;

  const cCode = 78;
  const cNum = 26;
  const cText = w - cNum - cCode;

  // Si no cabe ni el header + 1 fila, no dibujes nada (el generator crea nueva página)
  const avail = pageH - bottom - top;
  if (avail < headerH + rowH + 2) {
    return { nextTop: top, overflowItems: items };
  }

  // ===== Header row =====
  drawRect(page, x0, top, w - cCode, headerH, theme.blue, theme.border);
  drawRect(page, x0 + (w - cCode), top, cCode, headerH, theme.blue, theme.border);

  drawTextInCell({
    page,
    font: bold,
    text: 'Diagnóstico (s) motivo de calificación:',
    x: x0,
    topY: top,
    w: w - cCode,
    h: headerH,
    size: 10,
    minSize: 9,
    padding: 8,
    align: 'left',
    valign: 'middle',
    lineHeight: 11,
  });

  drawTextInCell({
    page,
    font: bold,
    text: 'Código(s)\nCIE-10',
    x: x0 + (w - cCode),
    topY: top,
    w: cCode,
    h: headerH,
    size: 9,
    minSize: 8,
    padding: 4,
    align: 'center',
    valign: 'middle',
    lineHeight: 10,
  });

  top += headerH;

  // ===== Rows (paginación) =====
  const maxRows = Math.max(0, Math.floor((pageH - bottom - top) / rowH));
  const renderCount = Math.min(items.length, maxRows);

  for (let i = 0; i < renderCount; i++) {
    const d = items[i];
    const n = i + 1;

    // celdas
    drawRect(page, x0, top, cNum, rowH, theme.light, theme.border);
    drawRect(page, x0 + cNum, top, cText, rowH, theme.light, theme.border);
    drawRect(page, x0 + cNum + cText, top, cCode, rowH, theme.light, theme.border);

    // número
    drawTextInCell({
      page,
      font: bold,
      text: `${n}.`,
      x: x0,
      topY: top,
      w: cNum,
      h: rowH,
      size: 10,
      minSize: 9,
      padding: 6,
      align: 'left',
      valign: 'middle',
      lineHeight: 11,
    });

    // diagnóstico
    drawTextInCell({
      page,
      font,
      text: getDxNombre(d),
      x: x0 + cNum,
      topY: top,
      w: cText,
      h: rowH,
      size: 10,
      minSize: 7,
      padding: 6,
      align: 'left',
      valign: 'middle',
      lineHeight: 11,
    });

    // código
    drawTextInCell({
      page,
      font,
      text: getDxCodigo(d),
      x: x0 + cNum + cText,
      topY: top,
      w: cCode,
      h: rowH,
      size: 10,
      minSize: 9,
      padding: 4,
      align: 'center',
      valign: 'middle',
      lineHeight: 11,
    });

    top += rowH;
  }

  const overflowItems = items.slice(renderCount);

  return { nextTop: top, overflowItems };
}
