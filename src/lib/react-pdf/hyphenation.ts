import { Font } from '@react-pdf/renderer';

// El corte silábico por defecto de React-PDF es inglés y parte palabras en español
// ("GEN-ERAL", "LAB-ORALES"): los PDF solo cortan entre palabras. Es un ajuste global del
// proceso, por eso vive en un módulo único que importan todos los PDF que lo necesitan.
// Excepción: una "palabra" más larga que cualquier palabra real (texto pegado sin espacios,
// URLs, cadenas de prueba) desbordaría su celda. A esas se les permite cortar en cualquier
// carácter; React-PDF solo usa esos cortes cuando no cabe y añade el guion.
const MAX_UNBROKEN_WORD_LENGTH = 25;

Font.registerHyphenationCallback((word) =>
  word.length > MAX_UNBROKEN_WORD_LENGTH ? Array.from(word) : [word],
);
