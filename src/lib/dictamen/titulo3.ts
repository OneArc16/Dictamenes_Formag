// src/lib/dictamen/titulo3.ts

export type GravedadAnalisisKey = 'CERO' | 'I' | 'II' | 'III' | 'IV';

export const GRAVEDAD_ORDER: GravedadAnalisisKey[] = ['CERO', 'I', 'II', 'III', 'IV'];

export const GRAVEDAD_LABEL: Record<GravedadAnalisisKey, string> = {
  CERO: '0',
  I: 'I',
  II: 'II',
  III: 'III',
  IV: 'IV',
};

export const GRAVEDAD_PORCENTAJE: Record<GravedadAnalisisKey, number> = {
  CERO: 0,
  I: 8,
  II: 16,
  III: 24,
  IV: 32,
};

export type FactorKey =
  // Psicológicos
  | 'ATENCION'
  | 'MEMORIA'
  | 'COMPRENSION_RESOLUCION_PROBLEMAS'
  | 'INICIATIVA_AUTONOMIA'
  | 'OBSERVACION'
  | 'CAPACIDAD_ANALISIS_SINTESIS'
  | 'COMPRENSION_ESPACIAL'
  | 'ADAPTACION'
  | 'RELACIONES'
  | 'TOMA_DECISIONES'
  // Responsabilidad
  | 'RESP_HERRAMIENTAS_EQUIPOS'
  | 'RESP_MATERIALES_PRODUCTOS'
  | 'RESP_INFORMACION_VALORES'
  | 'RESP_TRABAJO_OTROS'
  | 'RESP_SEGURIDAD_OTROS'
  // Comunicación
  | 'COMUNICACION_ORAL'
  | 'COMUNICACION_GESTUAL'
  // Conocimientos académicos
  | 'LECTURA'
  | 'ESCRITURA'
  | 'MATEMATICAS'
  // Sensopercepción
  | 'VISION'
  | 'PERCEPCION_COLOR'
  | 'PERCEPCION_FORMA'
  | 'PERCEPCION_TAMANO'
  | 'PERCEPCION_TEMPORAL'
  | 'ORIENTACION_ESPACIAL'
  | 'AUDICION'
  | 'UBICACION_FUENTE_SONORA'
  | 'DISCRIMINACION_AUDITIVA'
  | 'SENSIBILIDAD_SUPERFICIAL'
  | 'ESTEROGNOSIA'
  | 'BAROGNOSIA'
  | 'PROPIOCEPCION_SENTIDO_KINETICO'
  | 'OLFATO'
  | 'GUSTO'
  // Motricidad gruesa
  | 'DESPLAZAMIENTO'
  | 'TRANSPORTAR_PESO'
  | 'ALCANZAR'
  | 'HALAR'
  | 'EMPUJAR'
  | 'LEVANTAR'
  | 'POSICION_SENTADO'
  | 'SUPLENCIA_SENTADO'
  | 'POSICION_DE_PIE'
  | 'SUPLENCIA_DE_PIE'
  | 'POSICION_RODILLAS'
  | 'POSICION_CUCLILLAS'
  | 'EQUILIBRIO_ESTATICO'
  // Motricidad fina
  | 'AGARRE_MANO_LLENA'
  | 'AGARRE_CILINDRICO'
  | 'DIGITO_DIGITAL'
  | 'ENGANCHE'
  | 'PINZA_FINA'
  | 'PINZA_TRIPODE'
  | 'PINZA_LATERAL'
  | 'EXACTITUD'
  | 'PRECISION'
  | 'PULSO'
  | 'AGILIDAD'
  | 'DESTREZA_MANUAL'
  | 'DESTREZA_DIGITAL'
  | 'ARMONIA';

