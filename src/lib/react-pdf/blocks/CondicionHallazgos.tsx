import React from 'react';
import { Text, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';
import { FlowTextBlock } from '../components/Pagination';

const BW = Number(pdfTheme?.sizes?.borderWidth ?? 1.2);
const PAD = Number(pdfTheme?.sizes?.rowPadding ?? 6);

// âœ… azul claro
const LIGHT_BLUE = '#DAE9F7';

function safeText(v: unknown) {
  const s = String(v ?? '').replace(/\r/g, '').trim();
  return s ? s : '—';
}

const styles = StyleSheet.create({
  // âœ… cada â€œfilaâ€
  row: {
    padding: PAD,
    backgroundColor: pdfTheme.colors.white,
    borderBottomWidth: BW,              // âœ… lÃ­nea interna entre filas
    borderBottomColor: pdfTheme.colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,               // âœ… evita doble lÃ­nea con el borde del SectionBox
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
    <FlowTextBlock style={styles.row} minPresenceAhead={10}>
      <Text style={styles.paragraph}>
        <Text style={styles.label}>Condición de salud (signos y síntomas): </Text>
        {condicionTxt}
      </Text>
    </FlowTextBlock>
  );
}

export function HallazgosClinicosBlock({ hallazgos }: { hallazgos: string }) {
  const hallazgosTxt = safeText(hallazgos);

  return (
    <FlowTextBlock style={[styles.row, styles.rowBlue, styles.rowLast]} minPresenceAhead={10}>
      <Text style={styles.paragraph}>
        <Text style={styles.label}>
          Prueba o exámenes paraclínicos (descripción de hallazgos positivos):{' '}
        </Text>
        {hallazgosTxt}
      </Text>
    </FlowTextBlock>
  );
}


