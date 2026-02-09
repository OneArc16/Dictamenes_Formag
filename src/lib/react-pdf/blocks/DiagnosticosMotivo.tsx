import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = {
  dictamen: any;
};

const COLOR = {
  head: pdfTheme.colors.templateBlue,
  body: '#D9E1F2', // azul claro plantilla
};

// ✅ Anchos fijos (evita líneas “torcidas” por redondeos de flex)
const NUM_W = 18;
const CODE_W = 64;

// ✅ Líneas internas más notorias + línea superior visible
const LINE_W = 1.2;

const styles = StyleSheet.create({
  // Header
  headRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: COLOR.head,
    borderTopWidth: LINE_W, // ✅ línea superior más notoria
    borderTopColor: pdfTheme.colors.border,
    borderBottomWidth: LINE_W,
    borderBottomColor: pdfTheme.colors.border,
  },
  headLeft: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRightWidth: LINE_W,
    borderRightColor: pdfTheme.colors.border,
    justifyContent: 'center',
  },
  headRight: {
    width: CODE_W,
    paddingHorizontal: 4,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headText: {
    fontSize: 7.8,
    fontWeight: 700,
  },

  // Rows
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: COLOR.body,
    borderBottomWidth: LINE_W, // ✅ líneas internas más notorias
    borderBottomColor: pdfTheme.colors.border,
    minHeight: 16,
  },
  rowLast: {
    borderBottomWidth: 0, // ✅ evita doble línea con el borde del SectionBox
  },
  cNum: {
    width: NUM_W,
    borderRightWidth: LINE_W,
    borderRightColor: pdfTheme.colors.border,
    paddingHorizontal: 4,
    paddingVertical: 3,
    justifyContent: 'center',
  },
  cDiag: {
    flex: 1,
    borderRightWidth: LINE_W,
    borderRightColor: pdfTheme.colors.border,
    paddingHorizontal: 6,
    paddingVertical: 3,
    justifyContent: 'center',
  },
  cCode: {
    width: CODE_W,
    paddingHorizontal: 4,
    paddingVertical: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },

  numText: {
    fontSize: 7.6,
    fontWeight: 700,
  },
  diagText: {
    fontSize: 7.6,
    textTransform: 'uppercase',
  },
  codeText: {
    fontSize: 7.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});

export function DiagnosticosMotivoBlock({ dictamen }: Props) {
  const items = Array.isArray(dictamen?.diagnosticos) ? dictamen.diagnosticos : [];

  return (
    <View>
      {/* Encabezado */}
      <View style={styles.headRow} wrap={false}>
        <View style={styles.headLeft}>
          <Text style={styles.headText}>Diagnóstico(s) motivo de calificación:</Text>
        </View>
        <View style={styles.headRight}>
          <Text style={[styles.headText, { textAlign: 'center' }]}>
            Código(s){'\n'}CIE-10
          </Text>
        </View>
      </View>

      {/* Filas */}
      {items.length === 0 ? (
        <View style={[styles.row, styles.rowLast]} wrap={false}>
          <View style={styles.cNum}>
            <Text style={styles.numText}>1.</Text>
          </View>
          <View style={styles.cDiag}>
            <Text style={styles.diagText}>—</Text>
          </View>
          <View style={styles.cCode}>
            <Text style={styles.codeText}>—</Text>
          </View>
        </View>
      ) : (
        items.map((it: any, idx: number) => {
          const isLast = idx === items.length - 1;

          const nombre = String(it?.cie10?.nombre ?? it?.cie10Label ?? it?.nombre ?? '—');
          const codigo = String(it?.cie10Codigo ?? it?.cie10?.codigo ?? '—');

          return (
            <View
              key={`${codigo}-${idx}`}
              style={[styles.row, isLast ? styles.rowLast : null]}
              wrap={false}
            >
              <View style={styles.cNum}>
                <Text style={styles.numText}>{idx + 1}.</Text>
              </View>
              <View style={styles.cDiag}>
                <Text style={styles.diagText}>{nombre}</Text>
              </View>
              <View style={styles.cCode}>
                <Text style={styles.codeText}>{codigo}</Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}