import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

const BW = Number(pdfTheme?.sizes?.borderWidth ?? 1.2);
const PAD = Number(pdfTheme?.sizes?.rowPadding ?? 6);

// ✅ azul claro
const LIGHT_BLUE = '#D9E1F2';

function safeText(v: any) {
  const s = String(v ?? '').replace(/\r/g, '').trim();
  return s ? s : '—';
}

const styles = StyleSheet.create({
  // ✅ cada “fila”
  row: {
    padding: PAD,
    backgroundColor: pdfTheme.colors.white,
    borderBottomWidth: BW,              // ✅ línea interna entre filas
    borderBottomColor: pdfTheme.colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,               // ✅ evita doble línea con el borde del SectionBox
  },
  rowBlue: {
    backgroundColor: LIGHT_BLUE,
  },

  paragraph: {
    lineHeight: 1.2,
    fontSize: 7.6,
  },
  label: {
    fontWeight: 700,
  },
});

export function CondicionSaludBlock({ condicion }: { condicion: string }) {
  const condicionTxt = safeText(condicion);

  return (
    <View style={styles.row}>
      <Text style={styles.paragraph}>
        <Text style={styles.label}>Condición de salud (signos y síntomas): </Text>
        {condicionTxt}
      </Text>
    </View>
  );
}

export function HallazgosClinicosBlock({ hallazgos }: { hallazgos: string }) {
  const hallazgosTxt = safeText(hallazgos);

  return (
    <View style={[styles.row, styles.rowBlue, styles.rowLast]}>
      <Text style={styles.paragraph}>
        <Text style={styles.label}>
          Prueba o exámenes para clínicas (descripción de hallazgos positivos):{' '}
        </Text>
        {hallazgosTxt}
      </Text>
    </View>
  );
}