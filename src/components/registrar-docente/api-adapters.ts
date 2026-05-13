import type {
  BarrioOption,
  CargoDocenteOption,
  DepartamentoOption,
  EpsOption,
  InstitucionOption,
  MunicipioOption,
  PaisOption,
  SecretariaOption,
} from './types';

export type ApiRecord = Record<string, unknown>;

export function asApiRecord(value: unknown): ApiRecord {
  return value && typeof value === 'object' ? (value as ApiRecord) : {};
}

export function isAbortError(error: unknown) {
  return asApiRecord(error).name === 'AbortError';
}

export function readRecordArray(value: unknown): ApiRecord[] {
  return Array.isArray(value)
    ? value.filter((item): item is ApiRecord => !!item && typeof item === 'object')
    : [];
}

export function readFirstRecordArray(data: ApiRecord, keys: string[]) {
  for (const key of keys) {
    const rows = readRecordArray(data[key]);
    if (rows.length) return rows;
  }

  return [];
}

export function readString(data: ApiRecord, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = data[key];
    if (value != null) return String(value);
  }

  return fallback;
}

export function readUnknown(data: ApiRecord, keys: string[]) {
  for (const key of keys) {
    if (data[key] != null) return data[key];
  }

  return null;
}

export function readNestedRecord(data: ApiRecord, key: string) {
  return asApiRecord(data[key]);
}

export function readErrorMessage(data: ApiRecord, fallback: string) {
  return readString(data, ['error'], fallback);
}

export function readUsuarioId(data: ApiRecord) {
  const usuario = readNestedRecord(data, 'usuario');
  const id = Number(usuario.id);

  return Number.isFinite(id) ? id : null;
}

export function mapCargoDocentes(data: ApiRecord): CargoDocenteOption[] {
  return readFirstRecordArray(data, ['items', 'cargos', 'rows'])
    .map((cargo) => ({
      id: Number(cargo.id),
      codigo: readString(cargo, ['codigo', 'Codigo']),
      nombre: readString(cargo, ['nombre', 'Nombre']),
    }))
    .filter((cargo) => Number.isFinite(cargo.id) && !!cargo.nombre);
}

export function mapInstituciones(value: unknown): InstitucionOption[] {
  return readRecordArray(value).map((institucion) => ({
    id: Number(institucion.id),
    nombre: readString(institucion, ['nombre']),
    idDepartamento:
      institucion.idDepartamento == null ? null : String(institucion.idDepartamento),
    idMunicipio: institucion.idMunicipio == null ? null : String(institucion.idMunicipio),
    idSecretaria:
      institucion.idSecretaria == null ? null : Number(institucion.idSecretaria),
  }));
}

export function mapUbicacionOptions(data: ApiRecord) {
  const paises: PaisOption[] = readRecordArray(data.paises).map((pais) => ({
    codigo: readString(pais, ['codigo']),
    nombre: readString(pais, ['nombre']),
  }));

  const departamentos: DepartamentoOption[] = readRecordArray(data.departamentos).map(
    (departamento) => ({
      codigo: readString(departamento, ['codigo']),
      nombre: readString(departamento, ['nombre']),
    }),
  );

  const municipios: MunicipioOption[] = readRecordArray(data.municipios).map((municipio) => ({
    codigo: readString(municipio, ['codigo']),
    nombre: readString(municipio, ['nombre']),
    codigoDepartamento: readString(municipio, ['codigoDepartamento']),
  }));

  const barrios: BarrioOption[] = readRecordArray(data.barrios).map((barrio) => ({
    id: Number(barrio.id),
    nombre: readString(barrio, ['nombre']),
    codigoMunicipio: readString(barrio, ['codigoMunicipio']),
  }));

  const secretarias: SecretariaOption[] = readRecordArray(data.secretarias).map((secretaria) => ({
    id: Number(secretaria.id),
    nombre: readString(secretaria, ['nombre']),
  }));

  const eps: EpsOption[] = readRecordArray(data.eps).map((item) => ({
    codigo: readString(item, ['codigo']),
    nombre: readString(item, ['nombre']),
  }));

  return { paises, departamentos, municipios, barrios, secretarias, eps };
}
