import { StyleSheet } from '@react-pdf/renderer';

export const theme = {
  font: 'Helvetica',
  fontSize: 8.4,
  lineHeight: 1.2,
  border: 1,
  padX: 4,
  padY: 3,
};

export const styles = StyleSheet.create({
  page: {
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 18,
    fontFamily: theme.font,
    fontSize: theme.fontSize,
    lineHeight: theme.lineHeight,
    color: '#000',
  },
  h1: { fontSize: 10.5, fontWeight: 700 },
  small: { fontSize: 7.5 },
  bold: { fontWeight: 700 },
});