import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = {
  dictamen: any;
};

// Para usar minPresenceAhead sin pelear con typings
const V: any = View;

const COLOR = {
  title: '#F8CBAD', // franja beige (como Word)
  bar: pdfTheme.colors.templateBlue, // barra “TITULO I”
  head: '#9DC3E6', // encabezados de columnas (azul)
  body: '#D9E1F2', // filas (azul claro)
};

// ✅ pesos enteros para que las líneas verticales queden derechas
const COL = {
  num: 2,
  desc: 16,
  cap: 4,
  tabla: 6,
  valor: 6,
} as const;

function formatPercent(v: any) {
  if (v == null || v === '') return '—';
  const n = typeof v === 'string' ? Number(String(v).replace('%', '').trim()) : Number(v);
  if (!Number.isFinite(n)) return String(v);
  return `${Number.isInteger(n) ? n : n.toFixed(1)}%`;
}

function buildTablaLabel(tablaBase: any, claseNombre: any) {
  const base = String(tablaBase ?? '—').trim();
  const cn = String(claseNombre ?? '').trim();
  if (!cn) return base;

  // normaliza: si viene "Clase I" o "I", dejamos "I"
  const solo = cn.replace(/^clase\s*/i, '').trim();
  if (!solo) return base;

  return `${base} (clase ${solo.toUpperCase()})`;
}

