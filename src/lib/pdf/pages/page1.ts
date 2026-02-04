import type { PDFFont, PDFPage } from 'pdf-lib';

import { defaultTheme, bandCentered, drawTextInCell } from '@/lib/pdf/core/pdfContext';
import { formatDateDMY, up, joinName, sexoToGenero, zonaToLabel, derivarChecks } from '@/lib/pdf/core/formatters';
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
      font,
      bold,
      cells: [
        { w: leftW, fill: theme.blue, text: 'DICTAMEN NÚMERO:', font: bold, size: 11, align: 'left', padding: 8 },
        { w: rightW, fill: theme.blue, text: String(dictamen?.numeroDictamen ?? dictamen?.id ?? ''), size: 10, align: 'left', padding: 8 },
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
      font,
      bold,
      cells: [
        { w: leftW, fill: theme.blue, text: 'FECHA DEL DICTAMEN', font: bold, size: 11, align: 'left', padding: 8 },
        { w: rightW, fill: theme.blue, text: formatDateDMY(dictamen?.fechaDictamen), size: 10, align: 'left', padding: 8 },
      ],
    });

    top += rowH;
  }

  // Sección 1
  bandCentered(page, bold, theme, x0, top, w, 22, '1. Aspectos Generales del Dictamen', theme.peach);
  top += 22;

  // Tabla Aspectos Generales (2 filas, 7 columnas con X separadas)
  {
    const rH = 34;

    const cCity = 85;
    const cEnf = 150;
    const cX = 22;
    const cDec = 170;
    const cProc = w - (cCity + cEnf + cDec + cX * 3);

    const checks = derivarChecks(dictamen);

    drawTableRow({
      page,
      x: x0,
      topY: top,
      h: rH,
      theme,
      font,
      bold,
      cells: [
        { w: cCity, fill: theme.blue, text: 'CIUDAD', font: bold, size: 9, align: 'center' },
        { w: cEnf, fill: theme.blue, text: 'ENFERMEDAD GENERAL', font: bold, size: 9, align: 'center' },
        { w: cX, fill: theme.blue, text: checks.enfermedad ? 'X' : '', font: bold, size: 11, align: 'center' },
        {
          w: cDec,
          fill: theme.blue,
          text: 'DECRETO 1848 DE 1968\nO Laboral-Profesional',
          font: bold,
          size: 9,
          minSize: 8,
          align: 'center',
          valign: 'middle',
          lineHeight: 11,
        },
        { w: cX, fill: theme.blue, text: checks.decreto1848 ? 'X' : '', font: bold, size: 11, align: 'center' },
        { w: cProc, fill: theme.blue, text: 'PROCEDIMIENTO A', font: bold, size: 9, align: 'center' },
        { w: cX, fill: theme.blue, text: checks.procA ? 'X' : '', font: bold, size: 11, align: 'center' },
      ],
    });

    const top2 = top + rH;
    drawTableRow({
      page,
      x: x0,
      topY: top2,
      h: rH,
      theme,
      font,
      bold,
      cells: [
        { w: cCity, fill: theme.blue, text: up(u?.municipio?.nombre), size: 9, align: 'center', minSize: 8 },
        { w: cEnf, fill: theme.blue, text: 'ATEP', font: bold, size: 9, align: 'center' },
        { w: cX, fill: theme.blue, text: checks.atep ? 'X' : '', font: bold, size: 11, align: 'center' },
        { w: cDec, fill: theme.blue, text: 'LEY 100/93', font: bold, size: 9, align: 'center' },
        { w: cX, fill: theme.blue, text: checks.ley100 ? 'X' : '', font: bold, size: 11, align: 'center' },
        { w: cProc, fill: theme.blue, text: 'PROCEDIMIENTO B', font: bold, size: 9, align: 'center' },
        { w: cX, fill: theme.blue, text: checks.procB ? 'X' : '', font: bold, size: 11, align: 'center' },
      ],
    });

    top = top2 + rH;
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
      font,
      bold,
      cells: [
        { w: labelInHalf, fill: theme.blue, text: 'Establecimiento educativo\ndonde labora:', font: bold, size: 9, minSize: 8, lineHeight: 12, valign: 'middle', padding: 6 },
        { w: valueInHalf, fill: theme.light, text: up(u?.institucionEducativaRef?.nombre), size: 9, minSize: 7, align: 'center', valign: 'middle', padding: 6 },
        { w: labelInHalf, fill: theme.blue, text: 'Entidad territorial donde\nlabora:', font: bold, size: 9, minSize: 8, lineHeight: 12, valign: 'middle', padding: 6 },
        { w: valueInHalf, fill: theme.light, text: up(u?.secretariaRef?.nombre), size: 9, minSize: 7, align: 'center', valign: 'middle', padding: 6 },
      ],
    });

    top += hIE;
  }

  // Fecha (fila completa) -> label bold 12
  {
    const h = 18;
    drawTableRow({
      page,
      x: x0,
      topY: top,
      h,
      theme,
      font,
      bold,
      cells: [
        { w, fill: theme.blue, label: 'Fecha: ', value: formatDateDMY(dictamen?.fechaDictamen), labelSize: 12, valueSize: 10, padding: 6 },
      ],
    });
    top += h;
  }

  // Sección 2
  bandCentered(page, bold, theme, x0, top, w, 22, '2. Identificación del educador', theme.peach);
  top += 22;

  const nombres = up(joinName(u?.primerNombre, u?.segundoNombre));
  const apellidos = up(joinName(u?.primerApellido, u?.segundoApellido));

  // Nombre / Apellidos (label bold 12)
  {
    const h = 18;
    const halfW = w / 2;

    drawTableRow({
      page,
      x: x0,
      topY: top,
      h,
      theme,
      font,
      bold,
      cells: [
        { w: halfW, fill: theme.blue, label: 'Nombre (s): ', value: nombres, labelSize: 12, valueSize: 10, padding: 6 },
        { w: halfW, fill: theme.blue, label: 'Apellidos (s): ', value: apellidos, labelSize: 12, valueSize: 10, padding: 6 },
      ],
    });

    top += h;
  }

  // Documento (✅ label bold 12)
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
      font,
      bold,
      cells: [
        { w: leftW, fill: theme.blue, label: 'Documento de Identidad: ', value: '', labelSize: 12, valueSize: 10, padding: 6 },
        { w: rightW, fill: theme.light, text: up(u?.identificacion), size: 10, align: 'center', padding: 2, minSize: 8 },
      ],
    });

    top += h;
  }

  // Género / Escolaridad / Estado civil (label bold 12)
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
      font,
      bold,
      cells: [
        { w: cG, fill: theme.blue, label: 'Género: ', value: up(sexoToGenero(u?.sexo, u?.genero)), labelSize: 12, valueSize: 10, padding: 6 },
        { w: cE, fill: theme.blue, label: 'Nivel de escolaridad: ', value: up(u?.escolaridad), labelSize: 12, valueSize: 10, padding: 6 },
        { w: cC, fill: theme.blue, label: 'Estado civil: ', value: up(u?.estadoCivil), labelSize: 12, valueSize: 10, padding: 6 },
      ],
    });

    top += h;
  }

  // Fecha nacimiento / Edad (label bold 12)
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
      font,
      bold,
      cells: [
        { w: cFN, fill: theme.blue, label: 'Fecha de nacimiento: ', value: formatDateDMY(u?.fechaNacimiento), labelSize: 12, valueSize: 10, padding: 6 },
        { w: cEdad, fill: theme.blue, label: 'Edad: ', value: u?.edad != null ? String(u.edad) : '', labelSize: 12, valueSize: 10, padding: 6 },
      ],
    });

    top += h;
  }

  // Dirección (✅ label bold 12)
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
      font,
      bold,
      cells: [
        { w: leftW, fill: theme.blue, label: 'Dirección del calificado: ', value: '', labelSize: 12, valueSize: 10, padding: 6 },
        { w: rightW, fill: theme.light, text: up(u?.direccion), size: 10, align: 'center', padding: 2, minSize: 7 },
      ],
    });

    top += h;
  }

  // Zona / Municipio / Departamento (✅ zona value no se sale)
  {
    const h = 26;

    const cZona = 95;
    const cMun = 245;
    const cDep = w - cZona - cMun;

    drawTableRow({
      page,
      x: x0,
      topY: top,
      h,
      theme,
      font,
      bold,
      cells: [
        { w: cZona, fill: theme.blue, text: '' },
        { w: cMun, fill: theme.blue, label: 'Municipio: ', value: up(u?.municipio?.nombre), labelSize: 12, valueSize: 10, padding: 6 },
        { w: cDep, fill: theme.blue, label: 'Departamento: ', value: up(u?.departamento?.nombre), labelSize: 12, valueSize: 10, padding: 6 },
      ],
    });

    const split = 13;

    drawTextInCell({
      page,
      font: bold,
      text: 'Zona:',
      x: x0,
      topY: top,
      w: cZona,
      h: split,
      size: 12,
      minSize: 12,
      padding: 6,
      lineHeight: 12,
      valign: 'top',
      align: 'left',
    });

    drawTextInCell({
      page,
      font,
      text: up(zonaToLabel(u?.zonaResidencia)),
      x: x0,
      topY: top + split,
      w: cZona,
      h: h - split,
      size: 10,
      minSize: 6, // ✅ permite encoger más si algún día viene largo
      padding: 6,
      lineHeight: 11,
      valign: 'top',
      align: 'center',
    });

    top += h;
  }

  // Cargo / Grado / Vinculación  (✅ más ancho para vinculación + shrink/ellipsis)
  {
    const h = 18;

    // ✅ proporciones mejores (antes cVinc quedaba demasiado angosto)
    const cCargo = Math.round(w * 0.42);
    const cGrado = Math.round(w * 0.28);
    const cVinc = w - cCargo - cGrado;

    drawTableRow({
      page,
      x: x0,
      topY: top,
      h,
      theme,
      font,
      bold,
      cells: [
        { w: cCargo, fill: theme.blue, label: 'Cargo: ', value: up(u?.categoria ?? ''), labelSize: 12, valueSize: 10, padding: 6 },
        { w: cGrado, fill: theme.blue, label: 'Grado de escalafón: ', value: up(u?.gradoEscalafon), labelSize: 12, valueSize: 10, padding: 6 },
        {
          w: cVinc,
          fill: theme.blue,
          label: 'Forma de vinculación: ',
          value: up(u?.formaVinculacion),
          labelSize: 12,
          valueSize: 9,
          minValueSize: 6.5, // ✅ nunca se sale
          padding: 6,
          gap: 3,
        },
      ],
    });

    top += h;
  }
}
