import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';
import { HeaderWithFirstRow, SafeRow } from '../components/Pagination';

type Props = {
  dictamen: {
    diagnosticos?: unknown;
  };
};

type DiagnosticoItem = {
  cie10Codigo?: unknown;
  cie10Label?: unknown;
  nombre?: unknown;
  cie10?: {
    codigo?: unknown;
    nombre?: unknown;
  } | null;
};

function asDiagnosticoItem(value: unknown): DiagnosticoItem {
  return value && typeof value === 'object' ? (value as DiagnosticoItem) : {};
}

const COLOR = {
  head: pdfTheme.colors.templateBlue,
  body: '#DAE9F7', // azul claro plantilla
};

// âœ… Anchos fijos (evita lÃ­neas â€œtorcidasâ€ por redondeos de flex)
const NUM_W = 18;
const CODE_W = 64;
const ROW_MIN_PRESENCE_AHEAD = 28;

// âœ… LÃ­neas internas mÃ¡s notorias + lÃ­nea superior visible
const LINE_W = Number(pdfTheme?.sizes?.borderWidth ?? 0.85);

const styles = StyleSheet.create({
  // Header
  headRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: COLOR.head,
    borderTopWidth: LINE_W, // âœ… lÃ­nea superior mÃ¡s notoria
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
    borderBottomWidth: LINE_W, // âœ… lÃ­neas internas mÃ¡s notorias
    borderBottomColor: pdfTheme.colors.border,
    minHeight: 16,
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
  const rows = items.length
    ? items.map((item, idx: number) => {
        const it = asDiagnosticoItem(item);
        const codigo = String(it.cie10Codigo ?? it.cie10?.codigo ?? '—');

        return {
          key: `${codigo}-${idx}`,
          nombre: String(it.cie10?.nombre ?? it.cie10Label ?? it.nombre ?? '—'),
          codigo,
        };
      })
    : [{ key: 'empty-0', nombre: '—', codigo: '—' }];

  const renderHeader = () => (
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
  );

  const renderRow = (
    row: { key: string; nombre: string; codigo: string },
    idx: number,
  ) => (
    <SafeRow
      key={row.key}
      minPresenceAhead={ROW_MIN_PRESENCE_AHEAD}
      style={styles.row}
    >
      <View style={styles.cNum}>
        <Text style={styles.numText}>{idx + 1}.</Text>
      </View>
      <View style={styles.cDiag}>
        <Text style={styles.diagText}>{row.nombre}</Text>
      </View>
      <View style={styles.cCode}>
        <Text style={styles.codeText}>{row.codigo}</Text>
      </View>
    </SafeRow>
  );

  return (
    <View>
      <HeaderWithFirstRow minPresenceAhead={18}>
        {renderHeader()}
        {renderRow(rows[0], 0)}
      </HeaderWithFirstRow>

      {rows.slice(1).map((row, index) => renderRow(row, index + 1))}
    </View>
  );
}


