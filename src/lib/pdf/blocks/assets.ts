import path from 'path';
import { promises as fs } from 'fs';
import { PDFDocument } from 'pdf-lib';

export async function tryEmbedLogo(pdfDoc: PDFDocument) {
  const candidates = [
    path.join(process.cwd(), 'public', 'assets', 'logo-sism.png'),
    path.join(process.cwd(), 'public', 'logo-sism.png'),
    path.join(process.cwd(), 'public', 'assets', 'logo-sism.jpg'    ),
    path.join(process.cwd(), 'public', 'logo-sism.jpg'),
  ];

  for (const p of candidates) {
    try {
      const bytes = await fs.readFile(p);
      try {
        return await pdfDoc.embedPng(bytes);
      } catch {
        return await pdfDoc.embedJpg(bytes);
      }
    } catch {}
  }
  return null;
}
