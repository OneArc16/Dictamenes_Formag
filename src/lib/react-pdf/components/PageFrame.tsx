import React from 'react';
import { Page, View, StyleSheet, Text } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = { children: React.ReactNode };

const PAD = pdfTheme.page.padding; // 18
const SAFE_BOTTOM = 12; // como lo dejamos

const styles = StyleSheet.create({
  page: {
    ...pdfTheme.page,
    position: 'relative',
    paddingBottom: PAD + SAFE_BOTTOM,
  },

  // ✅ Paginación abajo a la izquierda
  pageNumber: {
    position: 'absolute',
    right: PAD,
    bottom: 8, // ajusta si la quieres más arriba/abajo
    fontSize: 8,
    color: '#444',
  },
});

export function PageFrame({ children }: Props) {
  return (
    <Page size="LETTER" style={styles.page} wrap>
      {/* ✅ Footer fijo por página */}
      <Text
        fixed
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
      />

      {children}
    </Page>
  );
}