import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = { dictamen: any };

const BW = 1.2; // ✅ consistente con tu ajuste
const BC = pdfTheme.colors.border;

// Colores exactos del ejemplo
const COLOR = {
  blue: '#9BC2E6',
  light: '#E0EDF8',
  white: '#FFFFFF',
};

// Columnas (proporciones tomadas del ejemplo para que coincida)
const COL = {
  etapa: 12,
  a: 14,
  sep: 8,
  b: 11,
} as const;

const TOTAL = COL.etapa + COL.a + COL.sep + COL.b;

// ✅ CAMBIO: ancho fijo por % (evita “torcido” por redondeos de flex en cada fila)
const flexW = (n: number) => ({ width: `${(n / TOTAL) * 100}%` });

function toNum(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function fmtPct(v: number | null | undefined): string {
  if (v == null) return ''; // en el ejemplo va vacío

  // ✅ Tope máximo 100%
  const capped = v > 100 ? 100 : v;

  return Number.isInteger(capped) ? `${capped}%` : `${capped.toFixed(1)}%`;
}

export default function PorcentajePclBlock({ dictamen }: Props) {
  const proc = (dictamen?.procedimientoPcl ?? dictamen?.procedimiento ?? 'A') as 'A' | 'B';

  // Intenta leer de varias rutas sin romper nada (si no existe, queda vacío)
  const t1 = toNum(dictamen?.totalTitulo1 ?? dictamen?.tituloI?.valorTotal);
  const c1 = toNum(dictamen?.totalCap1 ?? dictamen?.tituloII?.capitulo1?.valorTotal);
  const c2 = toNum(dictamen?.totalCap2 ?? dictamen?.tituloII?.capitulo2?.valorTotal);
  const t3 = toNum(dictamen?.totalTitulo3 ?? dictamen?.tituloIII?.valorTotal);

  const totalCalc = (() => {
    let s = 0;
    let any = false;
    if (t1 != null) {
      s += t1;
      any = true;
    }
    if (c1 != null) {
      s += c1;
      any = true;
    }
    if (c2 != null) {
      s += c2;
      any = true;
    }
    if (proc === 'A' && t3 != null) {
      s += t3;
      any = true;
    }
    return any ? s : null;
  })();

  const total = toNum(dictamen?.totalPcl ?? dictamen?.pclTotal ?? totalCalc);

  const valA = (v: number | null) => (proc === 'A' ? fmtPct(v) : '');
  const valB = (v: number | null) => (proc === 'B' ? fmtPct(v) : '');

  const rows: Array<{ label: string; a: string; b: string; bold?: boolean }> = [
    { label: 'TITULO I', a: valA(t1), b: valB(t1) },
    { label: 'TITULO II', a: '', b: '' },
    { label: 'CAPITULO 1', a: valA(c1), b: valB(c1) },
    { label: 'CAPITULO 2', a: valA(c2), b: valB(c2) },
    { label: 'TITULO III', a: valA(t3), b: '' }, // en el ejemplo queda vacío si no aplica
    { label: 'TOTAL PCL', a: valA(total), b: valB(total), bold: true },
  ];

  // ✅ CLAVE: hacer el bloque COMPLETO “no-partible” para que NO quede el título/encabezado huérfano
  const TITLE_H = 14;
  const HEAD_H = 32;
  const ROW_H = 16;
  const MIN_AHEAD = TITLE_H + HEAD_H + rows.length * ROW_H + 12; // margen extra

  return (
    <View style={styles.table} wrap={false} minPresenceAhead={MIN_AHEAD}>
      {/* Título */}
      <View style={[styles.row, styles.bb]} wrap={false}>
        <View style={[styles.cell, flexW(TOTAL), styles.titleCell]}>
          <Text style={styles.titleText}>PORCENTAJE DE PÉRDIDA DE CAPACIDAD LABORAL</Text>
        </View>
      </View>

      {/* Encabezado */}
      <View style={[styles.row, styles.bb]} wrap={false}>
        <View style={[styles.cell, flexW(COL.etapa), styles.blueCell, styles.h32]}>
          <Text style={styles.headText}>ETAPA</Text>
        </View>

        <View style={[styles.cell, styles.bl, flexW(COL.a), styles.lightCell, styles.h32]}>
          <Text style={styles.headText}>PROCEDIMIENTO A</Text>
        </View>

        <View style={[styles.cell, styles.bl, flexW(COL.sep), styles.whiteCell, styles.h32]} />

        <View style={[styles.cell, styles.bl, flexW(COL.b), styles.lightCell, styles.noPad]}>
          <Text style={styles.headText}>PROCEDIMIENTO B</Text>
        </View>
      </View>

      {/* Filas */}
      {rows.map((r, idx) => {
        const isLast = idx === rows.length - 1;
        return (
          <View key={r.label} style={[styles.row, !isLast && styles.bb]} wrap={false}>
            <View style={[styles.cell, flexW(COL.etapa), styles.blueCell, styles.h16]}>
              <Text style={[styles.bodyText, r.bold && styles.bold]}>{r.label}</Text>
            </View>

            <View style={[styles.cell, styles.bl, flexW(COL.a), styles.lightCell, styles.h16]}>
              <Text style={[styles.bodyText, r.bold && styles.bold]}>{r.a}</Text>
            </View>

            <View style={[styles.cell, styles.bl, flexW(COL.sep), styles.whiteCell, styles.h16]} />

            <View style={[styles.cell, styles.bl, flexW(COL.b), styles.lightCell, styles.h16]}>
              <Text style={[styles.bodyText, r.bold && styles.bold]}>{r.b}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: BW,
    borderColor: BC,
    width: '100%',
  },

  // ✅ CAMBIO: asegura que el % de las celdas sea idéntico en TODAS las filas
  row: { flexDirection: 'row', width: '100%' },

  // bordes internos
  bb: { borderBottomWidth: BW, borderBottomColor: BC },
  bl: { borderLeftWidth: BW, borderLeftColor: BC },

  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 0,
  },

  // backgrounds
  blueCell: { backgroundColor: COLOR.blue },
  lightCell: { backgroundColor: COLOR.light },
  whiteCell: { backgroundColor: COLOR.white },

  // alturas controladas
  h16: { height: 16 },
  h32: { height: 32 },

  // title
  titleCell: { backgroundColor: COLOR.blue, height: 14 },
  titleText: { fontSize: 8, fontWeight: 700 },

  headText: { fontSize: 7.5, fontWeight: 700 },
  bodyText: { fontSize: 7.5 },
  bold: { fontWeight: 700 },

  // “PROCEDIMIENTO / B” split (lo dejo igual aunque no lo uses aquí)
  noPad: { paddingHorizontal: 0, paddingVertical: 0, height: 32 },
  bSplitTop: {
    height: 16,
    width: '100%',
    borderBottomWidth: BW,
    borderBottomColor: BC,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bSplitBottom: {
    height: 16,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});