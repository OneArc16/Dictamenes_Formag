import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

export function SectionTitle({ children }: { children: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: pdfTheme.colors.sectionTitleBg,
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderBottomColor: pdfTheme.colors.border,
    paddingVertical: 3,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 8.6,
    fontWeight: 700,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: pdfTheme.colors.text,
  },
});