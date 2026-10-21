import { Font } from '@react-pdf/renderer';

// El corte silábico por defecto de React-PDF es inglés y parte palabras en español
// ("GEN-ERAL", "LAB-ORALES"): los PDF solo cortan entre palabras. Es un ajuste global del
// proceso, por eso vive en un módulo único que importan todos los PDF que lo necesitan.
Font.registerHyphenationCallback((word) => [word]);