export const FACTOR_LABELS: Record<FactorKey, string> = {
  // Psicológicos
  ATENCION: 'Atención',
  MEMORIA: 'Memoria',
  COMPRENSION_RESOLUCION_PROBLEMAS: 'Comprensión y resolución de problemas',
  INICIATIVA_AUTONOMIA: 'Iniciativa / Autonomía',
  OBSERVACION: 'Observación',
  CAPACIDAD_ANALISIS_SINTESIS: 'Capacidad de análisis y síntesis',
  COMPRENSION_ESPACIAL: 'Comprensión espacial',
  ADAPTACION: 'Adaptación',
  RELACIONES: 'Relaciones',
  TOMA_DECISIONES: 'Toma de decisiones',

  // Responsabilidad
  RESP_HERRAMIENTAS_EQUIPOS: 'Responsabilidad por herramientas y equipos',
  RESP_MATERIALES_PRODUCTOS: 'Responsabilidad por materiales y productos',
  RESP_INFORMACION_VALORES: 'Responsabilidad por información y/o cuidado de valores',
  RESP_TRABAJO_OTROS: 'Responsabilidad por el trabajo de otros',
  RESP_SEGURIDAD_OTROS: 'Responsabilidad por la seguridad de otros',

  // Comunicación
  COMUNICACION_ORAL: 'Comunicación oral',
  COMUNICACION_GESTUAL: 'Comunicación gestual',

  // Conocimientos académicos
  LECTURA: 'Lectura',
  ESCRITURA: 'Escritura',
  MATEMATICAS: 'Matemáticas',

  // Sensopercepción
  VISION: 'Visión',
  PERCEPCION_COLOR: 'Percepción del color',
  PERCEPCION_FORMA: 'Percepción de la forma',
  PERCEPCION_TAMANO: 'Percepción del tamaño',
  PERCEPCION_TEMPORAL: 'Percepción temporal',
  ORIENTACION_ESPACIAL: 'Orientación espacial',
  AUDICION: 'Audición',
  UBICACION_FUENTE_SONORA: 'Ubicación de la fuente sonora',
  DISCRIMINACION_AUDITIVA: 'Discriminación auditiva',
  SENSIBILIDAD_SUPERFICIAL: 'Sensibilidad superficial',
  ESTEROGNOSIA: 'Esterognosia',
  BAROGNOSIA: 'Barognosia',
  PROPIOCEPCION_SENTIDO_KINETICO: 'Propiocepción y sentido kinético',
  OLFATO: 'Olfato',
  GUSTO: 'Gusto',

  // Motricidad gruesa
  DESPLAZAMIENTO: 'Desplazamiento',
  TRANSPORTAR_PESO: 'Transportar peso',
  ALCANZAR: 'Alcanzar',
  HALAR: 'Halar',
  EMPUJAR: 'Empujar',
  LEVANTAR: 'Levantar',
  POSICION_SENTADO: 'Posición sentado',
  SUPLENCIA_SENTADO: 'Suplencia (sentado)',
  POSICION_DE_PIE: 'Posición de pie',
  SUPLENCIA_DE_PIE: 'Suplencia (de pie)',
  POSICION_RODILLAS: 'Posición de rodillas',
  POSICION_CUCLILLAS: 'Posición en cuclillas (agacharse)',
  EQUILIBRIO_ESTATICO: 'Equilibrio estático',

  // Motricidad fina
  AGARRE_MANO_LLENA: 'Agarre a mano llena',
  AGARRE_CILINDRICO: 'Agarre cilíndrico',
  DIGITO_DIGITAL: 'Dígito-digital',
  ENGANCHE: 'Enganche',
  PINZA_FINA: 'Pinza fina',
  PINZA_TRIPODE: 'Pinza trípode',
  PINZA_LATERAL: 'Pinza lateral',
  EXACTITUD: 'Exactitud',
  PRECISION: 'Precisión',
  PULSO: 'Pulso',
  AGILIDAD: 'Agilidad',
  DESTREZA_MANUAL: 'Destreza manual',
  DESTREZA_DIGITAL: 'Destreza digital',
  ARMONIA: 'Armonía',
};

