import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { GridBand, GridCell, GridRow } from '../components/Grid';
import { KeepTogether } from '../components/KeepTogether';
import { HeaderWithFirstRow } from '../components/Pagination';
import { pdfTheme } from '../theme';

type UnknownRecord = Record<string, unknown>;

type DictamenLike = {
  [key: string]: unknown;
  procedimientoPcl?: unknown;
  claseLimitacionLaboral?: unknown;
  tituloII?: unknown;
  tituloIICapitulo2Clase?: unknown;
  capitulo2TituloIIClase?: unknown;
  limitacionPerfilLaboralClase?: unknown;
  totalCap2?: unknown;
  totalTitulo2Cap2?: unknown;
  totalTituloIICap2?: unknown;
  valorTotalTituloIICap2?: unknown;
};

type Props = {
  dictamen: DictamenLike;
};

const COLOR = {
  bar: pdfTheme.colors.templateBlue,
  head: '#DAE9F7',
  left: '#DAE9F7',
  white: '#FFFFFF',
};

const COL = {
  clase: '16.6667%',
  criterio: '41.6667%',
  valorA: '20.8333%',
  valorB: '20.8333%',
  claseCriterio: '58.3334%',
  procedimiento: '41.6666%',
} as const;

const CLASES = [
  { key: 'I', label: 'I', descripcion: 'No hay dificultad o\ndificultad leve' },
  { key: 'II', label: 'II', descripcion: 'Dificultad\nmoderada' },
  { key: 'III', label: 'III', descripcion: 'Dificultad severa' },
  { key: 'IV', label: 'IV', descripcion: 'Dificultad completa' },
] as const;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? (value as UnknownRecord) : {};
}

function formatPercent(value: unknown) {
  if (value == null || value === '') return '';
  const raw = typeof value === 'object' && 'toString' in asRecord(value) ? String(value) : String(value);
  const numeric = Number(raw.replace('%', '').trim());
  if (!Number.isFinite(numeric)) return raw;
  return `${Number.isInteger(numeric) ? numeric : numeric.toFixed(1)}%`;
}

function normalizeClase(value: unknown): 'I' | 'II' | 'III' | 'IV' | null {
  if (value == null || value === '') return null;

  const normalized = String(value).trim().toUpperCase();
  if (['I', '1', 'CLASE I', 'CLASEI'].includes(normalized)) return 'I';
  if (['II', '2', 'CLASE II', 'CLASEII'].includes(normalized)) return 'II';
  if (['III', '3', 'CLASE III', 'CLASEIII'].includes(normalized)) return 'III';
  if (['IV', '4', 'CLASE IV', 'CLASEIV'].includes(normalized)) return 'IV';
  return null;
}

function getClaseSeleccionada(dictamen: DictamenLike) {
  const tituloII = asRecord(dictamen?.tituloII);
  const capitulo2 = asRecord(tituloII.capitulo2);

  return normalizeClase(
    dictamen?.claseLimitacionLaboral ??
      capitulo2.clase ??
      dictamen?.tituloIICapitulo2Clase ??
      dictamen?.capitulo2TituloIIClase ??
      dictamen?.limitacionPerfilLaboralClase,
  );
}

function getTotal(dictamen: DictamenLike) {
  const tituloII = asRecord(dictamen?.tituloII);
  const capitulo2 = asRecord(tituloII.capitulo2);

  return (
    dictamen?.totalCap2 ??
    capitulo2.valorTotal ??
    dictamen?.totalTitulo2Cap2 ??
    dictamen?.totalTituloIICap2 ??
    dictamen?.valorTotalTituloIICap2
  );
}

