import React from 'react';
import { View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = {
  logoSrc?: string | null;
  numeroDictamen?: string | null;
  fechaDictamen?: string | Date | null;
};

function formatDateDMY(value?: string | Date | null) {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';

  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getUTCFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

const styles = StyleSheet.create({
  wrap: { borderWidth: pdfTheme.sizes.borderWidth, borderColor: pdfTheme.colors.border },

  topRow: { flexDirection: 'row', height: pdfTheme.sizes.headerTopH },
  logoCell: {
    width: pdfTheme.sizes.logoW,
    borderRightWidth: pdfTheme.sizes.borderWidth,
    borderRightColor: pdfTheme.colors.border,
    backgroundColor: pdfTheme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  logo: {
    width: pdfTheme.sizes.logoW - 18,
    height: pdfTheme.sizes.headerTopH - 18,
    objectFit: 'contain',
  },
  textCell: {
    flex: 1,
    backgroundColor: pdfTheme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  topText: {
    fontSize: 7.2,
    fontWeight: 700,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: pdfTheme.colors.text,
    lineHeight: 1.2,
  },

  bandRow: {
    height: pdfTheme.sizes.headerBandH,
    backgroundColor: pdfTheme.colors.templateBlue,
    borderTopWidth: pdfTheme.sizes.borderWidth,
    borderTopColor: pdfTheme.colors.border,
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderBottomColor: pdfTheme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bandText: {
    fontSize: 8.5,
    fontWeight: 700,
    textAlign: 'center',
    textTransform: 'uppercase',
    color: pdfTheme.colors.text,
  },

  metaRow: {
    flexDirection: 'row',
    height: pdfTheme.sizes.headerRowH,
    backgroundColor: pdfTheme.colors.templateBlue,
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderBottomColor: pdfTheme.colors.border,
  },
  cellLeft: {
    flex: 1.2,
    borderRightWidth: pdfTheme.sizes.borderWidth,
    borderRightColor: pdfTheme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  cellRight: { flex: 1, justifyContent: 'center', paddingHorizontal: 6 },
  label: {
    fontSize: 8.2,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: pdfTheme.colors.text,
  },
  value: { fontSize: 8.2, color: pdfTheme.colors.text },
});

export function HeaderBlock(props: Props) {
  const numero = props.numeroDictamen?.trim() || '—';
  const fecha = formatDateDMY(props.fechaDictamen);

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.logoCell}>
          {props.logoSrc ? <Image src={props.logoSrc} style={styles.logo} /> : null}
        </View>

        <View style={styles.textCell}>
          <Text style={styles.topText}>
            FORMATO PARA EL DICTAMEN MEDICO LABORAL DE LA PERDIDA DE CAPACIDAD LABORAL O DEL
            ESTADO DE INVALIDEZ PARA LOS EDUCADORES AFILIADOS AL FONDO DE PRESTACIONES SOCIALES
            DEL MAGISTERIO
          </Text>
        </View>
      </View>

      <View style={styles.bandRow}>
        <Text style={styles.bandText}>FORMULARIO DE DICTAMEN</Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.cellLeft}>
          <Text style={styles.label}>DICTAMEN NÃšMERO:</Text>
        </View>
        <View style={styles.cellRight}>
          <Text style={styles.value}>{numero}</Text>
        </View>
      </View>

      <View style={[styles.metaRow, { borderBottomWidth: 0 }]}>
        <View style={styles.cellLeft}>
          <Text style={styles.label}>FECHA DEL DICTAMEN</Text>
        </View>
        <View style={styles.cellRight}>
          <Text style={styles.value}>{fecha}</Text>
        </View>
      </View>
    </View>
  );
}
