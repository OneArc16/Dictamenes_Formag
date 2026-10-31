import { z } from 'zod';

/**
 * Formularios de "un texto por sistema o región" que inician con el hallazgo normal (revisión por
 * sistemas, examen físico). Cada catálogo define sus campos; la lectura y la comparación son comunes.
 */

export const HALLAZGO_TEXT_MAX = 1000;

export type HallazgoItem = {
  key: string;
  label: string;
  /** Texto con el que inicia el campo; vacío si el formulario original no trae uno. */
  normal: string;
  soloMujeres?: boolean;
  /** Subtítulo del grupo al que pertenece (para separar visualmente, p. ej. tamizajes). */
  grupo?: string;
};

export type Hallazgos<K extends string = string> = {
  sistemas: Record<K, string>;
  /** YYYY-MM-DD */
  fecha: string | null;
};

const normalize = (text: string) => text.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-CO');

export function createHallazgosCatalog<const T extends ReadonlyArray<HallazgoItem>>(items: T) {
  type Key = T[number]['key'];
  const keys = items.map((item) => item.key) as Key[];
  const normalByKey = Object.fromEntries(items.map((item) => [item.key, item.normal])) as Record<Key, string>;

  const schema = z.object({
    sistemas: z
      .record(z.string(), z.unknown())
      .catch({})
      .default({})
      .transform(
        (raw) =>
          Object.fromEntries(
            keys.map((key) => {
              const value = raw[key];
              return [key, typeof value === 'string' ? value.trim().slice(0, HALLAZGO_TEXT_MAX) : normalByKey[key]];
            }),
          ) as Record<Key, string>,
      ),
    fecha: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .catch(null)
      .default(null),
  });

  /** Lectura tolerante: lo que falte o no sea texto toma el hallazgo normal. */
  const parse = (value: unknown): Hallazgos<Key> => schema.parse(typeof value === 'object' && value ? value : {});

  /** Distinto del texto normal (ignora mayúsculas y espacios): es lo que el médico registró como hallazgo. */
  const modificado = (key: Key, value: string) => normalize(value) !== normalize(normalByKey[key]);

  const visibles = (mujer: boolean) => items.filter((item) => mujer || !item.soloMujeres);

  const countModificados = (datos: Hallazgos<Key>, mujer: boolean) =>
    visibles(mujer).filter((item) => modificado(item.key as Key, datos.sistemas[item.key as Key])).length;

  return { items, keys, normalByKey, parse, defaults: parse({}), modificado, visibles, countModificados };
}

/** Vista común de cualquier catálogo (los métodos aceptan claves de texto para usarse de forma genérica). */
export interface HallazgosCatalog {
  items: ReadonlyArray<HallazgoItem>;
  normalByKey: Record<string, string>;
  modificado(key: string, value: string): boolean;
  visibles(mujer: boolean): ReadonlyArray<HallazgoItem>;
  countModificados(datos: Hallazgos, mujer: boolean): number;
}

export const saveHallazgosSchema = z.object({ datos: z.object({}).passthrough() }).strict();
