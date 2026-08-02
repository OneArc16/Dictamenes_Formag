export type PatientSex = 'F' | 'M' | 'O';

/**
 * The legacy database uses H=Hombre, M=Mujer and O=Otro. Reception exposes
 * the conventional UI contract M=Masculino, F=Femenino and O=Otro.
 */
export function patientSexFromDatabase(value: string): PatientSex | '' {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'H') return 'M';
  if (normalized === 'M') return 'F';
  if (normalized === 'F') return 'F';
  return normalized === 'O' ? 'O' : '';
}

export function patientSexToDatabase(value: PatientSex) {
  return value === 'M' ? 'H' : value === 'F' ? 'M' : 'O';
}

export function isFideicomisosEps(name: string) {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleUpperCase('es-CO');

  return normalized.includes('FIDEICOMISOS') || normalized.includes('FIDUPREVISORA');
}
