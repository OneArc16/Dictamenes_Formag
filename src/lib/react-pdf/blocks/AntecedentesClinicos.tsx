import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { FlowTextBlock } from '../components/Pagination';
import { pdfTheme } from '../theme';

type Props = {
  dictamen: {
    antecedentesClinicos?: unknown;
  };
};

const COLOR = {
  title: '#FCE4D6',
};

const styles = StyleSheet.create({
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

  body: {
    backgroundColor: pdfTheme.colors.white,
  },

  // âœ… IMPORTANTE: el padding va en el Text para que se repita al partir pÃ¡gina
  bodyText: {
    fontSize: 7.6,
    lineHeight: 1.15,
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 6,
  },
});

export function AntecedentesClinicosBlock({ dictamen }: Props) {
  const texto = String(dictamen?.antecedentesClinicos ?? '—');

  return (
    <View>
      <View style={styles.titleRow} wrap={false} minPresenceAhead={36}>
        <Text style={styles.titleText}>3. ANTECEDENTES CLÍNICOS (EPICRISIS Y ESTADO ACTUAL)</Text>
      </View>

      <FlowTextBlock style={styles.body} minPresenceAhead={12}>
        <Text style={styles.bodyText}>{texto}</Text>
      </FlowTextBlock>
    </View>
  );
}

