// /lib/react-pdf/blocks/TituloIIIPage1Block.tsx
import React from 'react';
import { View } from '@react-pdf/renderer';
import { Bar, RotText, Stack, Sub, T, Tbl, Td, Tr, TPL, BW, ROW_H } from '../components/Tpl';

type DictamenLike = {
  [key: string]: unknown;
  procedimientoPcl?: unknown;
  analisisOcupacional?: unknown;
  totalTitulo3?: unknown;
};

type Props = { dictamen: DictamenLike };

// Proporciones de columnas de la plantilla (pt sobre 552,4 de ancho).
const COL = { crit: 55, factor: 92.9, g: [106.4, 49.3, 84.3, 107.9, 57.9] } as const;
const NIVELES = ['0', 'I', 'II', 'III', 'IV'] as const;
const FACTOR_W = COL.factor + COL.g.reduce((sum, w) => sum + w, 0);
const DESC_W = COL.crit + COL.factor + COL.g[0] + COL.g[1] + COL.g[2];

// �o. convierte objetos/enums a texto útil
function toText(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object') {
    const record = v as Record<string, unknown>;
    const pick =
      record.nombre ??
      record.name ??
      record.label ??
      record.descripcion ??
      record.descripcionFactor ??
      record.descripcionCriterio ??
      record.titulo ??
      record.valor ??
      null;
    return pick != null ? String(pick) : String(v);
  }
  return String(v);
}

