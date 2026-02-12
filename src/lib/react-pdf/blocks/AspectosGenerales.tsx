import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = { dictamen: any };

function formatDateDMY(value?: string | Date | null) {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getUTCFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

const COL = {
  c1: 1.1,
  c2: 1.25,
  c3: 2.0,
  c4: 1.1,
  c5: 0.35,
} as const;

// ✅ Colores EXACTOS como el Word de tu captura
const WORD = {
  title: '#FCE4D6', // naranja claro del título
  head: '#9BC2E6',  // encabezados/labels
  body: '#A5C9EB',  // valores (azul medio)
  light: '#DDEBF7', // fecha / celda final muy clara
  border: '#000000',
};

const styles = StyleSheet.create({
  titleRow: {
    backgroundColor: WORD.title,
    alignItems: 'center',
    justifyContent: 'center',
    height: 18,
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderBottomColor: WORD.border,
  },
  titleText: { fontSize: 8.4, fontWeight: 700, textTransform: 'uppercase' },

  row: {
    flexDirection: 'row',
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderBottomColor: WORD.border,
  },
  rowLast: { borderBottomWidth: 0 },

  cell: {
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRightWidth: pdfTheme.sizes.borderWidth,
    borderRightColor: WORD.border,
  },
  cellLast: { borderRightWidth: 0 },

  bgHead: { backgroundColor: WORD.head },
  bgBody: { backgroundColor: WORD.body },
  bgLight: { backgroundColor: WORD.light },

  th: {
    fontSize: 7.6,
    fontWeight: 700,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 1.1,
  },
  td: {
    fontSize: 7.8,
    textAlign: 'center',
    lineHeight: 1.1,
  },
  leftText: { textAlign: 'left' },

  hHead: { height: 20 },
  hVal: { height: 18 },

  row4: {
    flexDirection: 'row',
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderBottomColor: WORD.border,
    height: 30,
  },

  fechaRow: {
    backgroundColor: WORD.light,
    height: 16,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  fechaText: { fontSize: 7.8, fontWeight: 700, textTransform: 'uppercase' },
});

function Cell({
  flex,
  children,
  last,
  style,
}: {
  flex: number;
  children: React.ReactNode;
  last?: boolean;
  style?: any;
}) {
  return (
    <View style={[styles.cell, { flex }, last ? styles.cellLast : null, style]}>
      {children}
    </View>
  );
}

export function AspectosGeneralesBlock({ dictamen }: Props) {
  const u = dictamen?.usuario ?? {};
  const ciudad = String(u?.municipio?.nombre ?? dictamen?.ciudad ?? dictamen?.municipio ?? '—');

  const origen = String(dictamen?.origenEvento ?? '').toUpperCase();
  const enfermedadGeneral = origen === 'LABORAL' ? 'ATEP' : String(dictamen?.enfermedadGeneral ?? '—');

  const decretoTop = 'DECRETO 1848 DE 1968';
  const decretoSub = 'O LABORAL-PROFESIONAL';
  const ley = 'LEY 100/93';

  const proc = String(dictamen?.procedimientoPcl ?? '').toUpperCase();
  const marcaA = proc === 'A' ? 'X' : '';
  const marcaB = proc === 'B' ? 'X' : '';

  const establecimiento = String(
    u?.institucionEducativaRef?.nombre ??
      dictamen?.establecimientoEducativo ??
      dictamen?.institucionEducativa ??
      '—'
  );

  const secretariaDondeLabora = String(
    u?.secretariaRef?.nombre ??
      u?.institucionEducativaRef?.secretaria?.nombre ??
      dictamen?.secretariaDondeLabora ??
      dictamen?.secretaria ??
      '—'
  );

  const fecha = formatDateDMY(dictamen?.fechaDictamen ?? dictamen?.fecha ?? null);

  return (
    <View>
      <View style={styles.titleRow}>
        <Text style={styles.titleText}>1. ASPECTOS GENERALES DEL DICTAMEN</Text>
      </View>

      {/* Encabezados (azul head) */}
      <View style={[styles.row, styles.hHead]}>
        <Cell flex={COL.c1} style={styles.bgHead}><Text style={styles.th}>CIUDAD</Text></Cell>
        <Cell flex={COL.c2} style={styles.bgHead}><Text style={styles.th}>ENFERMEDAD GENERAL</Text></Cell>
        <Cell flex={COL.c3} style={styles.bgHead}>
          <Text style={styles.th}>{decretoTop}</Text>
          <Text style={styles.th}>{decretoSub}</Text>
        </Cell>
        <Cell flex={COL.c4} style={styles.bgHead}><Text style={styles.th}>PROCEDIMIENTO A</Text></Cell>
        <Cell flex={COL.c5} style={styles.bgHead} last><Text style={styles.th}>{marcaA}</Text></Cell>
      </View>

      {/* Valores (azul body) */}
      <View style={[styles.row, styles.hVal]}>
        <Cell flex={COL.c1} style={styles.bgBody}><Text style={styles.td}>{ciudad}</Text></Cell>
        <Cell flex={COL.c2} style={styles.bgBody}><Text style={styles.td}>ATEP</Text></Cell>
        <Cell flex={COL.c3} style={styles.bgBody}><Text style={styles.td}>{ley}</Text></Cell>
        <Cell flex={COL.c4} style={styles.bgBody}><Text style={styles.td}>PROCEDIMIENTO B</Text></Cell>
        <Cell flex={COL.c5} style={styles.bgBody} last><Text style={styles.td}>{marcaB}</Text></Cell>
      </View>

      {/* Subtabla (labels head / valores body / última celda light como el Word) */}
      <View style={styles.row4}>
        <Cell flex={1.2} style={styles.bgHead}>
          <Text style={[styles.th, styles.leftText]}>
            ESTABLECIMIENTO EDUCATIVO{'\n'}DONDE LABORA:
          </Text>
        </Cell>
        <Cell flex={1.1} style={styles.bgLight}>
          <Text style={styles.td}>{establecimiento}</Text>
        </Cell>
        <Cell flex={1.2} style={styles.bgHead}>
          <Text style={[styles.th, styles.leftText]}>
            ENTIDAD TERRITORIAL DONDE{'\n'}LABORA:
          </Text>
        </Cell>
        <Cell flex={1.0} style={styles.bgLight} last>
          <Text style={styles.td}>{secretariaDondeLabora}</Text>
        </Cell>
      </View>

      <View style={[styles.fechaRow, styles.bgHead]}>
        <Text style={styles.fechaText}>FECHA: {fecha}</Text>
      </View>
    </View>
  );
}