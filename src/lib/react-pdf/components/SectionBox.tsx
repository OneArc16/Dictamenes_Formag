//SectionBox

import React from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = {
  children: React.ReactNode;
  style?: any;
  joinTop?: boolean;
  joinBottom?: boolean;

  // ✅ NUEVO
  wrap?: boolean;              // default true
  minPresenceAhead?: number;   // en puntos
  break?: boolean;             // forzar salto si algún día lo necesitas
};

const styles = StyleSheet.create({
  box: {
    borderColor: pdfTheme.colors.border,
    borderWidth: pdfTheme.sizes.borderWidth,
    backgroundColor: pdfTheme.colors.white,
  },
  joinTop: { borderTopWidth: 0 },
  joinBottom: { borderBottomWidth: 0 },
});

export function SectionBox({
  children,
  style,
  joinTop,
  joinBottom,
  wrap = true,
  minPresenceAhead,
  break: doBreak,
}: Props) {
  return (
    <View
      wrap={wrap}
      minPresenceAhead={minPresenceAhead}
      break={doBreak}
      style={[
        styles.box,
        joinTop ? styles.joinTop : null,
        joinBottom ? styles.joinBottom : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}