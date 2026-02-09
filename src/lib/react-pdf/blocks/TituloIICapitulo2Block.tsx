import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = { dictamen: any };

// Para usar minPresenceAhead sin pelear con typings
const V: any = View;

const COLOR = {
  bar: pdfTheme.colors.templateBlue,
  head: '#D9E1F2',
  left: '#D9E1F2',
  white: '#FFFFFF',
};

// ===== Column weights =====
const COL = { clase: 4, criterio: 10, a: 5, b: 5 } as const;
const TOTAL = COL.clase + COL.criterio + COL.a + COL.b;

const pct = (n: number) => `${((n / TOTAL) * 100).toFixed(4)}%`;

const W = {
  clase: pct(COL.clase),
  criterio: pct(COL.criterio),
  a: pct(COL.a),
  b: pct(COL.b),
};

const CLASES = [
  { key: 'I', label: 'I', desc: 'No hay dificultad o\ndificultad leve' },
  { key: 'II', label: 'II', desc: 'Dificultad\nmoderada' },
  { key: 'III', label: 'III', desc: 'Dificultad severa' },
  { key: 'IV', label: 'IV', desc: 'Dificultad completa' },
] as const;

function formatPercent(v: any) {
  if (v == null || v === '') return '';
  const raw = typeof v === 'object' && v?.toString ? v.toString() : String(v);
  const n = Number(String(raw).replace('%', '').trim());
  if (!Number.isFinite(n)) return String(v);
  return `${Number.isInteger(n) ? n : n.toFixed(1)}%`;
}

function normClase(v: any): 'I' | 'II' | 'III' | 'IV' | null {
  if (v == null || v === '') return null;
  const s = String(v).trim().toUpperCase();
  if (['I', '1', 'CLASE I', 'CLASEI'].includes(s)) return 'I';
  if (['II', '2', 'CLASE II', 'CLASEII'].includes(s)) return 'II';
  if (['III', '3', 'CLASE III', 'CLASEIII'].includes(s)) return 'III';
  if (['IV', '4', 'CLASE IV', 'CLASEIV'].includes(s)) return 'IV';
  return null;
}

const BW = 1;
const BC = pdfTheme.colors.border;

const styles = StyleSheet.create({
  barRow: {
    backgroundColor: COLOR.bar,
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
    borderWidth: BW,
    borderColor: BC,
  },
  barText: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: pdfTheme.colors.white,
  },

  tableBox: {
    borderWidth: BW,
    borderColor: BC,
  },

  row: {
    flexDirection: 'row',
  },
  rowLine: {
    borderBottomWidth: BW,
    borderBottomColor: BC,
  },

  cell: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    justifyContent: 'center',
  },
  cellL: {
    borderLeftWidth: BW,
    borderLeftColor: BC,
  },

  headBg: { backgroundColor: COLOR.head },
  leftBg: { backgroundColor: COLOR.left },
  whiteBg: { backgroundColor: COLOR.white },

  headText: { fontSize: 7.6, fontWeight: 700, textAlign: 'center' },
  claseText: { fontSize: 7.6, fontWeight: 700, textAlign: 'center' },
  descText: { fontSize: 7.6, textAlign: 'center', lineHeight: 1.15 },
  xText: { fontSize: 8.2, fontWeight: 700, textAlign: 'center' },

  headerRow: {
    flexDirection: 'row',
    height: 36,
    borderBottomWidth: BW,
    borderBottomColor: BC,
  },

  subCol: { height: 36, flexDirection: 'column' },
  subTop: {
    height: 18,
    justifyContent: 'center',
  },
  subBottom: {
    height: 18,
    justifyContent: 'center',
    borderTopWidth: BW,
    borderTopColor: BC,
  },

  procBottomRow: {
    flexDirection: 'row',
    height: 18,
    borderTopWidth: BW,
    borderTopColor: BC,
  },

  totalLeftText: {
    fontSize: 7.6,
    fontWeight: 700,
    textTransform: 'uppercase',
    textAlign: 'center',
  },

  procHeaderCell: {
  justifyContent: 'center',
  alignItems: 'center',
},
});

