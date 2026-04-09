import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { GridBand, GridCell, GridRow } from '../components/Grid';
import { KeepTogether } from '../components/KeepTogether';
import { pdfTheme } from '../theme';

type DictamenLike = {
  [key: string]: unknown;
  sustentacionObservaciones?: unknown;
  fechaEstructuracionInvalidez?: unknown;
  tipoEvento?: unknown;
  origenEvento?: unknown;
};

type Props = {
  dictamen: DictamenLike;
};

const COLOR = {
  blue: '#9BC2E6',
  light: '#E0EDF8',
  white: '#FFFFFF',
};

const FECHA_COL = {
  label: 64,
  day: 12,
  month: 12,
  year: 12,
} as const;

const ORIGEN_COL = {
  label: 24,
  opt1: 22,
  chk1: 8,
  spacer: 16,
  opt2: 22,
  chk2: 8,
} as const;

function safeText(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function getDateParts(value: unknown) {
  if (!value) return { day: '', month: '', year: '' };

  const date = value instanceof Date ? value : new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return { day: '', month: '', year: '' };

  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    year: String(date.getFullYear()),
  };
}

function mark(value: unknown, expected: string) {
  return String(value ?? '').toUpperCase() === expected ? 'X' : '';
}

export function SustentacionTextoPart({ dictamen }: Props) {
  const sustentacion = safeText(dictamen?.sustentacionObservaciones);

  return (
    <View style={styles.textWrap}>
      <Text style={styles.text}>
        <Text style={styles.textBold}>5. SUSTENTACION Y OBSERVACIONES: </Text>
        {sustentacion}
      </Text>
    </View>
  );
}

export function SustentacionTablaOrigenPart({ dictamen }: Props) {
  const { day, month, year } = getDateParts(dictamen?.fechaEstructuracionInvalidez);

  return (
    <KeepTogether minPresenceAhead={18}>
      <GridRow style={styles.dataRow}>
        <GridCell flex={FECHA_COL.label} backgroundColor={COLOR.blue} align="flex-start">
          <Text style={styles.labelText}>
            FECHA DE ESTRUCTURACION DE LA INVALIDEZ (DIA, MES,{"\n"}ANOS)
          </Text>
        </GridCell>
        <GridCell flex={FECHA_COL.day} backgroundColor={COLOR.light}>
          <Text style={styles.valueText}>{day}</Text>
        </GridCell>
        <GridCell flex={FECHA_COL.month} backgroundColor={COLOR.light}>
          <Text style={styles.valueText}>{month}</Text>
        </GridCell>
        <GridCell flex={FECHA_COL.year} backgroundColor={COLOR.light} isLast>
          <Text style={styles.valueText}>{year}</Text>
        </GridCell>
      </GridRow>

      <GridBand backgroundColor={COLOR.blue} joinTop>
        CALIFICACIONES DEL ORIGEN
      </GridBand>

      <GridRow style={styles.dataRow}>
        <GridCell flex={ORIGEN_COL.label} backgroundColor={COLOR.blue} align="flex-start">
          <Text style={styles.labelText}>TIPO DE EVENTO:</Text>
        </GridCell>
        <GridCell flex={ORIGEN_COL.opt1} backgroundColor={COLOR.light}>
          <Text style={styles.optionText}>ENFERMEDAD</Text>
        </GridCell>
        <GridCell flex={ORIGEN_COL.chk1} backgroundColor={COLOR.white}>
          <Text style={styles.checkText}>{mark(dictamen?.tipoEvento, 'ENFERMEDAD')}</Text>
        </GridCell>
        <GridCell flex={ORIGEN_COL.spacer} backgroundColor={COLOR.white}>
          <Text style={styles.checkText}>{' '}</Text>
        </GridCell>
        <GridCell flex={ORIGEN_COL.opt2} backgroundColor={COLOR.light}>
          <Text style={styles.optionText}>ACCIDENTE</Text>
        </GridCell>
        <GridCell flex={ORIGEN_COL.chk2} backgroundColor={COLOR.white} isLast>
          <Text style={styles.checkText}>{mark(dictamen?.tipoEvento, 'ACCIDENTE')}</Text>
        </GridCell>
      </GridRow>

      <GridRow style={styles.dataRow}>
        <GridCell flex={ORIGEN_COL.label} backgroundColor={COLOR.blue} align="flex-start">
          <Text style={styles.labelText}>ORIGEN:</Text>
        </GridCell>
        <GridCell flex={ORIGEN_COL.opt1} backgroundColor={COLOR.light}>
          <Text style={styles.optionText}>LABORAL</Text>
        </GridCell>
        <GridCell flex={ORIGEN_COL.chk1} backgroundColor={COLOR.white}>
          <Text style={styles.checkText}>{mark(dictamen?.origenEvento, 'LABORAL')}</Text>
        </GridCell>
        <GridCell flex={ORIGEN_COL.spacer} backgroundColor={COLOR.white}>
          <Text style={styles.checkText}>{' '}</Text>
        </GridCell>
        <GridCell flex={ORIGEN_COL.opt2} backgroundColor={COLOR.light}>
          <Text style={styles.optionText}>COMUN</Text>
        </GridCell>
        <GridCell flex={ORIGEN_COL.chk2} backgroundColor={COLOR.white} isLast>
          <Text style={styles.checkText}>{mark(dictamen?.origenEvento, 'COMUN')}</Text>
        </GridCell>
      </GridRow>
    </KeepTogether>
  );
}

export default function SustentacionOrigenBlock({ dictamen }: Props) {
  return (
    <View>
      <SustentacionTextoPart dictamen={dictamen} />
      <SustentacionTablaOrigenPart dictamen={dictamen} />
    </View>
  );
}

const styles = StyleSheet.create({
  textWrap: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderBottomColor: pdfTheme.colors.border,
    backgroundColor: COLOR.white,
  },
  text: {
    fontSize: 8,
    lineHeight: 1.15,
    textAlign: 'justify',
  },
  textBold: {
    fontWeight: 700,
  },
  dataRow: {
    minHeight: 16,
  },
  labelText: {
    fontSize: 7.5,
    fontWeight: 700,
  },
  valueText: {
    fontSize: 8,
    fontWeight: 700,
    textAlign: 'center',
  },
  optionText: {
    fontSize: 8,
    fontWeight: 700,
    textAlign: 'center',
  },
  checkText: {
    fontSize: 9,
    fontWeight: 700,
    textAlign: 'center',
  },
});

