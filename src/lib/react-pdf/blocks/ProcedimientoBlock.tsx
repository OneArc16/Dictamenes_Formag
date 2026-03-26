import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { GridBand } from '../components/Grid';
import { KeepTogether } from '../components/KeepTogether';
import { pdfTheme } from '../theme';

type DictamenLike = {
  [key: string]: unknown;
  procedimientoPcl?: unknown;
  procedimiento?: unknown;
  totalTitulo1?: unknown;
  tituloI?: unknown;
  totalCap1?: unknown;
  totalCap2?: unknown;
  tituloII?: unknown;
  totalTitulo3?: unknown;
  tituloIII?: unknown;
  totalPcl?: unknown;
  pclTotal?: unknown;
};

type Props = {
  dictamen: DictamenLike;
};

const COLOR = {
  blue: '#9BC2E6',
  light: '#E0EDF8',
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function toNumber(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatValue(value: number | null | undefined): string {
  if (value == null || value === 0) return '______';
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

export default function ProcedimientoBlock({ dictamen }: Props) {
  const procedimiento =
    String(dictamen?.procedimientoPcl ?? dictamen?.procedimiento ?? 'A').toUpperCase() === 'B'
      ? 'B'
      : 'A';

  const tituloI = asRecord(dictamen?.tituloI);
  const tituloII = asRecord(dictamen?.tituloII);
  const capitulo1 = asRecord(tituloII.capitulo1);
  const capitulo2 = asRecord(tituloII.capitulo2);
  const tituloIII = asRecord(dictamen?.tituloIII);

  const totalTitulo1 = toNumber(dictamen?.totalTitulo1 ?? tituloI.valorTotal);
  const totalCap1 = toNumber(dictamen?.totalCap1 ?? capitulo1.valorTotal);
  const totalCap2 = toNumber(dictamen?.totalCap2 ?? capitulo2.valorTotal);
  const totalTitulo3 = toNumber(dictamen?.totalTitulo3 ?? tituloIII.valorTotal);

  const base = (() => {
    const hasAny = totalTitulo1 != null || totalCap1 != null || totalCap2 != null;
    if (!hasAny) return null;
    return (totalTitulo1 ?? 0) + (totalCap1 ?? 0) + (totalCap2 ?? 0);
  })();

  const baseMasTitulo3 = base != null && totalTitulo3 != null ? base + totalTitulo3 : null;
  const totalFinal = toNumber(dictamen?.totalPcl ?? dictamen?.pclTotal ?? baseMasTitulo3);

  return (
    <View>
      <GridBand backgroundColor={COLOR.blue}>Procedimiento</GridBand>

      <KeepTogether minPresenceAhead={22}>
        <View style={styles.body}>
          <Text style={styles.line}>
            Valor de la Deficiencia Titulo I + Valor de las limitaciones y restricciones Titulo II ={' '}
            <Text style={styles.bold}>{procedimiento === 'A' ? formatValue(base) : '______'}</Text>%{' '}
            <Text style={styles.italic}>(Valor perdida de capacidad laboral)</Text>
          </Text>

          <Text style={styles.line}>
            Valor perdida de capacidad laboral X Valor Titulo III ={' '}
            <Text style={styles.bold}>{procedimiento === 'A' ? formatValue(totalTitulo3) : '______'}</Text>%{' '}
            <Text style={styles.italic}>(Valor para adicionar por Titulo III)</Text>
          </Text>

          <Text style={styles.line}>
            Valor para adicionar por Titulo III + Valor perdida de capacidad laboral ={' '}
            <Text style={styles.bold}>{procedimiento === 'A' ? formatValue(totalFinal) : '______'}</Text>%{' '}
            <Text style={styles.italic}>(Valor final ajustado de PCL)</Text>
          </Text>

          <Text style={[styles.line, styles.sectionLabel]}>PROCEDIMIENTO B</Text>

          <Text style={styles.line}>
            Valor de la Deficiencia Titulo I + Valor de las limitaciones y restricciones Titulo II ={' '}
            <Text style={styles.bold}>{procedimiento === 'B' ? formatValue(base) : '______'}</Text>%
          </Text>
        </View>
      </KeepTogether>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderLeftWidth: pdfTheme.sizes.borderWidth,
    borderRightWidth: pdfTheme.sizes.borderWidth,
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderColor: pdfTheme.colors.border,
    backgroundColor: COLOR.light,
  },
  line: {
    fontSize: 8,
    lineHeight: 1.15,
    marginBottom: 3,
  },
  sectionLabel: {
    marginTop: 6,
    fontWeight: 700,
  },
  bold: {
    fontWeight: 700,
  },
  italic: {
    fontStyle: 'italic',
  },
});
