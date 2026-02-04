import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';

type Color = ReturnType<typeof rgb>;

export class PdfFlow {
  doc: PDFDocument;
  font: PDFFont;
  bold: PDFFont;

  page: PDFPage;
  width: number;
  height: number;

  marginX = 36;
  marginTop = 28;
  marginBottom = 28;

  cursorY: number;

  // Estilos
  textColor: Color = rgb(0, 0, 0);
  lineColor: Color = rgb(0.7, 0.7, 0.7);
  headerBlue: Color = rgb(0.76, 0.86, 0.94);
  sectionPeach: Color = rgb(0.96, 0.88, 0.83);

  static async create() {
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);

    const flow = new PdfFlow(doc, font, bold);
    flow.addPage();
    return flow;
  }

  private constructor(doc: PDFDocument, font: PDFFont, bold: PDFFont) {
    this.doc = doc;
    this.font = font;
    this.bold = bold;
    // placeholders hasta addPage()
    // @ts-ignore
    this.page = null;
    this.width = 612;
    this.height = 792;
    this.cursorY = this.height - this.marginTop;
  }

  addPage() {
    this.page = this.doc.addPage([612, 792]); // Letter
    const { width, height } = this.page.getSize();
    this.width = width;
    this.height = height;
    this.cursorY = height - this.marginTop;
  }

  ensureSpace(heightNeeded: number) {
    if (this.cursorY - heightNeeded < this.marginBottom) {
      this.addPage();
    }
  }

  line(y?: number) {
    const yy = y ?? this.cursorY;
    this.page.drawLine({
      start: { x: this.marginX, y: yy },
      end: { x: this.width - this.marginX, y: yy },
      thickness: 1,
      color: this.lineColor,
    });
  }

  rect(x: number, y: number, w: number, h: number, fill?: Color, border = true) {
    this.page.drawRectangle({
      x,
      y,
      width: w,
      height: h,
      color: fill,
      borderColor: border ? this.lineColor : undefined,
      borderWidth: border ? 1 : 0,
    });
  }

  text(text: string, x: number, y: number, size = 9, bold = false) {
    if (!text) return;
    this.page.drawText(text, {
      x,
      y,
      size,
      font: bold ? this.bold : this.font,
      color: this.textColor,
    });
  }

  private wrapLines(text: string, maxWidth: number, size: number) {
    const words = text.replace(/\s+/g, ' ').trim().split(' ');
    const lines: string[] = [];
    let line = '';

    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      const width = this.font.widthOfTextAtSize(test, size);
      if (width <= maxWidth) line = test;
      else {
        if (line) lines.push(line);
        line = w;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  paragraph(label: string, value: string | null | undefined, opts?: { size?: number; gap?: number }) {
    const size = opts?.size ?? 9;
    const gap = opts?.gap ?? 8;

    this.ensureSpace(28);
    this.text(label, this.marginX, this.cursorY, 10, true);
    this.cursorY -= 14;

    const content = (value ?? '').trim();
    if (!content) {
      this.text('—', this.marginX, this.cursorY, size);
      this.cursorY -= gap;
      return;
    }

    const maxWidth = this.width - this.marginX * 2;
    const lines = this.wrapLines(content, maxWidth, size);
    const lineH = 12;

    for (const ln of lines) {
      this.ensureSpace(lineH + 6);
      this.text(ln, this.marginX, this.cursorY, size);
      this.cursorY -= lineH;
    }
    this.cursorY -= gap;
  }

  sectionTitle(title: string) {
    this.ensureSpace(26);
    const h = 20;
    const y = this.cursorY - h;
    this.rect(this.marginX, y, this.width - this.marginX * 2, h, this.sectionPeach, true);
    this.text(title, this.marginX + 8, y + 6, 10, true);
    this.cursorY = y - 10;
  }

  bandTitle(title: string) {
    this.ensureSpace(30);
    const h = 22;
    const y = this.cursorY - h;
    this.rect(this.marginX, y, this.width - this.marginX * 2, h, this.headerBlue, true);
    this.text(title, this.marginX + 8, y + 7, 11, true);
    this.cursorY = y - 10;
  }

  kvGrid(items: Array<{ k: string; v: string }>, cols = 2) {
    const maxWidth = this.width - this.marginX * 2;
    const colW = maxWidth / cols;
    const rowH = 18;

    for (let i = 0; i < items.length; i += cols) {
      this.ensureSpace(rowH + 6);

      const y = this.cursorY - rowH;
      for (let c = 0; c < cols; c++) {
        const it = items[i + c];
        if (!it) continue;

        const x = this.marginX + c * colW;
        this.rect(x, y, colW, rowH, undefined, true);
        this.text(`${it.k}:`, x + 6, y + 5, 8, true);
        this.text(it.v || '—', x + 70, y + 5, 8, false);
      }

      this.cursorY = y - 6;
    }
  }

  checkboxRow(labelA: string, checkedA: boolean, labelB: string, checkedB: boolean) {
    this.ensureSpace(18);
    const x = this.marginX;
    const y = this.cursorY - 14;

    const box = (xx: number, yy: number, checked: boolean) => {
      this.rect(xx, yy, 10, 10, undefined, true);
      if (checked) this.text('X', xx + 2.2, yy + 1.5, 10, true);
    };

    box(x, y, checkedA);
    this.text(labelA, x + 14, y + 2, 9);
    const x2 = x + 220;
    box(x2, y, checkedB);
    this.text(labelB, x2 + 14, y + 2, 9);

    this.cursorY = y - 8;
  }

  async save() {
    return this.doc.save();
  }
}