export function TituloIICapitulo2Block({ dictamen }: Props) {
  const proc = String(dictamen?.procedimientoPcl ?? 'A').toUpperCase() === 'B' ? 'B' : 'A';

  const clase = normClase(
    dictamen?.claseLimitacionLaboral ??
      dictamen?.tituloII?.capitulo2?.clase ??
      dictamen?.tituloIICapitulo2Clase ??
      dictamen?.capitulo2TituloIIClase ??
      dictamen?.limitacionPerfilLaboralClase,
  );

  const total =
    dictamen?.totalCap2 ??
    dictamen?.tituloII?.capitulo2?.valorTotal ??
    dictamen?.totalTitulo2Cap2 ??
    dictamen?.totalTituloIICap2 ??
    dictamen?.valorTotalTituloIICap2;

  const totalA = proc === 'A' ? total : null;
  const totalB = proc === 'B' ? total : null;

  return (
    <View>
      <V minPresenceAhead={260}>
        <View style={styles.barRow} wrap={false}>
          <Text style={styles.barText}>TITULO II - CAPITULO 2</Text>
        </View>

        <View style={styles.tableBox}>
            {/* ===== HEADER FILA 1 ===== */}
        <View style={[styles.row, styles.rowLine]} wrap={false}>
        <View style={[styles.cell, styles.headBg, { width: W.clase }]}>
            <Text style={styles.headText}>Clase</Text>
        </View>

        <View style={[styles.cell, styles.cellL, styles.headBg, { width: W.criterio }]}>
            <Text style={styles.headText}>Criterio 1</Text>
        </View>

        <View
            style={[
            styles.cell,
            styles.cellL,
            styles.headBg,
            { width: `${(COL.a + COL.b) / TOTAL * 100}%` },
            ]}
        >
            <Text style={styles.headText}>PROCEDIMIENTO</Text>
        </View>
        </View>

            {/* ===== HEADER FILA 2 ===== */}
        <View style={[styles.row, styles.rowLine]} wrap={false}>
        <View style={[styles.cell, styles.headBg, { width: W.clase }]} />

        <View style={[styles.cell, styles.cellL, styles.headBg, { width: W.criterio }]}>
            <Text style={styles.headText}>Limitaciones en el perfil laboral</Text>
        </View>

        <View style={[styles.cell, styles.cellL, styles.headBg, { width: W.a, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={styles.headText}>A</Text>
        </View>

        <View style={[styles.cell, styles.cellL, styles.headBg, { width: W.b, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={styles.headText}>B</Text>
        </View>
        </View>


          {/* ===== BODY ===== */}
          {CLASES.map((c) => {
            const xA = proc === 'A' && clase === c.key ? 'X' : '';
            const xB = proc === 'B' && clase === c.key ? 'X' : '';

            return (
              <View key={c.key} style={[styles.row, styles.rowLine]} wrap={false}>
                <View style={[styles.cell, styles.leftBg, { width: W.clase }]}>
                  <Text style={styles.claseText}>{c.label}</Text>
                </View>

                <View style={[styles.cell, styles.cellL, styles.whiteBg, { width: W.criterio }]}>
                  <Text style={styles.descText}>{c.desc}</Text>
                </View>

                <View style={[styles.cell, styles.cellL, styles.whiteBg, { width: W.a, alignItems: 'center' }]}>
                  <Text style={styles.xText}>{xA}</Text>
                </View>

                <View style={[styles.cell, styles.cellL, styles.whiteBg, { width: W.b, alignItems: 'center' }]}>
                  <Text style={styles.xText}>{xB}</Text>
                </View>
              </View>
            );
          })}

          {/* ===== VALOR TOTAL ===== */}
          <View style={[styles.row, styles.rowLine]} wrap={false}>
            <View style={[styles.cell, styles.headBg, { width: `${(COL.clase + COL.criterio) / TOTAL * 100}%` }]}>
              <Text style={styles.totalLeftText}>VALOR TOTAL</Text>
            </View>

            <View style={[styles.cell, styles.cellL, styles.whiteBg, { width: W.a, alignItems: 'center' }]}>
              <Text style={styles.descText}>{formatPercent(totalA)}</Text>
            </View>

            <View style={[styles.cell, styles.cellL, styles.whiteBg, { width: W.b, alignItems: 'center' }]}>
              <Text style={styles.descText}>{formatPercent(totalB)}</Text>
            </View>
          </View>
        </View>
      </V>
    </View>
  );
}
