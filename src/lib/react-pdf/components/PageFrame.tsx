import React from 'react';
import { Page, StyleSheet, Text } from '@react-pdf/renderer';

import { pdfTheme } from '../theme';

type Props = {
  children: React.ReactNode;
  safeBottom?: number;
  pageNumberBottom?: number;
};

const PAD = pdfTheme.page.padding;

const styles = StyleSheet.create({
  page: {
    ...pdfTheme.page,
    position: 'relative',
  },
  pageNumber: {
    position: 'absolute',
    right: PAD,
    fontSize: 8,
    color: '#444',
  },
});

export function PageFrame({
  children,
  safeBottom = 12,
  pageNumberBottom = 8,
}: Props) {
  return (
    <Page
      size="LETTER"
      style={[
        styles.page,
        {
          paddingBottom: PAD + safeBottom,
        },
      ]}
      wrap
    >
      <Text
        fixed
        style={[
          styles.pageNumber,
          {
            bottom: pageNumberBottom,
          },
        ]}
        render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} de ${totalPages}`}
      />

      {children}
    </Page>
  );
}
