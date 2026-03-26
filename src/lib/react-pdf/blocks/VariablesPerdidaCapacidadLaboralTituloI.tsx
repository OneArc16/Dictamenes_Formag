import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { GridBand, GridCell, GridRow } from '../components/Grid';
import { KeepTogether } from '../components/KeepTogether';
import { pdfTheme } from '../theme';

type UnknownRecord = Record<string, unknown>;

type DictamenLike = {
  [key: string]: unknown;
  deficiencias?: unknown;
  procedimientoPcl?: unknown;
  totalTitulo1?: unknown;
};

type DeficienciaRow = {
  descripcion: string;
  capitulo: string;
  tabla: string;
  valorDeficiencia: unknown;
};

type Props = {
  dictamen: DictamenLike;
};

const COLOR = {
  title: '#FCE4D6',
  bar: pdfTheme.colors.templateBlue,
  head: '#9BC2E6',
  body: '#DAE9F7',
};

const COL = {
  num: '5.8824%',
  desc: '47.0588%',
  cap: '11.7647%',
  tabla: '17.6471%',
  valor: '17.6471%',
  beforeValor: '82.3529%',
} as const;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? (value as UnknownRecord) : {};
}

function formatPercent(value: unknown) {
  if (value == null || value === '') return '—';

  const normalized =
    typeof value === 'string' ? Number(String(value).replace('%', '').trim()) : Number(value);

  if (!Number.isFinite(normalized)) return String(value);
  return `${Number.isInteger(normalized) ? normalized : normalized.toFixed(1)}%`;
}

function buildTablaLabel(tablaBase: unknown, claseNombre: unknown) {
  const base = String(tablaBase ?? '—').trim();
  const clase = String(claseNombre ?? '').trim();
  if (!clase) return base;

  const shortClase = clase.replace(/^clase\s*/i, '').trim();
  if (!shortClase) return base;

  return `${base} (clase ${shortClase.toUpperCase()})`;
}

function extractRows(dictamen: DictamenLike): DeficienciaRow[] {
  const deficiencias = Array.isArray(dictamen?.deficiencias) ? dictamen.deficiencias : [];

  return deficiencias.map((item) => {
    const record = asRecord(item);
    const deficiencia = asRecord(record.deficiencia);
    const clase = asRecord(record.clase);

    return {
      descripcion: String(deficiencia.nombre ?? '—'),
      capitulo: String(deficiencia.capitulo ?? '—'),
      tabla: buildTablaLabel(deficiencia.tabla, clase.nombre),
      valorDeficiencia: record.valorDeficiencia,
    };
  });
}

export function VariablesPerdidaCapacidadLaboralTituloIBlock({ dictamen }: Props) {
  const rows = extractRows(dictamen);
  const printableRows = rows.length ? rows : [null];
  const procedimiento = String(dictamen?.procedimientoPcl ?? '').toUpperCase();
  const ponderacionMax = procedimiento === 'B' ? 50 : 75;

  return (
    <View>
      <KeepTogether minPresenceAhead={24}>
        <GridBand
          backgroundColor={COLOR.title}
          style={styles.titleBand}
          joinBottom
        >
          4. Variables de la pérdida de la capacidad laboral
        </GridBand>

        <GridBand
          backgroundColor={COLOR.bar}
          textColor={pdfTheme.colors.white}
        >
          Titulo I
        </GridBand>

        <GridRow style={styles.headRow}>
          <GridCell width={COL.num} backgroundColor={COLOR.head}>
            <Text style={styles.headText}>{' '}</Text>
          </GridCell>
          <GridCell width={COL.desc} backgroundColor={COLOR.head}>
            <Text style={styles.headText}>Descripción de la deficiencia(s)</Text>
          </GridCell>
          <GridCell width={COL.cap} backgroundColor={COLOR.head}>
            <Text style={styles.headText}>Capítulo</Text>
          </GridCell>
          <GridCell width={COL.tabla} backgroundColor={COLOR.head}>
            <Text style={styles.headText}>Tabla</Text>
          </GridCell>
          <GridCell width={COL.valor} backgroundColor={COLOR.head} isLast>
            <Text style={styles.headText}>Valor de la deficiencia (%)</Text>
          </GridCell>
        </GridRow>
      </KeepTogether>

      {printableRows.map((row, index) => (
        <GridRow key={`titulo-i-${index}`} style={styles.bodyRow}>
          <GridCell width={COL.num} backgroundColor={COLOR.body}>
            <Text style={styles.indexText}>{index + 1}.</Text>
          </GridCell>
          <GridCell width={COL.desc} backgroundColor={COLOR.body}>
            <Text style={styles.descriptionText}>{row?.descripcion ?? '—'}</Text>
          </GridCell>
          <GridCell width={COL.cap} backgroundColor={COLOR.body}>
            <Text style={styles.valueText}>{row?.capitulo ?? '—'}</Text>
          </GridCell>
          <GridCell width={COL.tabla} backgroundColor={COLOR.body}>
            <Text style={styles.valueText}>{row?.tabla ?? '—'}</Text>
          </GridCell>
          <GridCell width={COL.valor} backgroundColor={COLOR.body} isLast>
            <Text style={styles.valueText}>{formatPercent(row?.valorDeficiencia)}</Text>
          </GridCell>
        </GridRow>
      ))}

      <KeepTogether minPresenceAhead={18}>
        <GridRow style={styles.summaryRow}>
          <GridCell width={COL.beforeValor} backgroundColor={COLOR.head}>
            <Text style={styles.summaryText}>
              Suma con fórmula de valores combinados (75% ó 50%):
            </Text>
          </GridCell>
          <GridCell width={COL.valor} backgroundColor={COLOR.head} isLast>
            <Text style={styles.summaryText}>{formatPercent(dictamen?.totalTitulo1)}</Text>
          </GridCell>
        </GridRow>

        <GridRow style={styles.footerRow}>
          <GridCell
            width={COL.beforeValor}
            backgroundColor={COLOR.head}
            align="flex-end"
          >
            <Text style={styles.footerLeftText}>Deficiencia</Text>
          </GridCell>
          <GridCell width={COL.valor} backgroundColor={COLOR.head} isLast align="flex-start">
            <Text style={styles.footerRightText}>Ponderación máxima: {ponderacionMax}%</Text>
          </GridCell>
        </GridRow>
      </KeepTogether>
    </View>
  );
}

const styles = StyleSheet.create({
  titleBand: {
    height: 18,
  },
  titleText: {
    fontSize: 8.4,
    fontWeight: 700,
  },
  barText: {
    fontSize: 8,
    fontWeight: 700,
  },
  headRow: {
    minHeight: 18,
  },
  headText: {
    fontSize: 7.6,
    fontWeight: 700,
    textAlign: 'center',
  },
  bodyRow: {
    minHeight: 16,
  },
  indexText: {
    fontSize: 7.6,
    fontWeight: 700,
  },
  descriptionText: {
    fontSize: 7.6,
    textTransform: 'uppercase',
  },
  valueText: {
    fontSize: 7.6,
    textAlign: 'center',
  },
  summaryRow: {
    minHeight: 16,
    borderTopWidth: pdfTheme.sizes.borderWidth,
    borderTopColor: pdfTheme.colors.border,
  },
  summaryText: {
    fontSize: 7.6,
    fontWeight: 700,
    textAlign: 'center',
  },
  footerRow: {
    minHeight: 16,
  },
  footerLeftText: {
    fontSize: 7.6,
    fontWeight: 700,
    textAlign: 'right',
  },
  footerRightText: {
    fontSize: 7.6,
    textAlign: 'left',
  },
});




