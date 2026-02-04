export function formatDateDMY(value: any) {
  if (!value) return '';
  if (typeof value === 'string') return value; // si ya viene formateada
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());

  // En tu plantilla lo estás viendo con guion
  return `${dd}-${mm}-${yyyy}`;
}

export function up(value: string | null | undefined) {
  return (value ?? '').trim().toUpperCase();
}

export function joinName(...parts: Array<string | null | undefined>) {
  return parts.map((x) => (x ?? '').trim()).filter(Boolean).join(' ');
}

export function sexoToGenero(sexo?: string | null, genero?: string | null) {
  if (genero && genero.trim()) return genero;
  const s = (sexo ?? '').toUpperCase();
  if (s === 'M') return 'MASCULINO';
  if (s === 'F') return 'FEMENINO';
  return '';
}

export function zonaToLabel(zona?: string | null) {
  const z = (zona ?? '').toUpperCase();
  if (z === 'U') return 'URBANA';
  if (z === 'R') return 'RURAL';
  return zona ?? '';
}

export function derivarChecks(dictamen: any) {
  const origen = String(dictamen?.origenEvento ?? '').toUpperCase();
  const tipo = String(dictamen?.tipoEvento ?? '').toUpperCase();

  const atep = origen === 'LABORAL' || tipo === 'ACCIDENTE';
  const enfermedad = !atep;

  const decreto1848 = origen === 'LABORAL';
  const ley100 = origen === 'COMUN';

  const proc = String(dictamen?.procedimientoPcl ?? 'A').toUpperCase();
  const procA = proc === 'A';
  const procB = proc === 'B';

  return { atep, enfermedad, decreto1848, ley100, procA, procB };
}
