import { PDFDocument, StandardFonts, rgb, type PDFPage } from 'pdf-lib';

import { defaultTheme, drawOuterBorder, drawRect } from '@/lib/pdf/core/pdfContext';
import { tryEmbedLogo } from '@/lib/pdf/blocks/assets';
import { renderHeader } from '@/lib/pdf/blocks/header';

import { renderPage1Parte1 } from '@/lib/pdf/pages/page1/page1';
import { renderPage1Parte3Antecedentes } from '@/lib/pdf/pages/page1/parte3Antecedentes';
import { renderPage1Parte4Diagnosticos } from '@/lib/pdf/pages/page1/parte4Diagnosticos';

// ✅ NUEVO
import { renderPage1Parte5CondicionYHallazgos } from '@/lib/pdf/pages/page1/parte5CondicionYHallazgos';

const PAGE_SIZE: [number, number] = [612, 792];

const TOP_MARGIN = 18;
const HEADER_H = 78;
const AFTER_HEADER_TOP = TOP_MARGIN + HEADER_H; // solo página 1 (con encabezado)

// Cubre una línea horizontal (sin tocar bordes laterales)
function coverLineWhite(page: PDFPage, x0: number, w: number, yTop: number) {
  drawRect(page, x0 + 1, yTop - 1.8, w - 2, 3.6, rgb(1, 1, 1), rgb(1, 1, 1));
}

// Cubre SOLO el borde superior de la tabla (dentro del header azul)
function coverTableTopBorder(page: PDFPage, x0: number, w: number, yTop: number) {
  drawRect(page, x0 + 1, yTop, w - 2, 2.6, defaultTheme.blue, defaultTheme.blue);
}

export async function generateDictamenPdfDynamic(args: { dictamen: any; debug?: boolean }) {
  const { dictamen } = args;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const logo = await tryEmbedLogo(pdfDoc);

  const x0 = 18;
  const w = PAGE_SIZE[0] - 36;

  const makePage = (withHeader: boolean) => {
    const p = pdfDoc.addPage(PAGE_SIZE);
    drawOuterBorder(p, defaultTheme);
    if (withHeader) {
      renderHeader({ page: p, font, bold, logo, theme: defaultTheme });
    }
    return p;
  };

  // =========================
  // Página 1 (CON encabezado)
  // =========================
  let page = makePage(true);

  const r1 = (renderPage1Parte1({ page, font, bold, dictamen }) as any) ?? {};
  let currentTop = Number.isFinite(r1?.nextTop) ? r1.nextTop : AFTER_HEADER_TOP;

  // =========================
  // Parte 3: Antecedentes
  // =========================
  const antecedentesText = String(dictamen?.antecedentesClinicos ?? '').trim();

  const r3 = (renderPage1Parte3Antecedentes({
    page,
    font,
    bold,
    x0,
    w,
    top: currentTop,
    text: antecedentesText,
    showTitle: true,
  }) as any) ?? {};

  currentTop = Number.isFinite(r3?.nextTop) ? r3.nextTop : currentTop;
  let overflowText: string = String(r3?.overflowText ?? '');

  while (overflowText && overflowText.trim()) {
    page = makePage(false); // ✅ SIN encabezado
    const rr = (renderPage1Parte3Antecedentes({
      page,
      font,
      bold,
      x0,
      w,
      top: TOP_MARGIN,
      text: overflowText,
      showTitle: false,
    }) as any) ?? {};

    currentTop = Number.isFinite(rr?.nextTop) ? rr.nextTop : TOP_MARGIN;
    overflowText = String(rr?.overflowText ?? '');
  }

  // =========================
  // Parte 4: Diagnósticos
  // =========================
  let dxItems: any[] = Array.isArray(dictamen?.diagnosticos) ? dictamen.diagnosticos : [];
  let dxTop = currentTop + 6;

  if (dxTop > TOP_MARGIN + 4) {
    coverLineWhite(page, x0, w, currentTop);
  }

  while (dxItems.length) {
    const prevLen = dxItems.length;

    const rdx = (renderPage1Parte4Diagnosticos({
      page,
      font,
      bold,
      dictamen,
      x0,
      w,
      top: dxTop,
      items: dxItems,
    }) as any) ?? {};

    const overflowItems = Array.isArray(rdx?.overflowItems) ? rdx.overflowItems : [];
    const nextDxTop = Number.isFinite(rdx?.nextTop) ? rdx.nextTop : dxTop;

    const paintedSomething = nextDxTop !== dxTop || overflowItems.length !== prevLen;

    if (paintedSomething && dxTop > TOP_MARGIN + 4) {
      coverTableTopBorder(page, x0, w, dxTop);
    }

    if (overflowItems.length === prevLen && nextDxTop === dxTop) {
      page = makePage(false);
      dxTop = TOP_MARGIN;
      continue;
    }

    dxItems = overflowItems;
    dxTop = nextDxTop;

    if (dxItems.length) {
      page = makePage(false);
      dxTop = TOP_MARGIN;
    }
  }

  // ✅ al terminar dx, este es el top para lo siguiente
  currentTop = dxTop;

  // =========================
  // Parte 5: Condición + Pruebas (igual a plantilla)
  // =========================
  const condicionText = String(
    dictamen?.condicionSalud ??
      dictamen?.condicionSaludSignosSintomas ??
      dictamen?.condicionSaludTexto ??
      ''
  ).trim();

  const pruebasText = String(
    dictamen?.pruebasClinicas ??
      dictamen?.pruebasExamenes ??
      dictamen?.descripcionHallazgos ??
      ''
  ).trim();

  // ✅ evita “doble línea” entre diagnósticos y este bloque (dejamos la del nuevo bloque)
  if (currentTop > TOP_MARGIN + 2) {
    coverLineWhite(page, x0, w, currentTop);
  }

  let r5 = renderPage1Parte5CondicionYHallazgos({
    page,
    font,
    bold,
    x0,
    w,
    top: currentTop,
    condicionText,
    pruebasText,
    mode: 'both',
  });

  let overflowMode = r5.overflowMode;
  let overflow = String(r5.overflowText ?? '');

  while (overflow && overflow.trim()) {
    page = makePage(false);

    r5 = renderPage1Parte5CondicionYHallazgos({
      page,
      font,
      bold,
      x0,
      w,
      top: TOP_MARGIN,
      condicionText: overflowMode === 'condicionOnly' ? overflow : '',
      pruebasText: overflowMode === 'pruebasOnly' ? overflow : '',
      mode: overflowMode ?? 'pruebasOnly',
    });

    overflowMode = r5.overflowMode;
    overflow = String(r5.overflowText ?? '');
  }

  return pdfDoc.save();
}