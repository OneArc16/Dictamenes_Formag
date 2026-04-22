import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { GridBand, GridCell, GridRow } from '../components/Grid';
import { KeepTogether } from '../components/KeepTogether';
import { HeaderWithFirstRow } from '../components/Pagination';

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
  white: '#FFFFFF',
};

const COL = {
  etapa: 12,
  valorA: 14,
  separador: 8,
  valorB: 11,
} as const;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function toNumber(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatPercent(value: number | null | undefined): string {
  if (value == null) return '';
  const capped = value > 100 ? 100 : value;
  return Number.isInteger(capped) ? `${capped}%` : `${capped.toFixed(1)}%`;
}

export default function PorcentajePclBlock({ dictamen }: Props) {
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

  const totalCalculado = (() => {
    let sum = 0;
    let hasAny = false;

    for (const value of [totalTitulo1, totalCap1, totalCap2]) {
      if (value != null) {
        sum += value;
        hasAny = true;
      }
    }

    if (procedimiento === 'A' && totalTitulo3 != null) {
      sum += totalTitulo3;
      hasAny = true;
    }

    return hasAny ? sum : null;
  })();

  const totalPcl = toNumber(dictamen?.totalPcl ?? dictamen?.pclTotal ?? totalCalculado);

  const rows: Array<{ label: string; a: string; b: string; bold?: boolean }> = [
    {
      label: 'TITULO I',
      a: procedimiento === 'A' ? formatPercent(totalTitulo1) : '',
      b: procedimiento === 'B' ? formatPercent(totalTitulo1) : '',
    },
    { label: 'TITULO II', a: '', b: '' },
    {
      label: 'CAPITULO 1',
      a: procedimiento === 'A' ? formatPercent(totalCap1) : '',
      b: procedimiento === 'B' ? formatPercent(totalCap1) : '',
    },
    {
      label: 'CAPITULO 2',
      a: procedimiento === 'A' ? formatPercent(totalCap2) : '',
      b: procedimiento === 'B' ? formatPercent(totalCap2) : '',
    },
    {
      label: 'TITULO III',
      a: procedimiento === 'A' ? formatPercent(totalTitulo3) : '',
      b: '',
    },
    {
      label: 'TOTAL PCL',
      a: procedimiento === 'A' ? formatPercent(totalPcl) : '',
      b: procedimiento === 'B' ? formatPercent(totalPcl) : '',
      bold: true,
    },
  ];
  const renderRow = (row: { label: string; a: string; b: string; bold?: boolean }) => {
    const textStyle = row.bold ? styles.bodyTextBold : styles.bodyText;
    return (
      <GridRow key={row.label} style={styles.bodyRow}>
        <GridCell flex={COL.etapa} backgroundColor={COLOR.blue}>
          <Text style={textStyle}>{row.label}</Text>
        </GridCell>
        <GridCell flex={COL.valorA} backgroundColor={COLOR.light}>
          <Text style={textStyle}>{row.a}</Text>
        </GridCell>
        <GridCell flex={COL.separador} backgroundColor={COLOR.white}>
          <Text style={styles.bodyText}>{' '}</Text>
        </GridCell>
        <GridCell flex={COL.valorB} backgroundColor={COLOR.light} isLast>
          <Text style={textStyle}>{row.b}</Text>
        </GridCell>
      </GridRow>
    );
  };

  return (
    <View>
      <HeaderWithFirstRow minPresenceAhead={24}>
        <GridBand backgroundColor={COLOR.blue}>Porcentaje de perdida de capacidad laboral</GridBand>

        <GridRow style={styles.headerRow}>
          <GridCell flex={COL.etapa} backgroundColor={COLOR.blue}>
            <Text style={styles.headText}>ETAPA</Text>
          </GridCell>
          <GridCell flex={COL.valorA} backgroundColor={COLOR.light}>
            <Text style={styles.headText}>PROCEDIMIENTO A</Text>
          </GridCell>
          <GridCell flex={COL.separador} backgroundColor={COLOR.white}>
            <Text style={styles.headText}>{' '}</Text>
          </GridCell>
          <GridCell flex={COL.valorB} backgroundColor={COLOR.light} isLast>
            <Text style={styles.headText}>PROCEDIMIENTO B</Text>
          </GridCell>
        </GridRow>
        {renderRow(rows[0])}
      </HeaderWithFirstRow>

      {rows.slice(1).map((row) => {
        const isLast = Boolean(row.bold);
        const rowNode = renderRow(row);

        return isLast ? (
          <KeepTogether key={row.label} minPresenceAhead={14}>
            {rowNode}
          </KeepTogether>
        ) : (
          rowNode
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    minHeight: 32,
  },
  headText: {
    fontSize: 7.5,
    fontWeight: 700,
    textAlign: 'center',
  },
  bodyRow: {
    minHeight: 16,
  },
  bodyText: {
    fontSize: 7.5,
    textAlign: 'center',
  },
  bodyTextBold: {
    fontSize: 7.5,
    textAlign: 'center',
    fontWeight: 700,
  },
});
