import { z } from 'zod';

/**
 * Revisión por sistemas: un texto por sistema que inicia con el hallazgo normal. Se guarda en cada
 * atención y se precarga con la última revisión del docente, como los antecedentes.
 */

export const REVISION_TEXT_MAX = 1000;

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
] as const satisfies ReadonlyArray<{ key: string; label: string; normal: string; soloMujeres?: boolean }>;

export type SistemaKey = (typeof REVISION_SISTEMAS)[number]['key'];

export type RevisionSistemas = {
  sistemas: Record<SistemaKey, string>;
  /** YYYY-MM-DD */
  fecha: string | null;
};

const SISTEMA_KEYS = REVISION_SISTEMAS.map((item) => item.key) as SistemaKey[];
export const NORMAL_BY_SISTEMA = Object.fromEntries(REVISION_SISTEMAS.map((item) => [item.key, item.normal])) as Record<
  SistemaKey,
  string
>;

const schema = z.object({
  sistemas: z
    .record(z.string(), z.unknown())
    .catch({})
    .default({})
    .transform(
      (raw) =>
        Object.fromEntries(
          SISTEMA_KEYS.map((key) => {
            const value = raw[key];
            return [key, typeof value === 'string' ? value.trim().slice(0, REVISION_TEXT_MAX) : NORMAL_BY_SISTEMA[key]];
          }),
        ) as Record<SistemaKey, string>,
    ),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .catch(null)
    .default(null),
});

/** Lectura tolerante: lo que falte o no sea texto toma el hallazgo normal. */
export function parseRevisionSistemas(value: unknown): RevisionSistemas {
  return schema.parse(typeof value === 'object' && value ? value : {});
}

export const DEFAULT_REVISION_SISTEMAS = parseRevisionSistemas({});

export const saveRevisionSistemasSchema = z.object({ datos: z.object({}).passthrough() }).strict();

/** Distinto del texto normal (ignora mayúsculas y espacios): es lo que el médico registró como hallazgo. */
export function sistemaModificado(key: SistemaKey, value: string) {
  const normalize = (text: string) => text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-CO');
  return normalize(value) !== normalize(NORMAL_BY_SISTEMA[key]);
}

export function countSistemasModificados(revision: RevisionSistemas, mujer: boolean) {
  return REVISION_SISTEMAS.filter(
    (item) => (mujer || !('soloMujeres' in item)) && sistemaModificado(item.key, revision.sistemas[item.key]),
  ).length;
}
