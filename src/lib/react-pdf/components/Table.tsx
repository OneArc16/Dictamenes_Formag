import React from 'react';
import { View, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type AnyStyle = any;

export function Table({ children, style }: { children: React.ReactNode; style?: AnyStyle }) {
  return <View style={[styles.table, style]}>{children}</View>;
}

export function Tr({
  children,
  isLast,
  style,
}: {
  children: React.ReactNode;
  isLast?: boolean;
  style?: AnyStyle;
}) {
  return <View style={[styles.row, isLast && styles.rowLast, style]}>{children}</View>;
}

export function Td({
  children,
  flex = 1,
  isLast,
  bg,
  align = 'center',
  valign = 'center',
  padding = 6,
  style,
}: {
  children: React.ReactNode;
  flex?: number;
  isLast?: boolean;
  bg?: string;
  align?: 'flex-start' | 'center' | 'flex-end';
  valign?: 'flex-start' | 'center' | 'flex-end';
  padding?: number;
  style?: AnyStyle;
}) {
  return (
    <View
      style={[
        styles.cell,
        { flex, padding, alignItems: align, justifyContent: valign },
        bg ? { backgroundColor: bg } : null,
        isLast && styles.cellLast,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    borderWidth: pdfTheme.sizes.borderWidth,
    borderColor: pdfTheme.colors.border,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderBottomColor: pdfTheme.colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  cell: {
    borderRightWidth: pdfTheme.sizes.borderWidth,
    borderRightColor: pdfTheme.colors.border,
  },
  cellLast: {
    borderRightWidth: 0,
  },
});