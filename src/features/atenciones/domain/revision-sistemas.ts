import { createHallazgosCatalog, type Hallazgos } from './hallazgos';

/**
 * Revisión por sistemas: un texto por sistema que inicia con el hallazgo normal. Se guarda en cada
 * atención y se precarga con la última revisión del docente, como los antecedentes.
 */

export const REVISION_SISTEMAS = [
  { key: 'general', label: 'General', normal: 'BUEN ESTADO GENERAL' },
  { key: 'cabeza', label: 'Cabeza', normal: 'No refiere cefalea, náuseas, emesis, mareo, presencia de masas' },
  { key: 'ojos', label: 'Ojos', normal: 'No refiere prurito, ardor, epífora, edema palpebral, fotofobia' },
  { key: 'nariz', label: 'Nariz', normal: 'No refiere obstrucción nasal, epistaxis, rinorrea, dolor' },
  { key: 'oidos', label: 'Oídos', normal: 'No refiere hipoacusia, otalgia, otorrea, otoliquia, otorragia' },
  { key: 'orofaringe', label: 'Orofaringe', normal: 'No refiere odinofagia, escurrimiento posterior, disfonía' },
  { key: 'cuello', label: 'Cuello', normal: 'No refiere dolor, rigidez, presencia de masas' },
  {
    key: 'respiratorio',
    label: 'Respiratorio',
    normal: 'No refiere disnea, ortopnea, cianosis central, dolor torácico',
  },
  { key: 'cardiovascular', label: 'Cardiovascular', normal: 'No refiere palpitaciones, cianosis, dolor retroesternal' },
  {
    key: 'gastrointestinal',
    label: 'Gastrointestinal',
    normal: 'No refiere dolor abdominal, niega cólicos, dispepsias',
  },
  { key: 'urologicos', label: 'Urológicos', normal: 'No refiere disuria ni otro síntoma' },
  { key: 'ginecologico', label: 'Ginecológico', normal: 'No refiere', soloMujeres: true },
  { key: 'mamas', label: 'Mamas', normal: 'SIMÉTRICAS, NO PROTUBERANCIAS, NO RETRACCIONES' },
  { key: 'neurologico', label: 'Neurológico', normal: 'No refiere pérdida de conocimiento, amnesia, síncope' },
  { key: 'psiquiatrico', label: 'Psiquiátrico', normal: 'No refiere amnesia, insomnio, cambios en el comportamiento' },
  {
    key: 'endocrino',
    label: 'Endocrino',
    normal: 'No refiere intolerancia al frío, sudoración nocturna, irritabilidad',
  },
  { key: 'hematopoyetico', label: 'Hematopoyético', normal: 'No refiere' },
  { key: 'linforreticular', label: 'Linforreticular', normal: 'No refiere' },
  { key: 'esqueletico', label: 'Esquelético', normal: 'No refiere osteomialgias, atrofia muscular' },
  { key: 'articular', label: 'Articular', normal: 'No refiere' },
  { key: 'pielFaneras', label: 'Piel y faneras', normal: 'No refiere prurito, edema, ictericia o descamación' },
  { key: 'otros', label: 'Otros', normal: 'No refiere' },
] as const;

export const REVISION_CATALOG = createHallazgosCatalog(REVISION_SISTEMAS);

export type SistemaKey = (typeof REVISION_SISTEMAS)[number]['key'];
export type RevisionSistemas = Hallazgos<SistemaKey>;

export const NORMAL_BY_SISTEMA = REVISION_CATALOG.normalByKey;
export const parseRevisionSistemas = REVISION_CATALOG.parse;
export const DEFAULT_REVISION_SISTEMAS = REVISION_CATALOG.defaults;
export const sistemaModificado = REVISION_CATALOG.modificado;
export const countSistemasModificados = REVISION_CATALOG.countModificados;