function normKey(raw: unknown): string {
  const s = String(raw ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return s
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

// �o. gravedad más robusta (también lee CLASE_x, números, etc.)
function normGravedad(v: unknown): '0' | 'I' | 'II' | 'III' | 'IV' | null {
  if (v == null || v === '') return null;

  const s0 = String(v)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // números 0..4
  if (s0 === '0') return '0';
  if (s0 === '1') return 'I';
  if (s0 === '2') return 'II';
  if (s0 === '3') return 'III';
  if (s0 === '4') return 'IV';

  // CLASE I / CLASE_II / CLASE-III
  const s = s0.replace(/[_\-]+/g, ' ');
  if (s.includes('CLASE')) {
    const t = s.replace(/\bCLASE\b/g, '').trim();
    if (t === '0' || t === 'CERO') return '0';
    if (t === 'I') return 'I';
    if (t === 'II') return 'II';
    if (t === 'III') return 'III';
    if (t === 'IV') return 'IV';
  }

  // romanos directos
  if (s0 === 'I') return 'I';
  if (s0 === 'II') return 'II';
  if (s0 === 'III') return 'III';
  if (s0 === 'IV') return 'IV';
  if (s0 === 'CERO') return '0';

  return null;
}

const RH = { sm: 18, md: 24, lg: 30, xl: 48 } as const;

type RowDef = { keys: string[]; label: string; h: number };
type GroupDef = { label: string; rot: string; rows: RowDef[] };
const K = (...raws: string[]) => raws.map(normKey);

// �o. Incluye la �?oúltima página�?� que mandaste (sensopercepción + motricidad)
const GROUPS: GroupDef[] = [
  {
    label: 'DESCRIPCI\u00d3N DE FACTORES PSICOL\u00d3GICOS',
    rot: 'DESCRIPCI\u00d3N DE\nFACTORES\nPSICOL\u00d3GICOS',
    rows: [
      { keys: K('ATENCION', 'ATENCI\u00d3N'), label: 'ATENCI\u00d3N', h: RH.sm },
      { keys: K('MEMORIA'), label: 'MEMORIA', h: RH.sm },
      {
        keys: K(
          'COMPRENSION_RESOLUCION_PROBLEMAS',
          'COMPRENSION Y RESOLUCION DE PROBLEMAS',
          'COMPRENSI\u00d3N Y RESOLUCI\u00d3N DE PROBLEMAS',
        ),
        label: 'COMPRENSI\u00d3N Y\nRESOLUCI\u00d3N DE\nPROBLEMAS',
        h: RH.lg,
      },
      {
        keys: K('INICIATIVA_AUTONOMIA', 'INICIATIVA Y AUTONOMIA', 'INICIATIVA Y AUTONOM\u00cdA'),
        label: 'INICIATIVA Y\nAUTONOM\u00cdA',
        h: RH.md,
      },
      { keys: K('OBSERVACION', 'OBSERVACI\u00d3N'), label: 'OBSERVACI\u00d3N', h: RH.sm },
      {
        keys: K('CAPACIDAD_ANALISIS_SINTESIS', 'CAPACIDAD DE ANALISIS Y SINTESIS', 'CAPACIDAD DE AN\u00c1LISIS Y S\u00cdNTESIS'),
        label: 'CAPACIDAD DE\nAN\u00c1LISIS Y\nS\u00cdNTESIS',
        h: RH.lg,
      },
      { keys: K('COMPRENSION_ESPACIAL', 'COMPRENSI\u00d3N ESPACIAL'), label: 'COMPRENSI\u00d3N\nESPACIAL', h: RH.md },
      { keys: K('ADAPTACION', 'ADAPTACI\u00d3N'), label: 'ADAPTACI\u00d3N', h: RH.sm },
      { keys: K('RELACIONES'), label: 'RELACIONES', h: RH.sm },
    ],
  },
  {
    label: 'DESCRIPCI\u00d3N DE RESPONSABILIDADES',
    rot: 'DESCRIPCI\u00d3N DE\nRESPONSABILIDADES',
    rows: [
      { keys: K('TOMA_DECISIONES', 'TOMA DE DECISIONES'), label: 'TOMA DE\nDECISIONES', h: RH.md },
      {
        keys: K('RESP_HERRAMIENTAS_EQUIPOS', 'RESPONSABILIDAD POR HERRAMIENTAS Y EQUIPOS'),
        label: 'RESPONSABILIDAD\nPOR\nHERRAMIENTAS Y\nEQUIPOS',
        h: RH.xl,
      },
      {
        keys: K('RESP_MATERIALES_PRODUCTOS', 'RESPONSABILIDAD POR MATERIALES Y PRODUCTO'),
        label: 'RESPONSABILIDAD\nPOR MATERIALES\nY PRODUCTO',
        h: RH.lg,
      },
      {
        keys: K(
          'RESP_INFORMACION_VALORES',
          'RESPONSABILIDAD POR INFORMACION O CUIDADOS DE VALORES',
          'RESPONSABILIDAD POR INFORMACI\u00d3N O CUIDADOS DE VALORES',
        ),
        label: 'RESPONSABILIDAD\nPOR\nINFORMACI\u00d3N O\nCUIDADOS DE\nVALORES',
        h: RH.lg,
      },
      {
        keys: K('RESP_TRABAJO_OTROS', 'RESPONSABILIDAD POR TRABAJO DEL OTRO', 'RESPONSABILIDAD TRABAJO DEL OTRO'),
        label: 'RESPONSABILIDAD\nPOR TRABAJO DEL\nOTRO',
        h: RH.md,
      },
      {
        keys: K('RESP_SEGURIDAD_OTROS', 'RESPONSABILIDAD POR LA SEGURIDAD DE OTROS', 'RESPONSABILIDAD SEGURIDAD DE OTROS'),
        label: 'RESPONSABILIDAD\nPOR LA\nSEGURIDAD DE\nOTROS',
        h: RH.lg,
      },
    ],
  },
  {
    label: 'DESCRIPCI\u00d3N DE COMUNICACI\u00d3N',
    rot: 'DESCRIPCI\u00d3N DE\nCOMUNICACI\u00d3N',
    rows: [
      { keys: K('COMUNICACION_ORAL', 'ORAL', 'COMUNICACION ORAL', 'COMUNICACI\u00d3N ORAL'), label: 'ORAL', h: RH.sm },
      { keys: K('COMUNICACION_GESTUAL', 'GESTUAL', 'COMUNICACION GESTUAL', 'COMUNICACI\u00d3N GESTUAL'), label: 'GESTUAL', h: RH.sm },
    ],
  },
  {
    label: 'DESCRIPCI\u00d3N DE CONOCIMIENTOS ACAD\u00c9MICOS',
    rot: 'DESCRIPCI\u00d3N DE\nCONOCIMIENTOS\nACAD\u00c9MICOS',
    rows: [
      { keys: K('LECTURA', 'CONOCIMIENTOS ACADEMICOS LECTURA', 'CONOCIMIENTOS ACAD\u00c9MICOS LECTURA'), label: 'LECTURA', h: RH.sm },
      { keys: K('ESCRITURA', 'CONOCIMIENTOS ACADEMICOS ESCRITURA', 'CONOCIMIENTOS ACAD\u00c9MICOS ESCRITURA'), label: 'ESCRITURA', h: RH.sm },
      { keys: K('MATEMATICAS', 'MATEM\u00c1TICAS', 'CONOCIMIENTOS ACADEMICOS MATEMATICAS', 'CONOCIMIENTOS ACAD\u00c9MICOS MATEM\u00c1TICAS'), label: 'MATEM\u00c1TICAS', h: RH.sm },
    ],
  },
  {
    label: 'DESCRIPCI\u00d3N DE SENSOPERCEPCI\u00d3N',
    rot: 'DESCRIPCI\u00d3N DE\nSENSOPERCEPCI\u00d3N',
    rows: [
      { keys: K('VISION', 'VISI\u00d3N'), label: 'VISI\u00d3N', h: RH.sm },
      { keys: K('PERCEPCION_COLOR', 'PERCEPCION DE COLORES', 'PERCEPCI\u00d3N DE COLORES'), label: 'PERCEPCI\u00d3N DE\nCOLORES', h: RH.sm },
      { keys: K('PERCEPCION_FORMA', 'PERCEPCION DE LA FORMA', 'PERCEPCI\u00d3N DE LA FORMA'), label: 'PERCEPCI\u00d3N DE LA\nFORMA', h: RH.sm },
      { keys: K('PERCEPCION_TAMANO', 'PERCEPCION DEL TAMANO', 'PERCEPCI\u00d3N DEL TAMA\u00d1O'), label: 'PERCEPCI\u00d3N DEL\nTAMA\u00d1O', h: RH.sm },
      { keys: K('PERCEPCION_TEMPORAL', 'PERCEPCION TEMPORAL', 'PERCEPCI\u00d3N TEMPORAL'), label: 'PERCEPCI\u00d3N\nTEMPORAL', h: RH.sm },
      { keys: K('ORIENTACION_ESPACIAL', 'ORIENTACION ESPACIAL', 'ORIENTACI\u00d3N ESPACIAL'), label: 'ORIENTACI\u00d3N\nESPACIAL', h: RH.sm },
      { keys: K('AUDICION', 'AUDICI\u00d3N'), label: 'AUDICI\u00d3N', h: RH.sm },
      { keys: K('UBICACION_FUENTE_SONORA', 'UBICACION DE FUENTE SONORA', 'UBICACI\u00d3N DE FUENTE SONORA'), label: 'UBICACI\u00d3N DE\nFUENTE SONORA', h: RH.md },
      { keys: K('DISCRIMINACION_AUDITIVA', 'DISCRIMINACION AUDITIVA', 'DISCRIMINACI\u00d3N AUDITIVA'), label: 'DISCRIMINACI\u00d3N\nAUDITIVA', h: RH.md },
      { keys: K('SENSIBILIDAD_SUPERFICIAL', 'SENSIBILIDAD SUPERFICIAL'), label: 'SENSIBILIDAD\nSUPERFICIAL', h: RH.md },
      { keys: K('ESTEROGNOSIA', 'ESTEREOGNOSIA'), label: 'ESTEREOGNOSIA', h: RH.sm },
      { keys: K('BAROGNOSIA'), label: 'BAROGNOSIA', h: RH.sm },
      {
        keys: K(
          'PROPIOCEPCION_SENTIDO_KINETICO',
          'PROPIOCEPCION Y SENTIDO KINETICO',
          'PROPIOCEPCI\u00d3N Y SENTIDO KIN\u00c9TICO',
          'PROPIOCEPCI\u00d3N Y SENTIDO KINETICO',
        ),
        label: 'PROPIOCEPCI\u00d3N Y\nSENTIDO KIN\u00c9TICO',
        h: RH.md,
      },
      { keys: K('OLFATO'), label: 'OLFATO', h: RH.sm },
      { keys: K('GUSTO'), label: 'GUSTO', h: RH.sm },
    ],
  },
  {
    label: 'MOTRICIDAD GRUESA',
    rot: 'MOTRICIDAD\nGRUESA',
    rows: [
      { keys: K('DESPLAZAMIENTO'), label: 'DESPLAZAMIENTO', h: RH.sm },
      { keys: K('TRANSPORTAR_PESO', 'TRANSPORTAR PESO'), label: 'TRANSPORTAR\nPESO', h: RH.md },
      { keys: K('ALCANZAR'), label: 'ALCANZAR', h: RH.sm },
      { keys: K('HALAR'), label: 'HALAR', h: RH.sm },
      { keys: K('EMPUJAR'), label: 'EMPUJAR', h: RH.sm },
      { keys: K('LEVANTAR'), label: 'LEVANTAR', h: RH.sm },
      { keys: K('POSICION_SENTADO', 'POSICION SENTADO', 'POSICI\u00d3N SENTADO'), label: 'POSICI\u00d3N\nSENTADO', h: RH.md },
      { keys: K('SUPLENCIA_SENTADO', 'SUPLENCIA POSICION SENTADO', 'SUPLENCIA POSICI\u00d3N SENTADO', 'SUPLENCIA'), label: 'SUPLENCIA', h: RH.sm },
      { keys: K('POSICION_DE_PIE', 'POSICION DE PIE', 'POSICI\u00d3N DE PIE'), label: 'POSICI\u00d3N DE PIE', h: RH.sm },
      { keys: K('SUPLENCIA_DE_PIE', 'SUPLENCIA POSICION DE PIE', 'SUPLENCIA POSICI\u00d3N DE PIE', 'SUPLENCIA'), label: 'SUPLENCIA', h: RH.sm },
      { keys: K('POSICION_RODILLAS', 'POSICION DE RODILLAS', 'POSICI\u00d3N DE RODILLAS'), label: 'POSICI\u00d3N DE\nRODILLAS', h: RH.md },
      {
        keys: K('POSICION_CUCLILLAS', 'POSICION EN CUNCLILLAS AGACHARSE', 'POSICI\u00d3N EN CUNCLILLAS (AGACHARSE)', 'POSICION EN CUNCLILLAS (AGACHARSE)'),
        label: 'POSICI\u00d3N EN\nCUNCLILLAS\n(AGACHARSE)',
        h: RH.lg,
      },
      { keys: K('EQUILIBRIO_ESTATICO', 'EQUILIBRIO ESTATICO', 'EQUILIBRIO EST\u00c1TICO'), label: 'EQUILIBRIO\nEST\u00c1TICO', h: RH.md },
    ],
  },
  {
    label: 'DESCRIPCI\u00d3N DE MOTRICIDAD FINA',
    rot: 'DESCRIPCI\u00d3N DE\nMOTRICIDAD FINA',
    rows: [
      { keys: K('AGARRE_MANO_LLENA', 'AGARRE A MANO LLENA'), label: 'AGARRE A MANO\nLLENA', h: RH.md },
      { keys: K('AGARRE_CILINDRICO', 'AGARRE CILINDRICO', 'AGARRE CIL\u00cdNDRICO'), label: 'AGARRE\nCIL\u00cdNDRICO', h: RH.md },
      { keys: K('DIGITO_DIGITAL', 'DIGITO DIGITAL', 'D\u00cdGITO-DIGITAL', 'DIGITO-DIGITAL'), label: 'D\u00cdGITO-DIGITAL', h: RH.sm },
      { keys: K('ENGANCHE'), label: 'ENGANCHE', h: RH.sm },
      { keys: K('PINZA_FINA', 'PINZA FINA'), label: 'PINZA FINA', h: RH.sm },
      { keys: K('PINZA_TRIPODE', 'PINZA TRIPODE', 'PINZA TR\u00cdPODE'), label: 'PINZA TR\u00cdPODE', h: RH.sm },
      { keys: K('PINZA_LATERAL', 'PINZA LATERAL'), label: 'PINZA LATERAL', h: RH.sm },
      { keys: K('EXACTITUD'), label: 'EXACTITUD', h: RH.sm },
      { keys: K('PRECISION', 'PRECISI\u00d3N'), label: 'PRECISI\u00d3N', h: RH.sm },
      { keys: K('PULSO'), label: 'PULSO', h: RH.sm },
      { keys: K('AGILIDAD'), label: 'AGILIDAD', h: RH.sm },
      { keys: K('DESTREZA_MANUAL', 'DESTREZA MANUAL'), label: 'DESTREZA\nMANUAL', h: RH.md },
      { keys: K('DESTREZA_DIGITAL', 'DESTREZA DIGITAL'), label: 'DESTREZA DIGITAL', h: RH.sm },
      { keys: K('ARMONIA', 'ARMON\u00cdA'), label: 'ARMON\u00cdA', h: RH.sm },
    ],
  },
];

// Las alturas son mínimos, no topes: la fila crece con el texto (sin overflow oculto).
const FACTOR_FONT_SIZE = 7.2;
const FACTOR_LINE_HEIGHT = 1.15;
const FACTOR_VERTICAL_PADDING = 6;

function rowMinHeight(row: RowDef) {
  const lines = row.label.split('\n').length;
  return Math.max(ROW_H, Math.ceil(lines * FACTOR_FONT_SIZE * FACTOR_LINE_HEIGHT + FACTOR_VERTICAL_PADDING));
}

// Largo (pt) que necesita el rótulo girado de un grupo, repartido en 2 renglones.
const ROT_FONT_SIZE = 7;
function rotLength(group: GroupDef) {
  const longest = Math.max(...group.rot.split('\n').map((line) => line.length));
  return Math.ceil(longest * ROT_FONT_SIZE * 0.66) + 10;
}

function groupMinHeight(group: GroupDef) {
  const rowsHeight = group.rows.reduce((total, row) => total + rowMinHeight(row), 0);
  return Math.max(rowsHeight, rotLength(group));
}

// Los grupos cortos van completos en una sola pieza. Los largos se parten en bloques de ~MAX_CHUNK_H
// (cada uno con su celda CRITERIOS y su rótulo) para aprovechar el espacio al final de la hoja en
// lugar de mover un grupo de 15 filas entero a la página siguiente.
const MAX_CHUNK_H = 90;

function splitGroup(group: GroupDef): GroupDef[] {
  const minChunkH = rotLength(group);
  const chunks: RowDef[][] = [];
  let current: RowDef[] = [];
  let height = 0;

  for (const row of group.rows) {
    current.push(row);
    height += rowMinHeight(row);
    if (height >= MAX_CHUNK_H) {
      chunks.push(current);
      current = [];
      height = 0;
    }
  }

  if (current.length) {
    // Un resto demasiado bajo para el rótulo girado se une al bloque anterior.
    if (chunks.length && height < minChunkH) chunks[chunks.length - 1].push(...current);
    else chunks.push(current);
  }

  return chunks.map((rows) => ({ ...group, rows }));
}

const PIECES = GROUPS.flatMap(splitGroup);

export function TituloIIIPage1Block({ dictamen }: Props) {
  const proc = String(dictamen?.procedimientoPcl ?? 'A').toUpperCase() === 'B' ? 'B' : 'A';

  const map = new Map<string, '0' | 'I' | 'II' | 'III' | 'IV'>();
  const arr = Array.isArray(dictamen?.analisisOcupacional) ? dictamen.analisisOcupacional : [];

    const hasTitulo3 = (() => {
    const v = dictamen?.totalTitulo3;
    if (v == null) return false;

    if (typeof v === 'number') return Number.isFinite(v);
    if (typeof v === 'string') return Number.isFinite(Number(v));

    if (typeof v === 'object') {
      const valueObject = v as { toNumber?: () => number };
      if (typeof valueObject.toNumber === 'function') {
        const n = valueObject.toNumber();
        return Number.isFinite(n);
      }
      const n = Number(String(v));
      return Number.isFinite(n);
    }

    return false;
  })();

  // �o. Reglas:
  // - B: siempre "NA"
  // - A: si proc === 'A' y hay totalTitulo3 => "X", si no => "NA"
  // - si proc === 'B', A queda en blanco (no aplica)
  const cellA = proc === 'A' ? (hasTitulo3 ? 'X' : 'NA') : ' ';
  const cellB = 'NA';

  // �o. añade keys robustas (factor/criterio invertidos, combos, y �?opartes�?� si vienen con separadores)
  const addKeys = (raw: unknown, g: '0' | 'I' | 'II' | 'III' | 'IV') => {
    const t = toText(raw);
    if (!t) return;

    const k = normKey(t);
    if (k) map.set(k, g);

    // por si viene como "GRUPO: FACTOR" o "GRUPO - FACTOR"
    const parts = t
      .split(/[:\/\|\-]+/g)
      .map((p) => p.trim())
      .filter((p) => p.length >= 3);

    for (const p of parts) {
      const kp = normKey(p);
      if (kp) map.set(kp, g);
    }
  };

  for (const it of arr) {
    const g = normGravedad(
      it?.gravedad ??
        it?.grado ??
        it?.clase ??
        it?.nivel ??
        it?.valorGravedad ??
        it?.valor ??
        it?.value ??
        it?.resultado,
    );
    if (!g) continue;

    const factorRaw = it?.factor ?? it?.factorNombre ?? it?.nombreFactor ?? it?.descripcionFactor ?? it?.name ?? it?.label;
    const criterioRaw = it?.criterio ?? it?.criterioNombre ?? it?.grupo ?? it?.categoria ?? it?.seccion;

    const factorTxt = toText(factorRaw);
    const criterioTxt = toText(criterioRaw);

    // 1) normal (factor)
    addKeys(factorTxt, g);

    // 2) por si viene invertido (a veces �?ofactor�?� está en criterio)
    addKeys(criterioTxt, g);

    // 3) combinaciones en ambos órdenes
    if (criterioTxt && factorTxt) {
      addKeys(`${criterioTxt} ${factorTxt}`, g);
      addKeys(`${factorTxt} ${criterioTxt}`, g);
    }
  }

  const getRowValue = (keys: string[]) => {
    for (const k of keys) {
      const v = map.get(k);
      if (v) return v;
    }
    return null;
  };

  const mark = (keys: string[], col: '0' | 'I' | 'II' | 'III' | 'IV') => (getRowValue(keys) === col ? 'X' : ' ');

  // SUMATORIA (cuenta X por columna)
  const sum = { '0': 0, I: 0, II: 0, III: 0, IV: 0 } as const;
  const sumMutable: Record<'0' | 'I' | 'II' | 'III' | 'IV', number> = { ...sum };

  for (const g of GROUPS) {
    for (const r of g.rows) {
      const v = getRowValue(r.keys);
      if (v) sumMutable[v] += 1;
    }
  }

  const renderGroup = (group: GroupDef, index: number) => {
    const minH = groupMinHeight(group);

    // Un grupo = una sola pieza (wrap=false): si no cabe al final de la hoja pasa completo a la
    // siguiente. La celda CRITERIOS y las filas de factores comparten el mismo contenedor, por lo
    // que el "rowspan" siempre coincide con el número de filas.
    return (
      <View
        key={`${group.label}-${index}`}
        wrap={false}
        style={{
          flexDirection: 'row',
          borderTopWidth: BW,
          borderBottomWidth: BW,
          borderRightWidth: BW,
          borderColor: TPL.ink,
          marginTop: index === 0 ? 0 : -BW,
          minHeight: minH,
        }}
      >
        <Td w={COL.crit} total={COL.crit + FACTOR_W} bg={TPL.pale} px={0} style={{ position: 'relative' }}>
          <RotText len={minH - 8} size={ROT_FONT_SIZE}>{group.rot}</RotText>
        </Td>

        <Stack w={FACTOR_W} total={COL.crit + FACTOR_W}>
          {group.rows.map((row, rowIndex) => (
            <Sub key={`${group.label}-${row.label}-${rowIndex}`} first={rowIndex === 0} minH={rowMinHeight(row)}>
              <Td w={COL.factor} bg={TPL.pale} px={2}>
                <T size={FACTOR_FONT_SIZE}>{row.label}</T>
              </Td>
              {NIVELES.map((level, levelIndex) => (
                <Td key={level} w={COL.g[levelIndex]} bg={TPL.white}>
                  <T b size={8.2}>{mark(row.keys, level)}</T>
                </Td>
              ))}
            </Sub>
          ))}
        </Stack>
      </View>
    );
  };

  const renderLead = () => (
    <>
      <Bar bg={TPL.navy} color={TPL.white} minH={16} size={8.2}>TITULO III</Bar>

      <Tr minH={34}>
        <Td w={DESC_W} bg={TPL.pale} px={6}>
          <T align="left" size={7.6}>
            TITULO III: HERRAMIENTA PARA LA EVALUACIÓN DEL PUESTO DE TRABAJO, PERFIL DE DISCAPACIDAD, COMPETENCIA Y RESTRICCIONES
            PARA LA ACTIVIDAD COMO EDUCADOR
          </T>
        </Td>
        <Stack w={COL.g[3]}>
          <Sub first minH={14}><Td w={1} bg={TPL.pale}><T>A</T></Td></Sub>
          <Sub minH={18}><Td w={1} bg={TPL.pale}><T b size={8.2}>{cellA}</T></Td></Sub>
        </Stack>
        <Stack w={COL.g[4]}>
          <Sub first minH={14}><Td w={1} bg={TPL.pale}><T>B</T></Td></Sub>
          <Sub minH={18}><Td w={1} bg={TPL.pale}><T b size={8.2}>{cellB}</T></Td></Sub>
        </Stack>
      </Tr>

      <Tr minH={22}>
        <Td w={COL.crit + COL.factor} bg={TPL.pale}>
          <T size={7}>ANÁLISIS OCUPACIONAL DEL USUARIO</T>
        </Td>
        <Td w={COL.g.reduce((sum, w) => sum + w, 0)} bg={TPL.pale}>
          <T>GRAVEDAD</T>
        </Td>
      </Tr>

      <Tr minH={16}>
        <Td w={COL.crit} bg={TPL.pale}><T>CRITERIOS</T></Td>
        <Td w={COL.factor} bg={TPL.pale}><T>FACTORES</T></Td>
        {NIVELES.map((level, levelIndex) => (
          <Td key={level} w={COL.g[levelIndex]} bg={TPL.pale}><T>{level}</T></Td>
        ))}
      </Tr>
    </>
  );

  return (
    <Tbl>
      {/* Barra + encabezado + primer grupo: nunca quedan solos al final de la hoja */}
      <View wrap={false}>
        {renderLead()}
        {renderGroup(PIECES[0], 1)}
      </View>

      {PIECES.slice(1).map((group, index) => renderGroup(group, index + 1))}

      <View wrap={false}>
        <Tr minH={16}>
          <Td w={COL.crit + COL.factor} bg={TPL.white}><T b>SUMATORIA</T></Td>
          {NIVELES.map((level, levelIndex) => (
            <Td key={level} w={COL.g[levelIndex]} bg={TPL.white}>
              <T>{sumMutable[level] ? String(sumMutable[level]) : ''}</T>
            </Td>
          ))}
        </Tr>
      </View>
    </Tbl>
  );
}
