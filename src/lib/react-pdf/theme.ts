export const pdfTheme = {
  page: {
    padding: 18,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },

  colors: {
    border: '#000000',
    white: '#FFFFFF',

    // Azul tipo plantilla (Word)
    templateBlue: '#9CC3E6',

    // Texto
    text: '#000000',
  },

  sizes: {
    // ✅ más delgado (Word se ve más fino)
    borderWidth: 0.7,

    // ✅ menos “aire” para que se vea pegado
    rowPadding: 4,

    // Header
    headerTopH: 52,
    headerBandH: 14,
    headerRowH: 14,
    logoW: 120,
  },
} as const;

// ✅ opcional (para que también sirva import default)
export default pdfTheme;