const styles = StyleSheet.create({
  // ===== Título sección =====
  titleRow: {
    backgroundColor: COLOR.title,
    alignItems: 'center',
    justifyContent: 'center',
    height: 18,
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderBottomColor: pdfTheme.colors.border,
  },
  titleText: {
    fontSize: 8.4,
    fontWeight: 700,
    textTransform: 'uppercase',
  },

  // ===== Barra TITULO I =====
  barRow: {
    backgroundColor: COLOR.bar,
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderBottomColor: pdfTheme.colors.border,
  },
  barText: {
    fontSize: 8.0,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: pdfTheme.colors.white,
  },

  // ===== Encabezado columnas =====
  headRow: {
    flexDirection: 'row',
    backgroundColor: COLOR.head,
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderBottomColor: pdfTheme.colors.border,
  },
  hCell: {
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRightWidth: pdfTheme.sizes.borderWidth,
    borderRightColor: pdfTheme.colors.border,
  },
  hText: {
    fontSize: 7.6,
    fontWeight: 700,
    textAlign: 'center',
  },

  // ===== Filas =====
  row: {
    flexDirection: 'row',
    backgroundColor: COLOR.body,
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderBottomColor: pdfTheme.colors.border,
    minHeight: 16,
  },
  rowLast: {
    borderBottomWidth: 0, // evita doble línea con el borde del SectionBox
  },
  cell: {
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRightWidth: pdfTheme.sizes.borderWidth,
    borderRightColor: pdfTheme.colors.border,
  },
  cellLast: {
    borderRightWidth: 0,
  },

  numText: { fontSize: 7.6, fontWeight: 700 },
  descText: { fontSize: 7.6, textTransform: 'uppercase' },
  midText: { fontSize: 7.6, textAlign: 'center' },
  valText: { fontSize: 7.6, textAlign: 'center' },

  // ===== Filas resumen =====
  sumRow: {
    flexDirection: 'row',
    backgroundColor: COLOR.head,
    borderTopWidth: pdfTheme.sizes.borderWidth,
    borderTopColor: pdfTheme.colors.border,
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderBottomColor: pdfTheme.colors.border,
    minHeight: 16,
  },
  sumLeft: {
    flex: COL.num + COL.desc + COL.cap + COL.tabla,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRightWidth: pdfTheme.sizes.borderWidth,
    borderRightColor: pdfTheme.colors.border,
    justifyContent: 'center',
  },
  sumRight: {
    flex: COL.valor,
    paddingHorizontal: 6,
    paddingVertical: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sumText: { fontSize: 7.6, fontWeight: 700 },

  footerRow: {
    flexDirection: 'row',
    backgroundColor: COLOR.head,
    minHeight: 16,
  },
  footerLeft: {
    flex: COL.num + COL.desc + COL.cap + COL.tabla,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRightWidth: pdfTheme.sizes.borderWidth,
    borderRightColor: pdfTheme.colors.border,
    justifyContent: 'center',
  },
  footerRight: {
    flex: COL.valor,
    paddingHorizontal: 6,
    paddingVertical: 3,
    justifyContent: 'center',
  },
  footerLeftText: { fontSize: 7.6, fontWeight: 700, textAlign: 'right' },
  footerRightText: { fontSize: 7.6, textAlign: 'left' },
});

export function VariablesPerdidaCapacidadLaboralTituloIBlock({ dictamen }: Props) {
  const fromDb = Array.isArray(dictamen?.deficiencias) ? dictamen.deficiencias : [];

  const itemsRaw = fromDb.map((d: any) => ({
    descripcion: d?.deficiencia?.nombre ?? '—',
    capitulo: d?.deficiencia?.capitulo ?? '—',
    tabla: buildTablaLabel(d?.deficiencia?.tabla, d?.clase?.nombre),
    valorDeficiencia: d?.valorDeficiencia,
  }));

  // ✅ YA NO recorta a 5: muestra la cantidad real
  // Si no hay nada, deja 1 fila placeholder para que no quede vacío
  const rows = itemsRaw.length ? itemsRaw : [null];

  const ponderacionMax = 75;

  return (
    <View>
      <V minPresenceAhead={220}>
        <View style={styles.titleRow} wrap={false}>
          <Text style={styles.titleText}>4. Variables de la pérdida de la capacidad laboral</Text>
        </View>

        <View style={styles.barRow} wrap={false}>
          <Text style={styles.barText}>TITULO I</Text>
        </View>

        {/* Encabezados */}
        <View style={styles.headRow} wrap={false}>
          <View style={[styles.hCell, { flex: COL.num }]}>
            <Text style={styles.hText}>{' '}</Text>
          </View>

          <View style={[styles.hCell, { flex: COL.desc }]}>
            <Text style={styles.hText}>Descripción de la Deficiencia (s)</Text>
          </View>

          <View style={[styles.hCell, { flex: COL.cap }]}>
            <Text style={styles.hText}>Capítulo</Text>
          </View>

          <View style={[styles.hCell, { flex: COL.tabla }]}>
            <Text style={styles.hText}>Tabla</Text>
          </View>

          <View style={[styles.hCell, { flex: COL.valor, borderRightWidth: 0 }]}>
            <Text style={styles.hText}>Valor de la deficiencia (%)</Text>
          </View>
        </View>

        {/* Filas */}
        {rows.map((it: any, idx: number) => {
          const isLast = idx === rows.length - 1;
          const rowStyle = isLast ? [styles.row, styles.rowLast] : styles.row;

          const desc = it == null ? '—' : String(it?.descripcion ?? '—');
          const cap = it == null ? '—' : String(it?.capitulo ?? '—');
          const tabla = it == null ? '—' : String(it?.tabla ?? '—');
          const valor = it == null ? '—' : formatPercent(it?.valorDeficiencia);

          return (
            <View key={`t1-${idx}`} style={rowStyle} wrap={false}>
              <View style={[styles.cell, { flex: COL.num }]}>
                <Text style={styles.numText}>{idx + 1}.</Text>
              </View>

              <View style={[styles.cell, { flex: COL.desc }]}>
                <Text style={styles.descText}>{desc}</Text>
              </View>

              <View style={[styles.cell, { flex: COL.cap }]}>
                <Text style={styles.midText}>{cap}</Text>
              </View>

              <View style={[styles.cell, { flex: COL.tabla }]}>
                <Text style={styles.midText}>{tabla}</Text>
              </View>

              <View style={[styles.cell, styles.cellLast, { flex: COL.valor }]}>
                <Text style={styles.valText}>{valor}</Text>
              </View>
            </View>
          );
        })}

        {/* Suma */}
        <View style={styles.sumRow} wrap={false}>
          <View style={styles.sumLeft}>
            <Text style={styles.sumText}>Suma con fórmula de valores combinados (75% ó 50%):</Text>
          </View>
          <View style={styles.sumRight}>
            <Text style={styles.sumText}>{' '}</Text>
          </View>
        </View>

        {/* Pie */}
        <View style={styles.footerRow} wrap={false}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerLeftText}>Deficiencia</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerRightText}>Ponderación máxima: {ponderacionMax}%</Text>
          </View>
        </View>
      </V>
    </View>
  );
}