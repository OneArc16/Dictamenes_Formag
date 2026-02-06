import React from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = {
  children: React.ReactNode;
  style?: any;

  /** ✅ Para que quede “pegado” al bloque anterior sin línea doble */
  joinTop?: boolean;

  /** ✅ Por si luego quieres pegar con el siguiente (opcional) */
  joinBottom?: boolean;
};

const styles = StyleSheet.create({
  box: {
    borderColor: pdfTheme.colors.border,
    borderWidth: pdfTheme.sizes.borderWidth,
    backgroundColor: pdfTheme.colors.white,
  },
  joinTop: {
    borderTopWidth: 0,
  },
  joinBottom: {
    borderBottomWidth: 0,
  },
});

export function SectionBox({ children, style, joinTop, joinBottom }: Props) {
  return (
    <View
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