import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

type HeaderData = {
  logoSrc?: string | null;
  numeroDictamen?: string | null;
  fechaDictamen?: string | Date | null;
  skipPages?: number;
};

const PT_PER_CM = 28.3464567;
const LEFT = 2.5 * PT_PER_CM;
const RIGHT = 2 * PT_PER_CM;
const WIDTH = 612 - LEFT - RIGHT;
const HEIGHT = 81;
const LABEL_WIDTH = WIDTH * (1.2 / 2.2);
const RASTER_SCALE = 4;

function formatDateDMY(value?: string | Date | null) {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return `${String(date.getUTCDate()).padStart(2, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${date.getUTCFullYear()}`;
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  }[character] ?? character));
}

async function createHeaderImage(data: HeaderData) {
  const numero = escapeXml(data.numeroDictamen?.trim() || '—');
  const fecha = escapeXml(formatDateDMY(data.fechaDictamen));
  const logo = data.logoSrc
    ? `<image href="${data.logoSrc}" x="9" y="6" width="102" height="31" preserveAspectRatio="xMidYMid meet" />`
    : '';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH * RASTER_SCALE}" height="${HEIGHT * RASTER_SCALE}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#fff" stroke="#000" stroke-width="0.85" />
      <line x1="120" y1="0" x2="120" y2="43" stroke="#000" stroke-width="0.85" />
      <rect x="0" y="43" width="${WIDTH}" height="12" fill="#9BC2E6" stroke="#000" stroke-width="0.85" />
      <rect x="0" y="55" width="${WIDTH}" height="13" fill="#9BC2E6" stroke="#000" stroke-width="0.85" />
      <rect x="0" y="68" width="${WIDTH}" height="13" fill="#9BC2E6" stroke="#000" stroke-width="0.85" />
      <line x1="${LABEL_WIDTH}" y1="55" x2="${LABEL_WIDTH}" y2="81" stroke="#000" stroke-width="0.85" />
      ${logo}
      <g font-family="Helvetica, Arial, sans-serif" fill="#000" text-anchor="middle" font-weight="700">
        <text x="302" y="13" font-size="7.2">FORMATO PARA EL DICTAMEN MEDICO LABORAL DE LA PERDIDA DE CAPACIDAD LABORAL O</text>
        <text x="302" y="22" font-size="7.2">DEL ESTADO DE INVALIDEZ PARA LOS EDUCADORES AFILIADOS AL FONDO DE PRESTACIONES</text>
        <text x="302" y="31" font-size="7.2">SOCIALES DEL MAGISTERIO</text>
        <text x="${WIDTH / 2}" y="52" font-size="8.5">FORMULARIO DE DICTAMEN</text>
      </g>
      <g font-family="Helvetica, Arial, sans-serif" fill="#000" font-size="8.2">
        <text x="6" y="64" font-weight="700">DICTAMEN NUMERO:</text>
        <text x="${LABEL_WIDTH + 6}" y="64">${numero}</text>
        <text x="6" y="77" font-weight="700">FECHA DEL DICTAMEN</text>
        <text x="${LABEL_WIDTH + 6}" y="77">${fecha}</text>
      </g>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function createPageOverlayImage(data: HeaderData, pageLabel: string) {
  const header = await createHeaderImage(data);
  const headerDataUrl = `data:image/png;base64,${header.toString('base64')}`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${612 * RASTER_SCALE}" height="${792 * RASTER_SCALE}" viewBox="0 0 612 792">
      <image href="${headerDataUrl}" x="${LEFT}" y="0" width="${WIDTH}" height="${HEIGHT}" />
      <text x="${612 - RIGHT}" y="763.65" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#444">${escapeXml(pageLabel)}</text>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * React-PDF fragments a composed fixed header on some forced table breaks.
 * A single high-resolution page image avoids the fragmented vector state that
 * React-PDF can leave after a continued table.
 */
export async function stampDictamenPdfHeader(pdfBytes: Uint8Array, data: HeaderData) {
  const pdf = await PDFDocument.load(pdfBytes);
  const skip = data.skipPages ?? 0;
  const pages = pdf.getPages();
  const totalFormPages = pages.length - skip;

  for (const [index, page] of pages.entries()) {
    if (index < skip) continue;
    const { width, height } = page.getSize();
    const overlay = await pdf.embedPng(await createPageOverlayImage(data, `Página ${index - skip + 1} de ${totalFormPages}`));
    const appearance = pdf.context.flateStream(
      `q\n${width} 0 0 ${height} 0 0 cm\n/Overlay Do\nQ`,
      {
        Type: 'XObject',
        Subtype: 'Form',
        FormType: 1,
        BBox: [0, 0, width, height],
        Resources: { XObject: { Overlay: overlay.ref } },
      },
    );
    const appearanceRef = pdf.context.register(appearance);
    const annotation = pdf.context.obj({
      Type: 'Annot',
      Subtype: 'Stamp',
      Rect: [0, 0, width, height],
      F: 4,
      Border: [0, 0, 0],
      Name: 'Draft',
      AP: { N: appearanceRef },
    });
    page.node.addAnnot(pdf.context.register(annotation));
  }

  return pdf.save({ updateFieldAppearances: false });
}