export const FACTOR_GROUPS: Array<{
  key: string;
  label: string;
  factors: FactorKey[];
}> = [
  {
    key: 'psicologicos',
    label: 'Factores psicológicos',
    factors: [
      'ATENCION',
      'MEMORIA',
      'COMPRENSION_RESOLUCION_PROBLEMAS',
      'INICIATIVA_AUTONOMIA',
      'OBSERVACION',
      'CAPACIDAD_ANALISIS_SINTESIS',
      'COMPRENSION_ESPACIAL',
      'ADAPTACION',
      'RELACIONES',
      'TOMA_DECISIONES',
    ],
  },
  {
    key: 'responsabilidad',
    label: 'Responsabilidad',
    factors: [
      'RESP_HERRAMIENTAS_EQUIPOS',
      'RESP_MATERIALES_PRODUCTOS',
      'RESP_INFORMACION_VALORES',
      'RESP_TRABAJO_OTROS',
      'RESP_SEGURIDAD_OTROS',
    ],
  },
  {
    key: 'comunicacion',
    label: 'Comunicación',
    factors: ['COMUNICACION_ORAL', 'COMUNICACION_GESTUAL'],
  },
  {
    key: 'conocimientos',
    label: 'Conocimientos académicos',
    factors: ['LECTURA', 'ESCRITURA', 'MATEMATICAS'],
  },
  {
    key: 'sensopercepcion',
    label: 'Sensopercepción',
    factors: [
      'VISION',
      'PERCEPCION_COLOR',
      'PERCEPCION_FORMA',
      'PERCEPCION_TAMANO',
      'PERCEPCION_TEMPORAL',
      'ORIENTACION_ESPACIAL',
      'AUDICION',
      'UBICACION_FUENTE_SONORA',
      'DISCRIMINACION_AUDITIVA',
      'SENSIBILIDAD_SUPERFICIAL',
      'ESTEROGNOSIA',
      'BAROGNOSIA',
      'PROPIOCEPCION_SENTIDO_KINETICO',
      'OLFATO',
      'GUSTO',
    ],
  },
  {
    key: 'motricidad_gruesa',
    label: 'Motricidad gruesa',
    factors: [
      'DESPLAZAMIENTO',
      'TRANSPORTAR_PESO',
      'ALCANZAR',
      'HALAR',
      'EMPUJAR',
      'LEVANTAR',
      'POSICION_SENTADO',
      'SUPLENCIA_SENTADO',
      'POSICION_DE_PIE',
      'SUPLENCIA_DE_PIE',
      'POSICION_RODILLAS',
      'POSICION_CUCLILLAS',
      'EQUILIBRIO_ESTATICO',
    ],
  },
  {
    key: 'motricidad_fina',
    label: 'Motricidad fina',
    factors: [
      'AGARRE_MANO_LLENA',
      'AGARRE_CILINDRICO',
      'DIGITO_DIGITAL',
      'ENGANCHE',
      'PINZA_FINA',
      'PINZA_TRIPODE',
      'PINZA_LATERAL',
      'EXACTITUD',
      'PRECISION',
      'PULSO',
      'AGILIDAD',
      'DESTREZA_MANUAL',
      'DESTREZA_DIGITAL',
      'ARMONIA',
    ],
  },
];

export type Titulo3Item = {
  factor: FactorKey;
  gravedad: GravedadAnalisisKey;
};

// redondeo simple a 2 decimales
export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeCounts(items: Titulo3Item[]) {
  const counts: Record<GravedadAnalisisKey, number> = {
    CERO: 0,
    I: 0,
    II: 0,
    III: 0,
    IV: 0,
  };

  for (const it of items) {
    counts[it.gravedad] = (counts[it.gravedad] ?? 0) + 1;
  }

  return counts;
}

/**
 * Regla práctica para empates (sin cambiar schema):
 * - Si hay empate en la mayor sumatoria, se elige la clase MÁS ALTA entre las empatadas
 *   (más severa). Además devolvemos info del empate para que UI lo muestre.
 */
export function resolveClaseFinal(counts: Record<GravedadAnalisisKey, number>) {
  const entries = GRAVEDAD_ORDER.map((g) => [g, counts[g] ?? 0] as const);
  const max = Math.max(...entries.map(([, v]) => v));

  if (max <= 0) {
    return { claseFinal: null as GravedadAnalisisKey | null, empate: false, empatadas: [] as GravedadAnalisisKey[] };
  }

  const empatadas = entries.filter(([, v]) => v === max).map(([g]) => g);
  const empate = empatadas.length > 1;

  // elegimos la más alta (última en el orden)
  const claseFinal = empatadas.sort((a, b) => GRAVEDAD_ORDER.indexOf(a) - GRAVEDAD_ORDER.indexOf(b))[empatadas.length - 1];

  return { claseFinal, empate, empatadas };
}

export function computeTitulo3Summary(params: {
  basePcl: number; // T1 + T2
  items: Titulo3Item[];
}) {
  const { basePcl, items } = params;

  const counts = computeCounts(items);
  const { claseFinal, empate, empatadas } = resolveClaseFinal(counts);

  const porcentajeAdd = claseFinal ? GRAVEDAD_PORCENTAJE[claseFinal] : 0;
  const incrementoTitulo3 = claseFinal ? round2((basePcl * porcentajeAdd) / 100) : 0;
  const pclFinal = round2(basePcl + incrementoTitulo3);

  return {
    basePcl: round2(basePcl),
    counts,
    claseFinal,
    empate,
    empatadas,
    porcentajeAdd,
    incrementoTitulo3,
    pclFinal,
  };
}
