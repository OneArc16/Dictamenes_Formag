// /lib/react-pdf/blocks/TituloIIIPage1Block.tsx
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = { dictamen: any };
const V: any = View;

const BW = 1;
const BC = pdfTheme.colors.border;

const COLOR = {
  bar: '#1F4E79',
  head: '#D9E1F2',
  left: '#D9E1F2',
  white: '#FFFFFF',
};

const COL = {
  criterio: 3,
  factor: 5,
  g: 3, // cada columna 0..IV
} as const;

const G_COLS = 5;
const TOTAL = COL.criterio + COL.factor + COL.g * G_COLS; // 23

// flex “estable” (evita redondeos por %)
const flexW = (n: number) => ({ flexGrow: n, flexShrink: 1, flexBasis: 0 });

// ✅ convierte objetos/enums a texto útil
function toText(v: any): string | null {
  if (v == null) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object') {
    const pick =
      v.nombre ??
      v.name ??
      v.label ??
      v.descripcion ??
      v.descripcionFactor ??
      v.descripcionCriterio ??
      v.titulo ??
      v.valor ??
      null;
    return pick != null ? String(pick) : String(v);
  }
  return String(v);
}

function normKey(raw: any): string {
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

// ✅ gravedad más robusta (también lee CLASE_x, números, etc.)
function normGravedad(v: any): '0' | 'I' | 'II' | 'III' | 'IV' | null {
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
type GroupDef = { label: string; rows: RowDef[] };
const K = (...raws: string[]) => raws.map(normKey);

// ✅ Incluye la “última página” que mandaste (sensopercepción + motricidad)
const GROUPS: GroupDef[] = [
  {
    label: 'DESCRIPCIÓN DE FACTORES PSICOLÓGICOS',
    rows: [
      { keys: K('ATENCION', 'ATENCIÓN'), label: 'ATENCIÓN', h: RH.sm },
      { keys: K('MEMORIA'), label: 'MEMORIA', h: RH.sm },
      {
        keys: K(
          'COMPRENSION_RESOLUCION_PROBLEMAS',
          'COMPRENSION Y RESOLUCION DE PROBLEMAS',
          'COMPRENSIÓN Y RESOLUCIÓN DE PROBLEMAS',
        ),
        label: 'COMPRENSIÓN Y\nRESOLUCIÓN DE\nPROBLEMAS',
        h: RH.lg,
      },
      {
        keys: K('INICIATIVA_AUTONOMIA', 'INICIATIVA Y AUTONOMIA', 'INICIATIVA Y AUTONOMÍA'),
        label: 'INICIATIVA Y\nAUTONOMÍA',
        h: RH.md,
      },
      { keys: K('OBSERVACION', 'OBSERVACIÓN'), label: 'OBSERVACIÓN', h: RH.sm },
      {
        keys: K('CAPACIDAD_ANALISIS_SINTESIS', 'CAPACIDAD DE ANALISIS Y SINTESIS', 'CAPACIDAD DE ANÁLISIS Y SÍNTESIS'),
        label: 'CAPACIDAD DE\nANÁLISIS Y\nSÍNTESIS',
        h: RH.lg,
      },
      { keys: K('COMPRENSION_ESPACIAL', 'COMPRENSIÓN ESPACIAL'), label: 'COMPRENSIÓN\nESPACIAL', h: RH.md },
      { keys: K('ADAPTACION', 'ADAPTACIÓN'), label: 'ADAPTACIÓN', h: RH.sm },
      { keys: K('RELACIONES'), label: 'RELACIONES', h: RH.sm },
    ],
  },

  {
    label: 'DESCRIPCIÓN DE RESPONSABILIDADES',
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
          'RESPONSABILIDAD POR INFORMACIÓN O CUIDADOS DE VALORES',
        ),
        label: 'RESPONSABILIDAD\nPOR\nINFORMACIÓN O\nCUIDADOS DE\nVALORES',
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
    label: 'DESCRIPCIÓN DE COMUNICACIÓN',
    rows: [
      { keys: K('COMUNICACION_ORAL', 'ORAL', 'COMUNICACION ORAL', 'COMUNICACIÓN ORAL'), label: 'ORAL', h: RH.sm },
      { keys: K('COMUNICACION_GESTUAL', 'GESTUAL', 'COMUNICACION GESTUAL', 'COMUNICACIÓN GESTUAL'), label: 'GESTUAL', h: RH.sm },
    ],
  },

  {
    label: 'DESCRIPCIÓN DE CONOCIMIENTOS ACADÉMICOS',
    rows: [
      { keys: K('LECTURA', 'CONOCIMIENTOS ACADEMICOS LECTURA', 'CONOCIMIENTOS ACADÉMICOS LECTURA'), label: 'LECTURA', h: RH.sm },
      { keys: K('ESCRITURA', 'CONOCIMIENTOS ACADEMICOS ESCRITURA', 'CONOCIMIENTOS ACADÉMICOS ESCRITURA'), label: 'ESCRITURA', h: RH.sm },
      { keys: K('MATEMATICAS', 'MATEMÁTICAS', 'CONOCIMIENTOS ACADEMICOS MATEMATICAS', 'CONOCIMIENTOS ACADÉMICOS MATEMÁTICAS'), label: 'MATEMATICAS', h: RH.sm },
    ],
  },

  {
    label: 'DESCRIPCIÓN DE SENSOPERCEPCIÓN',
    rows: [
      { keys: K('VISION', 'VISIÓN'), label: 'VISIÓN', h: RH.sm },
      { keys: K('PERCEPCION_COLOR', 'PERCEPCION DE COLORES', 'PERCEPCIÓN DE COLORES'), label: 'PERCEPCIÓN DE\nCOLORES', h: RH.sm },
      { keys: K('PERCEPCION_FORMA', 'PERCEPCION DE LA FORMA', 'PERCEPCIÓN DE LA FORMA'), label: 'PERCEPCIÓN DE LA\nFORMA', h: RH.sm },
      { keys: K('PERCEPCION_TAMANO', 'PERCEPCION DEL TAMANO', 'PERCEPCIÓN DEL TAMAÑO'), label: 'PERCEPCIÓN DEL\nTAMAÑO', h: RH.sm },
      { keys: K('PERCEPCION_TEMPORAL', 'PERCEPCION TEMPORAL', 'PERCEPCIÓN TEMPORAL'), label: 'PERCEPCIÓN\nTEMPORAL', h: RH.sm },
      { keys: K('ORIENTACION_ESPACIAL', 'ORIENTACION ESPACIAL', 'ORIENTACIÓN ESPACIAL'), label: 'ORIENTACIÓN\nESPACIAL', h: RH.sm },
      { keys: K('AUDICION', 'AUDICIÓN'), label: 'AUDICIÓN', h: RH.sm },
      { keys: K('UBICACION_FUENTE_SONORA', 'UBICACION DE FUENTE SONORA', 'UBICACIÓN DE FUENTE SONORA'), label: 'UBICACIÓN DE\nFUENTE SONORA', h: RH.md },
      { keys: K('DISCRIMINACION_AUDITIVA', 'DISCRIMINACION AUDITIVA', 'DISCRIMINACIÓN AUDITIVA'), label: 'DISCRIMINACIÓN\nAUDITIVA', h: RH.md },
      { keys: K('SENSIBILIDAD_SUPERFICIAL', 'SENSIBILIDAD SUPERFICIAL'), label: 'SENSIBILIDAD\nSUPERFICIAL', h: RH.md },

      // ✅ OJO: enum = ESTEROGNOSIA, en tu UI estabas con ESTEREOGNOSIA
      { keys: K('ESTEROGNOSIA', 'ESTEREOGNOSIA'), label: 'ESTEREOGNOSIA', h: RH.sm },
      { keys: K('BAROGNOSIA'), label: 'BAROGNOSIA', h: RH.sm },
      {
        keys: K(
          'PROPIOCEPCION_SENTIDO_KINETICO',
          'PROPIOCEPCION Y SENTIDO KINETICO',
          'PROPIOCEPCIÓN Y SENTIDO KINÉTICO',
          'PROPIOCEPCIÓN Y SENTIDO KINETICO',
        ),
        label: 'PROPIOCEPCIÓN Y\nSENTIDO KINETICO',
        h: RH.md,
      },
      { keys: K('OLFATO'), label: 'OLFATO', h: RH.sm },
      { keys: K('GUSTO'), label: 'GUSTO', h: RH.sm },
    ],
  },

  {
    label: 'MOTRICIDAD GRUESA',
    rows: [
      { keys: K('DESPLAZAMIENTO'), label: 'DESPLAZAMIENTO', h: RH.sm },
      { keys: K('TRANSPORTAR_PESO', 'TRANSPORTAR PESO'), label: 'TRANSPORTAR\nPESO', h: RH.md },

      // ✅ ESTABA FALTANDO (existe en tu enum)
      { keys: K('ALCANZAR'), label: 'ALCANZAR', h: RH.sm },

      { keys: K('HALAR'), label: 'HALAR', h: RH.sm },
      { keys: K('EMPUJAR'), label: 'EMPUJAR', h: RH.sm },
      { keys: K('LEVANTAR'), label: 'LEVANTAR', h: RH.sm },
      { keys: K('POSICION_SENTADO', 'POSICION SENTADO', 'POSICIÓN SENTADO'), label: 'POSICIÓN\nSENTADO', h: RH.md },

      // ✅ evita ambigüedad: NO pongas "SUPLENCIA" sola primero
      { keys: K('SUPLENCIA_SENTADO', 'SUPLENCIA POSICION SENTADO', 'SUPLENCIA POSICIÓN SENTADO', 'SUPLENCIA'), label: 'SUPLENCIA', h: RH.sm },

      { keys: K('POSICION_DE_PIE', 'POSICION DE PIE', 'POSICIÓN DE PIE'), label: 'POSICIÓN DE PIE', h: RH.sm },
      { keys: K('SUPLENCIA_DE_PIE', 'SUPLENCIA POSICION DE PIE', 'SUPLENCIA POSICIÓN DE PIE', 'SUPLENCIA'), label: 'SUPLENCIA', h: RH.sm },

      { keys: K('POSICION_RODILLAS', 'POSICION DE RODILLAS', 'POSICIÓN DE RODILLAS'), label: 'POSICIÓN DE\nRODILLAS', h: RH.md },
      {
        keys: K('POSICION_CUCLILLAS', 'POSICION EN CUNCLILLAS AGACHARSE', 'POSICIÓN EN CUNCLILLAS (AGACHARSE)', 'POSICION EN CUNCLILLAS (AGACHARSE)'),
        label: 'POSICIÓN EN\nCUNCLILLAS\n(AGACHARSE)',
        h: RH.lg,
      },
      { keys: K('EQUILIBRIO_ESTATICO', 'EQUILIBRIO ESTATICO', 'EQUILIBRIO ESTÁTICO'), label: 'EQUILIBRIO\nESTÁTICO', h: RH.md },
    ],
  },

  {
    label: 'DESCRIPCIÓN DE MOTRICIDAD FINA',
    rows: [
      { keys: K('AGARRE_MANO_LLENA', 'AGARRE A MANO LLENA'), label: 'AGARRE A MANO\nLLENA', h: RH.md },
      { keys: K('AGARRE_CILINDRICO', 'AGARRE CILINDRICO', 'AGARRE CILÍNDRICO'), label: 'AGARRE\nCILINDRICO', h: RH.md },
      { keys: K('DIGITO_DIGITAL', 'DIGITO DIGITAL', 'DÍGITO-DIGITAL', 'DIGITO-DIGITAL'), label: 'DIGITO-DIGITAL', h: RH.sm },
      { keys: K('ENGANCHE'), label: 'ENGANCHE', h: RH.sm },
      { keys: K('PINZA_FINA', 'PINZA FINA'), label: 'PINZA FINA', h: RH.sm },
      { keys: K('PINZA_TRIPODE', 'PINZA TRIPODE', 'PINZA TRÍPODE'), label: 'PINZA TRIPODE', h: RH.sm },
      { keys: K('PINZA_LATERAL', 'PINZA LATERAL'), label: 'PINZA LATERAL', h: RH.sm },
      { keys: K('EXACTITUD'), label: 'EXACTITUD', h: RH.sm },
      { keys: K('PRECISION', 'PRECISIÓN'), label: 'PRECISIÓN', h: RH.sm },
      { keys: K('PULSO'), label: 'PULSO', h: RH.sm },
      { keys: K('AGILIDAD'), label: 'AGILIDAD', h: RH.sm },
      { keys: K('DESTREZA_MANUAL', 'DESTREZA MANUAL'), label: 'DESTREZA\nMANUAL', h: RH.md },
      { keys: K('DESTREZA_DIGITAL', 'DESTREZA DIGITAL'), label: 'DESTREZA DIGITAL', h: RH.sm },
      { keys: K('ARMONIA', 'ARMONÍA'), label: 'ARMONIA', h: RH.sm },
    ],
  },
];

// CHUNKS (para evitar “huecos”)
const CHUNK_FIRST_H = 48; // deja el primero grande para que el texto rotado quepa
const CHUNK_OTHER_H = 60;  // los siguientes más pequeños para aprovechar espacio

function chunkRows(rows: RowDef[], firstMaxH = CHUNK_FIRST_H, otherMaxH = CHUNK_OTHER_H) {
  const out: RowDef[][] = [];
  let cur: RowDef[] = [];
  let h = 0;
  let maxH = firstMaxH;

  for (const r of rows) {
    if (cur.length && h + r.h > maxH) {
      out.push(cur);
      cur = [r];
      h = r.h;
      maxH = otherMaxH; // ✅ después del primer corte, chunks más pequeños
    } else {
      cur.push(r);
      h += r.h;
    }
  }

  if (cur.length) out.push(cur);
  return out;
}

const styles = StyleSheet.create({
  barRow: {
    backgroundColor: COLOR.bar,
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
    borderWidth: BW,
    borderColor: BC,
  },
  barText: { fontSize: 8.2, fontWeight: 700, textTransform: 'uppercase', color: pdfTheme.colors.white },

  tableBox: {
    borderLeftWidth: BW,
    borderRightWidth: BW,
    borderLeftColor: BC,
    borderRightColor: BC,
  },

  row: { flexDirection: 'row' },

  cell: { paddingHorizontal: 6, paddingVertical: 3, justifyContent: 'center' },
  cellL: { borderLeftWidth: BW, borderLeftColor: BC },
  cellB: { borderBottomWidth: BW, borderBottomColor: BC },

  headBg: { backgroundColor: COLOR.head },
  leftBg: { backgroundColor: COLOR.left },
  whiteBg: { backgroundColor: COLOR.white },

  headText: { fontSize: 7.4, fontWeight: 700, textAlign: 'center' },
  smallText: { fontSize: 7.2, textAlign: 'center', lineHeight: 1.12 },
  xText: { fontSize: 8.2, fontWeight: 700, textAlign: 'center' },

  topDescRow: {
    flexDirection: 'row',
    height: 48,
    borderTopWidth: BW,
    borderTopColor: BC,
    borderBottomWidth: BW,
    borderBottomColor: BC,
  },
  descCell: { backgroundColor: COLOR.head, paddingHorizontal: 6, paddingVertical: 6, justifyContent: 'center' },

  procCol: { backgroundColor: COLOR.head, borderLeftWidth: BW, borderLeftColor: BC },
  procTop: { height: 18, justifyContent: 'center', borderBottomWidth: BW, borderBottomColor: BC },
  procBottom: { height: 30, justifyContent: 'center' },

  criterioMerged: {
    backgroundColor: COLOR.left,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotWrap: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  rotText: { fontSize: 7.0, fontWeight: 700, textAlign: 'center', transform: [{ rotate: '-90deg' }] },

  sumText: { fontSize: 7.4, fontWeight: 700, textAlign: 'center' },
});

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
      if (typeof (v as any).toNumber === 'function') {
        const n = (v as any).toNumber();
        return Number.isFinite(n);
      }
      const n = Number(String(v));
      return Number.isFinite(n);
    }

    return false;
  })();

  // ✅ Reglas:
  // - B: siempre "NA"
  // - A: si proc === 'A' y hay totalTitulo3 => "X", si no => "NA"
  // - si proc === 'B', A queda en blanco (no aplica)
  const cellA = proc === 'A' ? (hasTitulo3 ? 'X' : 'NA') : ' ';
  const cellB = 'NA';

  // ✅ añade keys robustas (factor/criterio invertidos, combos, y “partes” si vienen con separadores)
  const addKeys = (raw: any, g: '0' | 'I' | 'II' | 'III' | 'IV') => {
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

    // 2) por si viene invertido (a veces “factor” está en criterio)
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

  const renderChunk = (groupLabel: string, rows: RowDef[], showLabel: boolean, isLastChunkOfGroup: boolean) => {
    const h = rows.reduce((s, r) => s + r.h, 0);

    return (
      <View style={styles.row} wrap={false}>
        <View
          style={[
            styles.criterioMerged,
            flexW(COL.criterio),
            { height: h },
            isLastChunkOfGroup ? { borderBottomWidth: BW, borderBottomColor: BC } : null,
          ]}
        >
          {showLabel ? (
            <View style={styles.rotWrap}>
              <Text style={styles.rotText}>{groupLabel}</Text>
            </View>
          ) : null}
        </View>

        <View style={[flexW(TOTAL - COL.criterio)]}>
          {rows.map((r) => (
            <View key={`${groupLabel}-${r.label}`} style={[styles.row, { height: r.h }]} wrap={false}>
              <View style={[styles.cell, styles.cellL, styles.whiteBg, styles.cellB, flexW(COL.factor)]}>
                <Text style={styles.smallText}>{r.label}</Text>
              </View>

              <View style={[styles.cell, styles.cellL, styles.whiteBg, styles.cellB, flexW(COL.g), { alignItems: 'center' }]}>
                <Text style={styles.xText}>{mark(r.keys, '0')}</Text>
              </View>
              <View style={[styles.cell, styles.cellL, styles.whiteBg, styles.cellB, flexW(COL.g), { alignItems: 'center' }]}>
                <Text style={styles.xText}>{mark(r.keys, 'I')}</Text>
              </View>
              <View style={[styles.cell, styles.cellL, styles.whiteBg, styles.cellB, flexW(COL.g), { alignItems: 'center' }]}>
                <Text style={styles.xText}>{mark(r.keys, 'II')}</Text>
              </View>
              <View style={[styles.cell, styles.cellL, styles.whiteBg, styles.cellB, flexW(COL.g), { alignItems: 'center' }]}>
                <Text style={styles.xText}>{mark(r.keys, 'III')}</Text>
              </View>
              <View style={[styles.cell, styles.cellL, styles.whiteBg, styles.cellB, flexW(COL.g), { alignItems: 'center' }]}>
                <Text style={styles.xText}>{mark(r.keys, 'IV')}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const groupsChunked = GROUPS.map((g) => ({
    label: g.label,
    chunks: chunkRows(g.rows), // ✅ usa first/other
  }));

  return (
    <View>
      <View>
        <View style={styles.barRow} wrap={false}>
          <Text style={styles.barText}>TITULO III</Text>
        </View>

        <View style={styles.tableBox}>
          <View wrap={false}>
            <View style={styles.topDescRow} wrap={false}>
              <View style={[styles.descCell, flexW(TOTAL - COL.g * 2)]}>
                <Text style={{ fontSize: 7.6, lineHeight: 1.15 }}>
                  TITULO III: HERRAMIENTA PARA LA EVALUACIÓN DEL PUESTO DE TRABAJO, PERFIL DE DISCAPACIDAD, COMPETENCIA Y RESTRICCIONES
                  PARA LA ACTIVIDAD COMO EDUCADOR
                </Text>
              </View>

                <View style={[styles.procCol, flexW(COL.g)]} wrap={false}>
                <View style={styles.procTop}>
                    <Text style={styles.headText}>A</Text>
                </View>
                <View style={styles.procBottom}>
                    <Text style={styles.xText}>{cellA}</Text>
                </View>
                </View>

            <View style={[styles.procCol, flexW(COL.g)]} wrap={false}>
            <View style={styles.procTop}>
                <Text style={styles.headText}>B</Text>
            </View>
            <View style={styles.procBottom}>
                <Text style={styles.xText}>{cellB}</Text>
            </View>
            </View>
            </View>

            <View style={[styles.row, styles.cellB]} wrap={false}>
              <View style={[styles.cell, styles.headBg, flexW(COL.criterio + COL.factor)]}>
                <Text style={styles.headText}>ANALISIS OCUPACIONAL DEL{'\n'}USUARIO</Text>
              </View>
              <View style={[styles.cell, styles.cellL, styles.headBg, flexW(COL.g * G_COLS)]}>
                <Text style={styles.headText}>GRAVEDAD</Text>
              </View>
            </View>

            <View style={[styles.row, styles.cellB]} wrap={false}>
              <View style={[styles.cell, styles.headBg, flexW(COL.criterio)]}>
                <Text style={styles.headText}>CRITERIOS</Text>
              </View>
              <View style={[styles.cell, styles.cellL, styles.headBg, flexW(COL.factor)]}>
                <Text style={styles.headText}>FACTORES</Text>
              </View>
              <View style={[styles.cell, styles.cellL, styles.headBg, flexW(COL.g)]}>
                <Text style={styles.headText}>0</Text>
              </View>
              <View style={[styles.cell, styles.cellL, styles.headBg, flexW(COL.g)]}>
                <Text style={styles.headText}>I</Text>
              </View>
              <View style={[styles.cell, styles.cellL, styles.headBg, flexW(COL.g)]}>
                <Text style={styles.headText}>II</Text>
              </View>
              <View style={[styles.cell, styles.cellL, styles.headBg, flexW(COL.g)]}>
                <Text style={styles.headText}>III</Text>
              </View>
              <View style={[styles.cell, styles.cellL, styles.headBg, flexW(COL.g)]}>
                <Text style={styles.headText}>IV</Text>
              </View>
            </View>

            {groupsChunked[0]?.chunks?.[0]
              ? renderChunk(groupsChunked[0].label, groupsChunked[0].chunks[0], true, groupsChunked[0].chunks.length === 1)
              : null}
          </View>

          {groupsChunked.map((g, gi) =>
            g.chunks.map((chunk, ci) => {
              if (gi === 0 && ci === 0) return null;
              return renderChunk(g.label, chunk, ci === 0, ci === g.chunks.length - 1);
            }),
          )}

          <View style={styles.row} wrap={false}>
            {/* Columna CRITERIOS (vacía) */}
            <View style={[styles.criterioMerged, styles.headBg, styles.cellB, flexW(COL.criterio), { height: RH.sm }]}>
              <Text style={styles.sumText}>{' '}</Text>
            </View>

            {/* Bloque derecho: FACTORES + 0..IV */}
            <View style={[flexW(TOTAL - COL.criterio)]}>
              <View style={styles.row} wrap={false}>
                <View
                  style={[
                    styles.cell,
                    styles.cellL,
                    styles.headBg,
                    styles.cellB,
                    flexW(COL.factor),
                    { height: RH.sm, alignItems: 'center' },
                  ]}
                >
                  <Text style={styles.sumText}>SUMATORIA</Text>
                </View>

                {(['0', 'I', 'II', 'III', 'IV'] as const).map((k) => (
                  <View
                    key={k}
                    style={[
                      styles.cell,
                      styles.cellL,
                      styles.whiteBg,
                      styles.cellB,
                      flexW(COL.g),
                      { height: RH.sm, alignItems: 'center' },
                    ]}
                  >
                    <Text style={styles.smallText}>{sumMutable[k] ? String(sumMutable[k]) : ''}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}