export function TituloIICapitulo2Block({ dictamen }: Props) {
  const procedimiento = String(dictamen?.procedimientoPcl ?? 'A').toUpperCase() === 'B' ? 'B' : 'A';
  const claseSeleccionada = getClaseSeleccionada(dictamen);
  const total = getTotal(dictamen);
  const renderClaseRow = (clase: (typeof CLASES)[number]) => {
    const marcaA = procedimiento === 'A' && claseSeleccionada === clase.key ? 'X' : '';
    const marcaB = procedimiento === 'B' && claseSeleccionada === clase.key ? 'X' : '';

    return (
      <GridRow key={clase.key} style={styles.bodyRow}>
        <GridCell width={COL.clase} backgroundColor={COLOR.left}>
          <Text style={styles.claseText}>{clase.label}</Text>
        </GridCell>
        <GridCell width={COL.criterio} backgroundColor={COLOR.white}>
          <Text style={styles.descripcionText}>{clase.descripcion}</Text>
        </GridCell>
        <GridCell width={COL.valorA} backgroundColor={COLOR.white}>
          <Text style={styles.xText}>{marcaA}</Text>
        </GridCell>
        <GridCell width={COL.valorB} backgroundColor={COLOR.white} isLast>
          <Text style={styles.xText}>{marcaB}</Text>
        </GridCell>
      </GridRow>
    );
  };

  return (
    <View>
      <HeaderWithFirstRow minPresenceAhead={22}>
        <GridBand backgroundColor={COLOR.bar} textColor={pdfTheme.colors.white}>
          Titulo II - Capitulo 2
        </GridBand>

        <GridRow style={styles.headerRow}>
          <GridCell width={COL.clase} backgroundColor={COLOR.head}>
            <Text style={styles.headText}>Clase</Text>
          </GridCell>
          <GridCell width={COL.criterio} backgroundColor={COLOR.head}>
            <Text style={styles.headText}>Criterio 1</Text>
          </GridCell>
          <GridCell width={COL.procedimiento} backgroundColor={COLOR.head} isLast>
            <Text style={styles.headText}>PROCEDIMIENTO</Text>
          </GridCell>
        </GridRow>

        <GridRow style={styles.headerRow}>
          <GridCell width={COL.clase} backgroundColor={COLOR.head}>
            <Text style={styles.headText}>{' '}</Text>
          </GridCell>
          <GridCell width={COL.criterio} backgroundColor={COLOR.head}>
            <Text style={styles.headText}>Limitaciones en el perfil laboral</Text>
          </GridCell>
          <GridCell width={COL.valorA} backgroundColor={COLOR.head}>
            <Text style={styles.headText}>A</Text>
          </GridCell>
          <GridCell width={COL.valorB} backgroundColor={COLOR.head} isLast>
            <Text style={styles.headText}>B</Text>
          </GridCell>
        </GridRow>
        {renderClaseRow(CLASES[0])}
      </HeaderWithFirstRow>

      {CLASES.slice(1).map(renderClaseRow)}

      <KeepTogether minPresenceAhead={14}>
        <GridRow style={styles.totalRow}>
          <GridCell width={COL.claseCriterio} backgroundColor={COLOR.head}>
            <Text style={styles.totalLabel}>VALOR TOTAL</Text>
          </GridCell>
          <GridCell width={COL.valorA} backgroundColor={COLOR.white}>
            <Text style={styles.totalValue}>{procedimiento === 'A' ? formatPercent(total) : ''}</Text>
          </GridCell>
          <GridCell width={COL.valorB} backgroundColor={COLOR.white} isLast>
            <Text style={styles.totalValue}>{procedimiento === 'B' ? formatPercent(total) : ''}</Text>
          </GridCell>
        </GridRow>
      </KeepTogether>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    minHeight: 18,
  },
  bodyRow: {
    minHeight: 16,
  },
  totalRow: {
    minHeight: 16,
    borderTopWidth: pdfTheme.sizes.borderWidth,
    borderTopColor: pdfTheme.colors.border,
  },
  headText: {
    fontSize: 7.6,
    fontWeight: 700,
    textAlign: 'center',
  },
  claseText: {
    fontSize: 7.6,
    fontWeight: 700,
    textAlign: 'center',
  },
  descripcionText: {
    fontSize: 7.6,
    textAlign: 'center',
    lineHeight: 1.15,
  },
  xText: {
    fontSize: 8.2,
    fontWeight: 700,
    textAlign: 'center',
  },
  totalLabel: {
    fontSize: 7.6,
    fontWeight: 700,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  totalValue: {
    fontSize: 7.6,
    textAlign: 'center',
  },
});



