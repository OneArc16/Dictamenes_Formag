// src/lib/react-pdf/styles.ts
import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingBottom: 22,
    paddingHorizontal: 22,
    fontSize: 8.5,
    lineHeight: 1.2,
  },

  fontNormal: { fontSize: 8.5 },
  fontSmall: { fontSize: 7.5 },

  h1: { fontSize: 10.5, fontWeight: 700, textAlign: 'center' },
  h2: { fontSize: 9.2, fontWeight: 700 },

  box: { borderWidth: 0.95, borderColor: '#000' },
  boxThin: { borderWidth: 0.75, borderColor: '#000' },

  sectionTitle: {
    fontWeight: 700,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderWidth: 0.95,
    borderColor: '#000',
    textAlign: 'center',
  },

  row: { flexDirection: 'row' },

  cell: {
    borderRightWidth: 0.95,
    borderRightColor: '#000',
    paddingHorizontal: 4,
    paddingVertical: 3,
  },

  cellLast: {
    paddingHorizontal: 4,
    paddingVertical: 3,
  },

  label: { fontWeight: 700 },
});

