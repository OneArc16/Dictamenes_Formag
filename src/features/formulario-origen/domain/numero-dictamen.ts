import { isValidIsoDate } from './date';

export function buildNumeroDictamen(fechaIso: string, documento: string): string {
  if (!isValidIsoDate(fechaIso)) {
    throw new Error('La fecha debe ser válida y tener formato YYYY-MM-DD.');
  }

  const documentoNumerico = documento.replace(/\D/g, '');
  if (!documentoNumerico) {
    throw new Error('El documento debe contener al menos un dígito.');
  }

  const [year, month, day] = fechaIso.split('-');
  return `${day}${month}${year}${documentoNumerico}`;
}
