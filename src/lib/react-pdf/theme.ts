export const pdfTheme = {
  page: {
    // Carta en React-PDF se mide en puntos (72 pt = 1 in).
    // Márgenes GTC 185: 3 / 2,5 / 2,5 / 2 cm.
    paddingTop: 85.04,
    paddingBottom: 70.87,
    paddingLeft: 70.87,
    paddingRight: 56.69,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },

  colors: {
    border: '#000000',
    white: '#FFFFFF',

    // Paleta exacta de la plantilla Word
    templateBlue: '#9BC2E6',
    templateBlueLight: '#DAE9F7',
    templateBluePale: '#E0EDF8',
    templateBlueSoft: '#DDEBF7',
    templateBlueMid: '#A5C9EB',
    templateDarkBlue: '#1F4E78',
    templatePeach: '#FCE4D6',
    sectionTitleBg: '#FCE4D6',

    // Texto
    text: '#000000',
  },

  sizes: {
    // âœ… mÃ¡s delgado (Word se ve mÃ¡s fino)
    borderWidth: 0.85,

    // âœ… menos â€œaireâ€ para que se vea pegado
    rowPadding: 4,

    // Header
    // El encabezado completo ocupa el margen superior de 3 cm.
    headerTopH: 43,
    headerBandH: 12,
    headerRowH: 13,
    logoW: 120,
  },
} as const;

// âœ… opcional (para que tambiÃ©n sirva import default)
export default pdfTheme;


