import React from 'react';
import { Text, View, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = {
  condicion: string;
  hallazgos: string;
};

// Para usar minPresenceAhead sin pelear con typings
const V: any = View;

function safeText(v: any) {
  const s = String(v ?? '').replace(/\r/g, '').trim();
  return s ? s : '—';
}

// ✅ azul más claro
const LIGHT_BLUE = '#D9E1F2';

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderBottomColor: pdfTheme.colors.border,
    padding: pdfTheme.sizes.rowPadding,
    backgroundColor: pdfTheme.colors.white,
  },
  rowLast: {
    borderBottomWidth: 0,
  },

  // ✅ fila azul claro para "Prueba o exámenes..."
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

export function CondicionHallazgosBlock({ condicion, hallazgos }: Props) {
  const condicionTxt = safeText(condicion);
  const hallazgosTxt = safeText(hallazgos);

  return (
    <View>
      <V minPresenceAhead={90}>
        <View style={styles.row}>
          <Text style={styles.paragraph}>
            <Text style={styles.label}>Condición de salud (signos y síntomas): </Text>
            {condicionTxt}
          </Text>
        </View>
      </V>

      <V minPresenceAhead={90}>
        <View style={[styles.row, styles.rowBlue, styles.rowLast]}>
          <Text style={styles.paragraph}>
            <Text style={styles.label}>
              Prueba o exámenes para clínicas (descripción de hallazgos positivos):{' '}
            </Text>
            {hallazgosTxt}
          </Text>
        </View>
      </V>
    </View>
  );
}