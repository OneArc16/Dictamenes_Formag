export type PdfField = {
  key: string;
  label?: string;          // nombre humano (para anexo)
  x: number;
  topY: number;            // desde arriba
  size?: number;
  minSize?: number;        // tamaño mínimo permitido
  maxWidth?: number;       // si hay wrap
  lineHeight?: number;
  boxHeight?: number;      // alto de la caja (en puntos)
  overflowToAnnex?: boolean; // si se desborda => anexo
};

export const page1Fields: PdfField[] = [
  // Encabezado
  { key: 'dictamenId', label: 'Dictamen número', x: 200, topY: 134, size: 10 },
  { key: 'fechaDictamen', label: 'Fecha del dictamen', x: 200, topY: 150, size: 10 },

  // Checks Procedimiento
  { key: 'checkProcA', label: 'Procedimiento A', x: 562, topY: 200, size: 11 },
  { key: 'checkProcB', label: 'Procedimiento B', x: 562, topY: 244, size: 11 },

  // Aspectos generales (estos suelen venir largos => caja + anexo)
  { key: 'ciudadDictamen', label: 'Ciudad', x: 35, topY: 300, size: 9, maxWidth: 120, boxHeight: 26, minSize: 7, overflowToAnnex: true },

  { key: 'checkEnfermedadGeneral', label: 'Enfermedad general', x: 275, topY: 285, size: 11 },
  { key: 'checkAtep', label: 'ATEP', x: 275, topY: 317, size: 11 },

  { key: 'checkDecreto1848', label: 'Decreto 1848', x: 470, topY: 285, size: 11 },
  { key: 'checkLey100', label: 'Ley 100', x: 470, topY: 317, size: 11 },

  { key: 'establecimientoEducativo', label: 'Establecimiento educativo', x: 30, topY: 365, size: 9, maxWidth: 250, boxHeight: 36, minSize: 7, overflowToAnnex: true },
  { key: 'entidadTerritorial', label: 'Entidad territorial', x: 330, topY: 365, size: 9, maxWidth: 260, boxHeight: 36, minSize: 7, overflowToAnnex: true },

  { key: 'fechaAspectosGenerales', label: 'Fecha (Aspectos generales)', x: 60, topY: 420, size: 9 },

  // Identificación (algunos también pueden ser largos)
  { key: 'nombres', label: 'Nombres', x: 110, topY: 458, size: 9, maxWidth: 210, boxHeight: 14, minSize: 7, overflowToAnnex: false },
  { key: 'apellidos', label: 'Apellidos', x: 410, topY: 458, size: 9, maxWidth: 160, boxHeight: 14, minSize: 7, overflowToAnnex: false },

  { key: 'documento', label: 'Documento', x: 170, topY: 477, size: 9 },

  { key: 'genero', label: 'Género', x: 85, topY: 494, size: 9 },
  { key: 'escolaridad', label: 'Escolaridad', x: 295, topY: 494, size: 9, maxWidth: 120, boxHeight: 14, minSize: 7, overflowToAnnex: true },
  { key: 'estadoCivil', label: 'Estado civil', x: 490, topY: 494, size: 9 },

  { key: 'fechaNacimiento', label: 'Fecha nacimiento', x: 150, topY: 509, size: 9 },
  { key: 'edad', label: 'Edad', x: 422, topY: 509, size: 9 },

  { key: 'direccion', label: 'Dirección', x: 160, topY: 526, size: 9, maxWidth: 410, boxHeight: 22, minSize: 7, overflowToAnnex: true },

  { key: 'zona', label: 'Zona', x: 70, topY: 542, size: 9 },
  { key: 'municipio', label: 'Municipio', x: 150, topY: 542, size: 9 },
  { key: 'departamento', label: 'Departamento', x: 422, topY: 542, size: 9 },

  { key: 'cargo', label: 'Cargo', x: 75, topY: 574, size: 9, maxWidth: 210, boxHeight: 14, minSize: 7, overflowToAnnex: true },
  { key: 'escalafon', label: 'Escalafón', x: 395, topY: 558, size: 9 },
  { key: 'vinculacion', label: 'Vinculación', x: 535, topY: 558, size: 8, maxWidth: 70, boxHeight: 14, minSize: 7, overflowToAnnex: true },
];
