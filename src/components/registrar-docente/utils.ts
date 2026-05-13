import { emptyForm, REQUIRED_FIELDS } from './constants';
import type { DocenteForm, MunicipioOption, RequiredField } from './types';

export function normalizeText(value: string) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function resolveMunicipioCodigoFromList(
  list: MunicipioOption[],
  nombreOrCodigo?: string,
) {
  if (!nombreOrCodigo) return undefined;
  if (/^\d{5}$/.test(nombreOrCodigo)) return nombreOrCodigo;

  const normalized = normalizeText(nombreOrCodigo);
  const found = list.find((municipio) => normalizeText(municipio.nombre) === normalized);
  return found?.codigo;
}

export function resolveMunicipioNombreFromList(
  list: MunicipioOption[],
  nombreOrCodigo?: string,
) {
  if (!nombreOrCodigo) return undefined;
  if (/^\d{5}$/.test(nombreOrCodigo)) {
    const found = list.find((municipio) => municipio.codigo === nombreOrCodigo);
    return found?.nombre;
  }

  const normalized = normalizeText(nombreOrCodigo);
  const found = list.find((municipio) => normalizeText(municipio.nombre) === normalized);
  return found?.nombre ?? nombreOrCodigo;
}

export function calculateAge(fechaNacimiento: string) {
  if (!fechaNacimiento) return '';

  const birth = new Date(fechaNacimiento);
  if (Number.isNaN(birth.getTime())) return '';

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? String(age) : '';
}

export function normalizeCargoId(value: unknown) {
  const id = value == null || value === '' ? null : Number(value);
  return Number.isFinite(id) ? id : null;
}

export function normalizeDate(value: unknown, fallback = '') {
  return value ? String(value).slice(0, 10) : fallback;
}

export function buildStoredForm(data: Partial<DocenteForm> | null | undefined): DocenteForm {
  const cargoId = normalizeCargoId(data?.cargoDocenteId);

  return {
    ...emptyForm,
    ...data,
    cargoDocenteId: cargoId,
    cargoDocenteNombre: data?.cargoDocenteNombre ?? '',
    escolaridad: data?.escolaridad ?? '',
    tipoDictamen: (data?.tipoDictamen ?? 'CALIFICACION') as DocenteForm['tipoDictamen'],
    fechaVinculacion: data?.fechaVinculacion ?? '',
  };
}

export function getMissingRequiredFields(
  form: DocenteForm,
  requiredFields: RequiredField[] = REQUIRED_FIELDS,
) {
  return requiredFields.filter(({ key }) => {
    const value = (form[key] ?? '').toString().trim();
    return !value;
  });
}

export function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
