import type { DictamenPdfBasicData } from './generateDictamenPdf';

function formatDateDMY(value: any) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function joinName(...parts: Array<string | null | undefined>) {
  const clean = parts.map((x) => (x ?? '').trim()).filter(Boolean);
  return clean.length ? clean.join(' ') : null;
}

function sexoToGenero(sexo?: string | null, genero?: string | null) {
  if (genero && genero.trim()) return genero;
  const s = (sexo ?? '').toUpperCase();
  if (s === 'M') return 'MASCULINO';
  if (s === 'F') return 'FEMENINO';
  return null;
}

function zonaToLabel(zona?: string | null) {
  const z = (zona ?? '').toUpperCase();
  if (z === 'U') return 'URBANA';
  if (z === 'R') return 'RURAL';
  return zona ?? null;
}

function derivarContingencia(dictamen: any): 'ENFERMEDAD_GENERAL' | 'ATEP' | null {
  // Regla práctica:
  // - Origen LABORAL o tipoEvento ACCIDENTE => ATEP
  // - Origen COMUN o tipoEvento ENFERMEDAD => ENFERMEDAD_GENERAL
  const origen = String(dictamen?.origenEvento ?? '').toUpperCase();
  const tipo = String(dictamen?.tipoEvento ?? '').toUpperCase();

  if (origen === 'LABORAL') return 'ATEP';
  if (tipo === 'ACCIDENTE') return 'ATEP';
  if (origen === 'COMUN') return 'ENFERMEDAD_GENERAL';
  if (tipo === 'ENFERMEDAD') return 'ENFERMEDAD_GENERAL';

  return null;
}

function derivarNorma(dictamen: any): 'DECRETO_1848' | 'LEY_100' | null {
  // Regla práctica:
  // - LABORAL => Decreto 1848
  // - COMUN => Ley 100
  const origen = String(dictamen?.origenEvento ?? '').toUpperCase();
  if (origen === 'LABORAL') return 'DECRETO_1848';
  if (origen === 'COMUN') return 'LEY_100';
  return null;
}

export function adaptDictamenToPdfBasicData(dictamen: any): DictamenPdfBasicData {
  const u = dictamen.usuario;

  const nombres = joinName(u?.primerNombre, u?.segundoNombre);
  const apellidos = joinName(u?.primerApellido, u?.segundoApellido);

  const escalafon = joinName(u?.gradoEscalafon, u?.nivelEscalafon); // ej: "10 A" (si así lo manejas)
  const vinculacion = u?.formaVinculacion ?? null;

  const ciudadDictamen =
    u?.municipio?.nombre ??
    u?.codigoMunicipio ??
    null;

  const departamento =
    u?.departamento?.nombre ??
    u?.codigoDepartamento ??
    null;

  const establecimientoEducativo =
    u?.institucionEducativaRef?.nombre ?? null;

  const entidadTerritorial =
    u?.secretariaRef?.nombre ?? null;

  return {
    // Encabezado
    dictamenId: Number(dictamen.id),
    procedimientoPcl: String(dictamen.procedimientoPcl) as 'A' | 'B',
    fechaDictamen: formatDateDMY(dictamen.fechaDictamen),

    // Aspectos generales
    ciudadDictamen,
    contingencia: derivarContingencia(dictamen),
    norma: derivarNorma(dictamen),
    establecimientoEducativo,
    entidadTerritorial,
    // En tu PDF se ve una fecha distinta a "fecha dictamen": usamos fechaEstructuracionInvalidez
    fechaAspectosGenerales: formatDateDMY(dictamen.fechaEstructuracionInvalidez),

    // Identificación
    nombres,
    apellidos,
    documento: u?.identificacion ?? null,
    genero: sexoToGenero(u?.sexo, u?.genero),
    escolaridad: u?.escolaridad ?? null,
    estadoCivil: u?.estadoCivil ?? null,
    fechaNacimiento: formatDateDMY(u?.fechaNacimiento),
    edad: u?.edad ?? null,
    direccion: u?.direccion ?? null,
    zona: zonaToLabel(u?.zonaResidencia),
    municipio: u?.municipio?.nombre ?? null,
    departamento,
    // Cargo: en tu schema NO hay “cargo” como texto; lo más cercano es codigoOcupacion
    cargo: u?.codigoOcupacion ?? null,
    escalafon,
    vinculacion,
  };
}
