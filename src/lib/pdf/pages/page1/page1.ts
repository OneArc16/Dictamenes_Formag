import type { PDFFont, PDFPage } from 'pdf-lib';

import { defaultTheme, bandCentered, drawTextInCell, drawRect } from '@/lib/pdf/core/pdfContext';
import { formatDateDMY, up, joinName, sexoToGenero, zonaToLabel } from '@/lib/pdf/core/formatters';
import { drawTableRow } from '@/lib/pdf/blocks/table';

export function renderPage1Parte1(params: { page: PDFPage; font: PDFFont; bold: PDFFont; dictamen: any }) {
  const { page, font, bold, dictamen } = params;

  const { width } = page.getSize();
  const x0 = 18;
  const w = width - 36;

  const theme = defaultTheme;
  const u = dictamen?.usuario;

  let top = 18 + 78;

  // FORMULARIO DE DICTAMEN
  bandCentered(page, bold, theme, x0, top, w, 22, 'FORMULARIO DE DICTAMEN', theme.blue);
  top += 22;

  // Dictamen # (2 celdas)
  {
    const rowH = 18;
    const leftW = w * 0.549126;
    const rightW = w - leftW;

    drawTableRow({
      page,
      x: x0,
      topY: top,
      h: rowH,
      theme,
      cells: [
        { w: leftW, fill: theme.blue, text: 'DICTAMEN NÚMERO:', font: bold, size: 11, align: 'left', padding: 8 },
        { w: rightW, fill: theme.blue, text: String(dictamen?.numeroDictamen ?? dictamen?.id ?? ''), font, size: 10, align: 'left', padding: 8 },
      ],
    });

    top += rowH;
  }

  // Fecha del dictamen (2 celdas)
  {
    const rowH = 18;
    const leftW = w * 0.549126;
    const rightW = w - leftW;

    drawTableRow({
      page,
      x: x0,
      topY: top,
      h: rowH,
      theme,
      cells: [
        { w: leftW, fill: theme.blue, text: 'FECHA DEL DICTAMEN', font: bold, size: 11, align: 'left', padding: 8 },
        { w: rightW, fill: theme.blue, text: formatDateDMY(dictamen?.fechaDictamen), font, size: 10, align: 'left', padding: 8 },
      ],
    });

    top += rowH;
  }

  // Sección 1
  bandCentered(page, bold, theme, x0, top, w, 22, '1. Aspectos Generales del Dictamen', theme.peach);
  top += 22;

  // ✅ Tabla Aspectos Generales (2 filas + cuadrito X para procedimiento)
  {
    const rH = 34;

    // [CIUDAD] [Enfermedad O Accidente] [DECRETO/LEY] [PROCEDIMIENTO A/B] [X]
    const cCity = Math.round(w * 0.17);
    const cEvt = Math.round(w * 0.29);
    const cDec = Math.round(w * 0.30);
    const cProcX = 26;
    const cProc = w - (cCity + cEvt + cDec + cProcX);

    const xCity = x0;
    const xEvt = xCity + cCity;
    const xDec = xEvt + cEvt;
    const xProc = xDec + cDec;
    const xPX = xProc + cProc;

    const ciudad = up(u?.municipio?.nombre);

    const evento =
      dictamen?.tipoEvento === 'ACCIDENTE'
        ? 'ACCIDENTE'
        : dictamen?.tipoEvento === 'ENFERMEDAD'
        ? 'ENFERMEDAD'
        : '';

    const proc = (dictamen?.procedimientoPcl ?? 'A') as 'A' | 'B';

    // Rects fila 1
    drawRect(page, xCity, top, cCity, rH, theme.blue, theme.border);
    drawRect(page, xEvt, top, cEvt, rH, theme.blue, theme.border);
    drawRect(page, xDec, top, cDec, rH, theme.blue, theme.border);
    drawRect(page, xProc, top, cProc, rH, theme.blue, theme.border);
    drawRect(page, xPX, top, cProcX, rH, theme.blue, theme.border);

    // Rects fila 2
    const top2 = top + rH;
    drawRect(page, xCity, top2, cCity, rH, theme.blue, theme.border);
    drawRect(page, xEvt, top2, cEvt, rH, theme.blue, theme.border);
    drawRect(page, xDec, top2, cDec, rH, theme.blue, theme.border);
    drawRect(page, xProc, top2, cProc, rH, theme.blue, theme.border);
    drawRect(page, xPX, top2, cProcX, rH, theme.blue, theme.border);

    // Textos fila 1
    drawTextInCell({ page, font: bold, text: 'CIUDAD', x: xCity, topY: top, w: cCity, h: rH, size: 10, minSize: 9, padding: 6, align: 'center', valign: 'middle', lineHeight: 11 });
    drawTextInCell({ page, font: bold, text: 'Enfermedad O Accidente', x: xEvt, topY: top, w: cEvt, h: rH, size: 10, minSize: 9, padding: 6, align: 'center', valign: 'middle', lineHeight: 11 });

    // ✅ SIN “X” en decreto
    drawTextInCell({
      page,
      font: bold,
      text: 'DECRETO 1848 DE 1968 O\nLaboral-Profesional',
      x: xDec,
      topY: top,
      w: cDec,
      h: rH,
      size: 9,
      minSize: 8,
      padding: 6,
      align: 'center',
      valign: 'middle',
      lineHeight: 11,
    });

    drawTextInCell({ page, font: bold, text: 'PROCEDIMIENTO A', x: xProc, topY: top, w: cProc, h: rH, size: 9, minSize: 8, padding: 6, align: 'center', valign: 'middle', lineHeight: 11 });

    // Textos fila 2
    drawTextInCell({ page, font, text: ciudad, x: xCity, topY: top2, w: cCity, h: rH, size: 10, minSize: 9, padding: 6, align: 'center', valign: 'middle', lineHeight: 11 });
    drawTextInCell({ page, font, text: evento, x: xEvt, topY: top2, w: cEvt, h: rH, size: 10, minSize: 9, padding: 6, align: 'center', valign: 'middle', lineHeight: 11 });
    drawTextInCell({ page, font: bold, text: 'LEY 100/93', x: xDec, topY: top2, w: cDec, h: rH, size: 10, minSize: 9, padding: 6, align: 'center', valign: 'middle', lineHeight: 11 });
    drawTextInCell({ page, font: bold, text: 'PROCEDIMIENTO B', x: xProc, topY: top2, w: cProc, h: rH, size: 9, minSize: 8, padding: 6, align: 'center', valign: 'middle', lineHeight: 11 });

    // X del procedimiento en su cuadro
    if (proc === 'A') {
      drawTextInCell({ page, font: bold, text: 'X', x: xPX, topY: top, w: cProcX, h: rH, size: 12, minSize: 12, padding: 0, align: 'center', valign: 'middle', lineHeight: 12 });
    }
    if (proc === 'B') {
      drawTextInCell({ page, font: bold, text: 'X', x: xPX, topY: top2, w: cProcX, h: rH, size: 12, minSize: 12, padding: 0, align: 'center', valign: 'middle', lineHeight: 12 });
    }

    top += rH * 2;
  }

  // Establecimiento / Entidad territorial
  {
    const hIE = 46;
    const half = w / 2;
    const labelInHalf = 160;
    const valueInHalf = half - labelInHalf;

    drawTableRow({
      page,
      x: x0,
      topY: top,
      h: hIE,
      theme,
      cells: [
        { w: labelInHalf, fill: theme.blue, text: 'Establecimiento educativo\ndonde labora:', font: bold, size: 9, minSize: 8, lineHeight: 12, valign: 'middle', padding: 6 },
        { w: valueInHalf, fill: theme.light, text: up(u?.institucionEducativaRef?.nombre), font, size: 9, minSize: 7, align: 'center', valign: 'middle', padding: 6 },
        { w: labelInHalf, fill: theme.blue, text: 'Entidad territorial donde\nlabora:', font: bold, size: 9, minSize: 8, lineHeight: 12, valign: 'middle', padding: 6 },
        { w: valueInHalf, fill: theme.light, text: up(u?.secretariaRef?.nombre), font, size: 9, minSize: 7, align: 'center', valign: 'middle', padding: 6 },
      ],
    });

    top += hIE;
  }

  // Fecha (fila completa)
  {
    const h = 18;
    drawTableRow({
      page,
      x: x0,
      topY: top,
      h,
      theme,
      cells: [{ w, fill: theme.blue, label: 'Fecha: ', value: formatDateDMY(dictamen?.fechaDictamen), bold, font, labelSize: 12, valueSize: 10, padding: 6 }],
    });
    top += h;
  }

  // Sección 2
  bandCentered(page, bold, theme, x0, top, w, 22, '2. Identificación del educador', theme.peach);
  top += 22;

  const nombres = up(joinName(u?.primerNombre, u?.segundoNombre));
  const apellidos = up(joinName(u?.primerApellido, u?.segundoApellido));

  // Nombre / Apellidos
  {
    const h = 18;
    const halfW = w / 2;

    drawTableRow({
      page,
      x: x0,
      topY: top,
      h,
      theme,
      cells: [
        { w: halfW, fill: theme.blue, label: 'Nombre (s): ', value: nombres, bold, font, labelSize: 12, valueSize: 10, padding: 6 },
        { w: halfW, fill: theme.blue, label: 'Apellidos (s): ', value: apellidos, bold, font, labelSize: 12, valueSize: 10, padding: 6 },
      ],
    });

    top += h;
  }

  // Documento
  {
    const h = 18;
    const leftW = 270;
    const rightW = w - leftW;

    drawTableRow({
      page,
      x: x0,
      topY: top,
      h,
      theme,
      cells: [
        { w: leftW, fill: theme.blue, label: 'Documento de Identidad: ', value: '', bold, font, labelSize: 12, valueSize: 10, padding: 6 },
        { w: rightW, fill: theme.light, text: up(u?.identificacion), font, size: 10, align: 'center', padding: 2, minSize: 8 },
      ],
    });

    top += h;
  }

  // Género / Escolaridad / Estado civil
  {
    const h = 18;
    const cG = 170;
    const cE = 240;
    const cC = w - cG - cE;

    drawTableRow({
      page,
      x: x0,
      topY: top,
      h,
      theme,
      cells: [
        { w: cG, fill: theme.blue, label: 'Género: ', value: up(sexoToGenero(u?.sexo, u?.genero)), bold, font, labelSize: 12, valueSize: 10, padding: 6 },
        { w: cE, fill: theme.blue, label: 'Nivel de escolaridad: ', value: up(u?.escolaridad), bold, font, labelSize: 12, valueSize: 10, padding: 6 },
        { w: cC, fill: theme.blue, label: 'Estado civil: ', value: up(u?.estadoCivil), bold, font, labelSize: 12, valueSize: 10, padding: 6 },
      ],
    });

    top += h;
  }

  // Fecha nacimiento / Edad
  {
    const h = 18;
    const cFN = 360;
    const cEdad = w - cFN;

    drawTableRow({
      page,
      x: x0,
      topY: top,
      h,
      theme,
      cells: [
        { w: cFN, fill: theme.blue, label: 'Fecha de nacimiento: ', value: formatDateDMY(u?.fechaNacimiento), bold, font, labelSize: 12, valueSize: 10, padding: 6 },
        { w: cEdad, fill: theme.blue, label: 'Edad: ', value: u?.edad != null ? String(u.edad) : '', bold, font, labelSize: 12, valueSize: 10, padding: 6 },
      ],
    });

    top += h;
  }

  // Dirección
  {
    const h = 18;
    const leftW = 220;
    const rightW = w - leftW;

    drawTableRow({
      page,
      x: x0,
      topY: top,
      h,
      theme,
      cells: [
        { w: leftW, fill: theme.blue, label: 'Dirección del calificado: ', value: '', bold, font, labelSize: 12, valueSize: 10, padding: 6 },
        { w: rightW, fill: theme.light, text: up(u?.direccion), font, size: 10, align: 'center', padding: 2, minSize: 7 },
      ],
    });

    top += h;
  }

  // Zona / Municipio / Departamento
  {
    const h = 28;
    const cZona = 95;
    const cMun = 245;
    const cDep = w - cZona - cMun;

    drawTableRow({
      page,
      x: x0,
      topY: top,
      h,
      theme,
      cells: [
        {
          w: cZona,
          fill: theme.blue,
          label: 'Zona: ',
          value: up(zonaToLabel(u?.zonaResidencia)),
          layout: 'inline',
          bold,
          font,
          labelSize: 12,
          valueSize: 10,
          minValueSize: 7,
          padding: 6,
          gap: 4,
          align: 'left',
        },
        { w: cMun, fill: theme.blue, label: 'Municipio: ', value: up(u?.municipio?.nombre), bold, font, labelSize: 12, valueSize: 10, padding: 6 },
        { w: cDep, fill: theme.blue, label: 'Departamento: ', value: up(u?.departamento?.nombre), bold, font, labelSize: 12, valueSize: 10, padding: 6 },
      ],
    });

    top += h;
  }

  // Cargo / Grado / Vinculación
  {
    const h = 35;

    const cCargo = Math.round(w * 0.42);
    const cGrado = Math.round(w * 0.28);
    const cVinc = w - cCargo - cGrado;

    drawTableRow({
      page,
      x: x0,
      topY: top,
      h,
      theme,
      cells: [
        { w: cCargo, fill: theme.blue, label: 'Cargo: ', value: up(u?.categoria ?? ''), bold, font, labelSize: 12, valueSize: 10, padding: 6 },
        { w: cGrado, fill: theme.blue, label: 'Grado de escalafón: ', value: up(u?.gradoEscalafon), bold, font, labelSize: 12, valueSize: 10, padding: 6 },
        {
          w: cVinc,
          fill: theme.blue,
          layout: 'stack',
          label: 'Forma de vinculación:',
          value: up(u?.formaVinculacion),
          bold,
          font,
          labelSize: 12,
          valueSize: 9,
          minValueSize: 6.5,
          padding: 5,
          align: 'left',
          lineHeight: 10.5,
        },
      ],
    });

    top += h;
  }

  // ✅ IMPORTANTE: solo devolvemos el punto donde debe iniciar la Parte 3
  return { nextTop: top };
}
