import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type ViewStyleProp = React.ComponentProps<typeof View>['style'];
type Align = 'flex-start' | 'center' | 'flex-end';

type GridBandProps = {
  children: React.ReactNode;
  backgroundColor: string;
  textColor?: string;
  height?: number;
  style?: ViewStyleProp;
  joinTop?: boolean;
  joinBottom?: boolean;
};

type GridRowProps = {
  children: React.ReactNode;
  style?: ViewStyleProp;
  wrap?: boolean;
  minPresenceAhead?: number;
  noSideBorders?: boolean;
};

type GridCellProps = {
  children: React.ReactNode;
  flex?: number;
  width?: string | number;
  style?: ViewStyleProp;
  isLast?: boolean;
  backgroundColor?: string;
  align?: Align;
  valign?: Align;
  paddingHorizontal?: number;
  paddingVertical?: number;
};

function mergeViewStyles(
  ...styles: Array<ViewStyleProp | null | undefined>
): ViewStyleProp {
  return styles.filter(Boolean) as ViewStyleProp;
}

export function GridBand({
  children,
  backgroundColor,
  textColor = pdfTheme.colors.text,
  height = 16,
  style,
  joinTop,
  joinBottom,
}: GridBandProps) {
  return (
    <View
      style={mergeViewStyles(
        styles.band,
        { backgroundColor, height },
        joinTop ? styles.joinTop : undefined,
        joinBottom ? styles.joinBottom : undefined,
        style,
      )}
      wrap={false}
    >
      <Text style={[styles.bandText, { color: textColor }]}>{children}</Text>
    </View>
  );
}

export function GridRow({
  children,
  style,
  wrap = false,
  minPresenceAhead,
  noSideBorders,
}: GridRowProps) {
  return (
    <View
      wrap={wrap}
      minPresenceAhead={minPresenceAhead}
      style={mergeViewStyles(
        styles.row,
        noSideBorders ? styles.rowNoSideBorders : undefined,
        style,
      )}
    >
      {children}
    </View>
  );
}

export function GridCell({
  children,
  flex = 1,
  width,
  style,
  isLast,
  backgroundColor,
  align = 'center',
  valign = 'center',
  paddingHorizontal = 6,
  paddingVertical = 3,
}: GridCellProps) {
  return (
    <View
      style={mergeViewStyles(
        styles.cell,
        width != null ? { width } : { flex },
        backgroundColor ? { backgroundColor } : undefined,
        { alignItems: align, justifyContent: valign, paddingHorizontal, paddingVertical },
        isLast ? styles.cellLast : undefined,
        style,
      )}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: pdfTheme.sizes.borderWidth,
    borderColor: pdfTheme.colors.border,
  },
  joinTop: {
    borderTopWidth: 0,
  },
  joinBottom: {
    borderBottomWidth: 0,
  },
  bandText: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    borderLeftWidth: pdfTheme.sizes.borderWidth,
    borderRightWidth: pdfTheme.sizes.borderWidth,
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderColor: pdfTheme.colors.border,
  },
  rowNoSideBorders: {
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  cell: {
    borderRightWidth: pdfTheme.sizes.borderWidth,
    borderColor: pdfTheme.colors.border,
  },
  cellLast: {
    borderRightWidth: 0,
  },
});
