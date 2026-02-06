import React from 'react';
import { Page, View, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = { children: React.ReactNode };

const PAD = pdfTheme.page.padding; // 18

const styles = StyleSheet.create({
  page: {
    ...pdfTheme.page,
    position: 'relative',
  },

  // ✅ borde completo por página (marca la división de hoja)
  pageBorder: {
    position: 'absolute',
    top: PAD,
    bottom: PAD,
    left: PAD,
    right: PAD,

    borderLeftWidth: pdfTheme.sizes.borderWidth,
    borderRightWidth: pdfTheme.sizes.borderWidth,
    borderTopWidth: pdfTheme.sizes.borderWidth,
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderColor: pdfTheme.colors.border,
  },
});

export function PageFrame({ children }: Props) {
  return (
    <Page size="LETTER" style={styles.page} wrap>
      <View style={styles.pageBorder} fixed />
      {children}
    </Page>
  );
}