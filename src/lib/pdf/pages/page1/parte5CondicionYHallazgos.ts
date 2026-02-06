import { rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import { defaultTheme } from '@/lib/pdf/core/pdfContext';

type Mode = 'both' | 'condicionOnly' | 'pruebasOnly';

type Args = {
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  x0: number;
  w: number;
  top: number;

  condicionText: string;
  pruebasText: string;

  mode?: Mode;
};

type Result = {
  nextTop: number;
  overflowText?: string;
  overflowMode?: Mode;
};

const BOTTOM_MARGIN = 18;

// Tamaños (como lo vienes usando)
const FONT_SIZE = 8.4;
const LINE_H = 10.2;

// padding interno como Word
const PAD_X = 6;
const PAD_Y = 6;

type RGB = ReturnType<typeof rgb>;

// ✅ Fondo por fila
const COND_BG: RGB = rgb(1, 1, 1); // blanco
const PRUEBAS_BG: RGB = rgb(0.9, 0.95, 1); // azul clarito (ajusta si tu plantilla usa otro)

function yFromTop(page: PDFPage, top: number, h: number) {
  const pageH = page.getSize().height;
  return pageH - top - h;
}

// ✅ Relleno SIN bordes
function fillRect(page: PDFPage, x: number, top: number, w: number, h: number, color: RGB) {
  page.drawRectangle({
    x,
    y: yFromTop(page, top, h),
    width: w,
    height: h,
    color,
  });
}

// ✅ Caja SOLO con borde (no pinta fondo)
function drawBox(page: PDFPage, x: number, top: number, w: number, h: number) {
  page.drawRectangle({
    x,
    y: yFromTop(page, top, h),
    width: w,
    height: h,
    borderColor: defaultTheme.border ?? rgb(0, 0, 0),
    borderWidth: 1,
  });
}

function drawHLine(page: PDFPage, x: number, yTop: number, w: number) {
  const pageH = page.getSize().height;
  const y = pageH - yTop;
  page.drawLine({
    start: { x, y },
    end: { x: x + w, y },
    thickness: 1,
    color: defaultTheme.border ?? rgb(0, 0, 0),
  });
}

type Run = { text: string; font: PDFFont };
type Token = { text: string; font: PDFFont; fromValue: boolean; isBreak?: boolean };

function tokenizeWords(text: string) {
  return String(text ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

// Value -> tokens con saltos de línea conservados como token especial
function valueToTokens(value: string) {
  const out: string[] = [];
  const parts = String(value ?? '').replace(/\r\n/g, '\n').split('\n');

  for (let i = 0; i < parts.length; i++) {
    const p = parts[i].trim();
    if (p) out.push(...tokenizeWords(p));
    if (i < parts.length - 1) out.push('\n');
  }
  return out;
}

function tokensToText(tokens: string[]) {
  let res = '';
  let lastWasBreak = true;

  for (const t of tokens) {
    if (t === '\n') {
      res = res.trimEnd();
      res += '\n';
      lastWasBreak = true;
      continue;
    }
    if (!res || lastWasBreak) {
      res += t;
    } else {
      res += ` ${t}`;
    }
    lastWasBreak = false;
  }
  return res.trim();
}

// Envuelve tokens a líneas (con runs para soportar negrita sólo en el label)
function wrapTokensToLines(opts: {
  labelTokens: string[];
  valueTokens: string[];
  bold: PDFFont;
  font: PDFFont;
  size: number;
  maxW: number;
  maxLines: number;
  includeLabel: boolean;
}) {
  const { labelTokens, valueTokens, bold, font, size, maxW, maxLines, includeLabel } = opts;

  const stream: Token[] = [];

  if (includeLabel) {
    for (const w of labelTokens) {
      stream.push({ text: w, font: bold, fromValue: false });
    }
  }

  for (const t of valueTokens) {
    if (t === '\n') stream.push({ text: '', font, fromValue: true, isBreak: true });
    else stream.push({ text: t, font, fromValue: true });
  }

  const lines: Run[][] = [];
  let line: Run[] = [];
  let lineWidth = 0;

  let valueCursor = 0;

  const pushLine = () => {
    lines.push(line);
    line = [];
    lineWidth = 0;
  };

  const addToLine = (token: Token, withLeadingSpace: boolean) => {
    const chunk = withLeadingSpace ? ` ${token.text}` : token.text;

    if (!line.length) {
      line.push({ text: chunk, font: token.font });
    } else {
      const last = line[line.length - 1];
      if (last.font === token.font) last.text += chunk;
      else line.push({ text: chunk, font: token.font });
    }

    lineWidth += token.font.widthOfTextAtSize(chunk, size);

    if (token.fromValue) valueCursor++;
  };

  for (let i = 0; i < stream.length; i++) {
    const t = stream[i];

    // break explícito (\n)
    if (t.isBreak) {
      if (lines.length >= maxLines) break;
      if (line.length) pushLine();
      lines.push([]); // línea vacía
      if (lines.length >= maxLines) {
        valueCursor++;
        break;
      }
      valueCursor++;
      continue;
    }

    const hasText = line.some((r) => r.text.trim().length > 0);
    const candidate = (hasText ? ' ' : '') + t.text;
    const candW = t.font.widthOfTextAtSize(candidate, size);

    if (!hasText || lineWidth + candW <= maxW) {
      addToLine(t, hasText);
      continue;
    }

    if (lines.length + 1 >= maxLines) break;

    pushLine();
    addToLine(t, false);
  }

  if (line.length && lines.length < maxLines) pushLine();

  const remaining = valueTokens.slice(valueCursor);
  const overflowText = tokensToText(remaining);

  return { lines, overflowText };
}

function drawRunsLines(opts: {
  page: PDFPage;
  lines: Run[][];
  x: number;
  top: number;
  size: number;
  lineH: number;
}) {
  const { page, lines, x, top, size, lineH } = opts;

  const pageH = page.getSize().height;
  let y = pageH - top - PAD_Y - size;

  for (const ln of lines) {
    if (!ln.length) {
      y -= lineH;
      continue;
    }

    let cx = x + PAD_X;
    for (const run of ln) {
      if (!run.text) continue;
      page.drawText(run.text, {
        x: cx,
        y,
        size,
        font: run.font,
        color: rgb(0, 0, 0),
      });
      cx += run.font.widthOfTextAtSize(run.text, size);
    }
    y -= lineH;
  }
}

function renderRowSingleCell(opts: {
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  label: string;
  value: string;
  x: number;
  top: number;
  w: number;
  h: number;
  includeLabel: boolean;
}) {
  const { page, font, bold, label, value, x, top, w, h, includeLabel } = opts;

  const maxW = Math.max(10, w - PAD_X * 2);
  const maxLines = Math.max(1, Math.floor((h - PAD_Y * 2) / LINE_H));

  const labelTokens = includeLabel ? tokenizeWords(String(label ?? '').trim()) : [];
  const valueTokens = valueToTokens(value ?? '');

  const { lines, overflowText } = wrapTokensToLines({
    labelTokens,
    valueTokens,
    bold,
    font,
    size: FONT_SIZE,
    maxW,
    maxLines,
    includeLabel,
  });

  drawRunsLines({
    page,
    lines,
    x,
    top,
    size: FONT_SIZE,
    lineH: LINE_H,
  });

  return overflowText;
}

export function renderPage1Parte5CondicionYHallazgos(args: Args): Result {
  const { page, font, bold, x0, w, top } = args;

  const mode: Mode = args.mode ?? 'both';

  const pageH = page.getSize().height;
  const availableH = Math.max(60, pageH - BOTTOM_MARGIN - top);

  const condicionLabel = 'Condición de salud (signos y síntomas):';
  const pruebasLabel = 'Prueba o exámenes para clínicas (descripción de hallazgos positivos):';

  // =========================
  // MODO: ambas filas (como Word)
  // =========================
  if (mode === 'both') {
    const row2Min = 60;

    let row1H = 44;
    if (availableH - row1H < row2Min) {
      row1H = Math.max(24, availableH - row2Min);
    }
    const row2H = availableH - row1H;

    // ✅ Fondo: Condición blanco, Pruebas azul claro
    fillRect(page, x0, top, w, row1H, COND_BG);
    fillRect(page, x0, top + row1H, w, row2H, PRUEBAS_BG);

    // ✅ borde + separador por encima del fondo
    drawBox(page, x0, top, w, row1H + row2H);
    drawHLine(page, x0, top + row1H, w);

    const condOverflow = renderRowSingleCell({
      page,
      font,
      bold,
      label: condicionLabel,
      value: args.condicionText || '',
      x: x0,
      top,
      w,
      h: row1H,
      includeLabel: true,
    });

    if (condOverflow) {
      return {
        nextTop: top + row1H + row2H,
        overflowText: condOverflow,
        overflowMode: 'condicionOnly',
      };
    }

    const pruebasOverflow = renderRowSingleCell({
      page,
      font,
      bold,
      label: pruebasLabel,
      value: args.pruebasText || '',
      x: x0,
      top: top + row1H,
      w,
      h: row2H,
      includeLabel: true,
    });

    return {
      nextTop: top + row1H + row2H,
      overflowText: pruebasOverflow || '',
      overflowMode: pruebasOverflow ? 'pruebasOnly' : undefined,
    };
  }

  // =========================
  // CONTINUACIÓN multipágina
  // =========================
  const bg = mode === 'condicionOnly' ? COND_BG : PRUEBAS_BG;

  fillRect(page, x0, top, w, availableH, bg);
  drawBox(page, x0, top, w, availableH);

  const isCond = mode === 'condicionOnly';
  const value = isCond ? args.condicionText : args.pruebasText;

  const overflow = renderRowSingleCell({
    page,
    font,
    bold,
    label: '',
    value: value || '',
    x: x0,
    top,
    w,
    h: availableH,
    includeLabel: false,
  });

  return {
    nextTop: top + availableH,
    overflowText: overflow || '',
    overflowMode: overflow ? mode : undefined,
  };
}