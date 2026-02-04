import { PDFDocument, StandardFonts } from 'pdf-lib';

import { defaultTheme, drawOuterBorder } from '@/lib/pdf/core/pdfContext';
import { tryEmbedLogo } from '@/lib/pdf/blocks/assets';
import { renderHeader } from '@/lib/pdf/blocks/header';
import { renderPage1Parte1 } from '@/lib/pdf/pages/page1';

export async function generateDictamenPdfDynamic(args: { dictamen: any; debug?: boolean }) {
  const { dictamen } = args;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const logo = await tryEmbedLogo(pdfDoc);

  const page1 = pdfDoc.addPage([612, 792]);
  drawOuterBorder(page1, defaultTheme);
  renderHeader({ page: page1, font, bold, logo, theme: defaultTheme });

  renderPage1Parte1({ page: page1, font, bold, dictamen });

  return pdfDoc.save();
}
