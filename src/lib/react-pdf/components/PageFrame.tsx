import React from 'react';
import { Page, StyleSheet, Text } from '@react-pdf/renderer';

import { pdfTheme } from '../theme';

type Props = {
  children: React.ReactNode;
  header?: React.ReactNode;
  safeBottom?: number;
  /** Sustituye el margen superior del tema (pt) en todas las páginas. */
  paddingTop?: number;
  pageNumberBottom?: number;
  pageNumberOffset?: number;
  totalPagesOffset?: number;
  renderPageNumber?: boolean;
};

const PAGE_MARGINS = {
  top: pdfTheme.page.paddingTop,
  bottom: pdfTheme.page.paddingBottom,
  left: pdfTheme.page.paddingLeft,
  right: pdfTheme.page.paddingRight,
};

const styles = StyleSheet.create({
  page: {
    ...pdfTheme.page,
  },
  pageNumber: {
    position: 'absolute',
    right: PAGE_MARGINS.right,
    fontSize: 8,
    color: '#444',
  },
});

export function PageFrame({
  children,
  header,
  safeBottom = 0,
  paddingTop,
  pageNumberBottom = 28.35,
  pageNumberOffset = 0,
  totalPagesOffset = 0,
  renderPageNumber = true,
}: Props) {
  return (
    <Page
      size="LETTER"
      style={[
        styles.page,
        {
          paddingBottom: PAGE_MARGINS.bottom + safeBottom,
          ...(paddingTop !== undefined ? { paddingTop } : {}),
        },
      ]}
      wrap
    >
      {header}
      {children}
      {renderPageNumber ? (
        <Text
          fixed
          style={[
            styles.pageNumber,
            {
              bottom: pageNumberBottom,
            },
          ]}
          render={({ pageNumber, totalPages }) => {
            const displayedPage = Math.max(1, pageNumber - pageNumberOffset);
            const displayedTotal = Math.max(displayedPage, totalPages - totalPagesOffset);

            return `Página ${displayedPage} de ${displayedTotal}`;
          }}
        />
      ) : null}
    </Page>
  );
}
