import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { GridBand, GridCell, GridRow } from '../components/Grid';
import { KeepTogether } from '../components/KeepTogether';
import { pdfTheme } from '../theme';

type UnknownRecord = Record<string, unknown>;

type DictamenLike = {
  [key: string]: unknown;
  limitacionesAvdAivd?: unknown;
};

type Props = {
  dictamen: DictamenLike;
};

const COLOR = {
  bar: pdfTheme.colors.templateBlue,
  left: '#DAE9F7',
  head: '#DAE9F7',
  sumLeft: '#9BC2E6',
  white: '#FFFFFF',
};

const COL = {
  actividad: '66.6667%',
  valorA: '11.1111%',
  valorB: '11.1111%',
  valorC: '11.1111%',
  procedimiento: '33.3333%',
} as const;

const ACTIVIDADES = [
  { key: 'MIRAR', label: 'MIRAR' },
  { key: 'ESCUCHAR', label: 'ESCUCHAR' },
  { key: 'PENSAR', label: 'PENSAR' },
  { key: 'LEER', label: 'LEER' },
  { key: 'ESCRIBIR', label: 'ESCRIBIR' },
  {
    key: 'COMUNICARSE_CON_MENSAJES_ESCRITOS',
    label: 'COMUNICARSE CON-RECEPCIÓN DE MENSAJES\nESCRITOS',
  },
  { key: 'HABLA', label: 'HABLA' },
  {
    key: 'PRODUCCION_MENSAJES_NO_VERBALES',
    label: 'PRODUCCIÓN DE MENSAJES NO VERBALES',
  },
  { key: 'MENSAJES_ESCRITOS', label: 'MENSAJES ESCRITOS' },
  { key: 'CONVERSACION', label: 'CONVERSACIÓN' },
  {
    key: 'MANTENER_CAMBIAR_POSICION_CUERPO',
    label: 'MANTENER Y CAMBIAR LA POSICIÓN DEL CUERPO Y\nPOSTURAS CORPORALES',
  },
  { key: 'USO_MANO_BRAZO', label: 'USO DE LA MANO Y BRAZO' },
  { key: 'DESPLAZARSE_ENTORNO', label: 'DESPLAZARSE EN EL ENTORNO' },
  { key: 'USO_TRANSPORTE_PASAJERO', label: 'UTILIZACIÓN DE TRANSPORTE COMO PASAJERO' },
  { key: 'CONDUCCION', label: 'CONDUCCIÓN' },
  { key: 'LAVARSE', label: 'LAVARSE' },
  { key: 'CUIDADO_PARTES_CUERPO', label: 'CUIDADO DE PARTES DEL CUERPO' },
  { key: 'VESTIRSE', label: 'VESTIRSE' },
  { key: 'COMER', label: 'COMER' },
  { key: 'BEBER', label: 'BEBER' },
  { key: 'ADQUIRIR_LO_NECESARIO_PARA_VIVIR', label: 'ADQUISICIÓN DE LO NECESARIO PARA VIVIR' },
  { key: 'ADQUIRIR_BIENES_SERVICIOS', label: 'ADQUISICIÓN DE BIENES Y SERVICIOS' },
  { key: 'PREPARAR_COMIDAS', label: 'PREPARAR COMIDAS' },
  { key: 'QUEHACERES_CASA', label: 'REALIZAR LOS QUEHACERES DE LA CASA' },
  { key: 'AYUDAR_A_LOS_DEMAS', label: 'AYUDAR A LOS DEMÁS' },
] as const;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? (value as UnknownRecord) : {};
}

function toNumber(value: unknown) {
  if (value == null || value === '') return null;
  const normalized = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

function formatCoef(value: number) {
  return value.toFixed(1).replace('.', ',');
}

function almostEqual(left: number, right: number) {
  return Math.abs(left - right) < 0.0001;
}

export function TituloIICapitulo1Block({ dictamen }: Props) {
  const coeffs = [0.6, 0.3, 0.0];
  const valuesByActivity = new Map<string, number>();
  const limitaciones = Array.isArray(dictamen?.limitacionesAvdAivd)
    ? dictamen.limitacionesAvdAivd
    : [];

  for (const item of limitaciones) {
    const record = asRecord(item);
    const actividad = String(record.actividad ?? '');
    const valor = toNumber(record.valor);
    if (actividad && valor != null) {
      valuesByActivity.set(actividad, valor);
    }
  }

  const sumatorias = [0, 0, 0];
  for (const actividad of ACTIVIDADES) {
    const value = valuesByActivity.get(actividad.key);
    const index = value == null ? -1 : coeffs.findIndex((coef) => almostEqual(value, coef));
    if (index >= 0) {
      sumatorias[index] += coeffs[index];
    }
  }

  return (
    <View>
      <KeepTogether minPresenceAhead={24}>
        <GridBand
          backgroundColor={COLOR.bar}
          textColor={pdfTheme.colors.white}
        >
          Titulo II - Capitulo 1
        </GridBand>

        <GridRow style={styles.headerRow}>
          <GridCell width={COL.actividad} backgroundColor={COLOR.head}>
            <Text style={styles.headText}>{' '}</Text>
          </GridCell>
          <GridCell
            width={COL.procedimiento}
            backgroundColor={COLOR.head}
            isLast
          >
            <Text style={styles.headText}>PROCEDIMIENTO</Text>
          </GridCell>
        </GridRow>

        <GridRow style={styles.headerRow}>
          <GridCell
            width={COL.actividad}
            backgroundColor={COLOR.head}
            align="flex-start"
          >
            <Text style={styles.headTextLeft}>CATEGORÍAS DE ACTIVIDADES</Text>
          </GridCell>
          <GridCell
            width={COL.procedimiento}
            backgroundColor={COLOR.white}
            isLast
          >
            <Text style={styles.headText}>B</Text>
          </GridCell>
        </GridRow>

        <GridRow style={styles.headerRow}>
          <GridCell width={COL.actividad} backgroundColor={COLOR.head}>
            <Text style={styles.headText}>{' '}</Text>
          </GridCell>
          <GridCell width={COL.valorA} backgroundColor={COLOR.white}>
            <Text style={styles.headText}>{formatCoef(coeffs[0])}</Text>
          </GridCell>
          <GridCell width={COL.valorB} backgroundColor={COLOR.white}>
            <Text style={styles.headText}>{formatCoef(coeffs[1])}</Text>
          </GridCell>
          <GridCell width={COL.valorC} backgroundColor={COLOR.white} isLast>
            <Text style={styles.headText}>{formatCoef(coeffs[2])}</Text>
          </GridCell>
        </GridRow>
      </KeepTogether>

      {ACTIVIDADES.map((actividad) => {
        const value = valuesByActivity.get(actividad.key);
        const selectedIndex =
          value == null ? -1 : coeffs.findIndex((coef) => almostEqual(value, coef));

        return (
          <GridRow key={actividad.key} style={styles.activityRow}>
            <GridCell
              width={COL.actividad}
              backgroundColor={COLOR.left}
              align="flex-start"
            >
              <Text style={styles.activityText}>{actividad.label}</Text>
            </GridCell>
            <GridCell width={COL.valorA} backgroundColor={COLOR.white}>
              <Text style={styles.xText}>{selectedIndex === 0 ? 'X' : ' '}</Text>
            </GridCell>
            <GridCell width={COL.valorB} backgroundColor={COLOR.white}>
              <Text style={styles.xText}>{selectedIndex === 1 ? 'X' : ' '}</Text>
            </GridCell>
            <GridCell width={COL.valorC} backgroundColor={COLOR.white} isLast>
              <Text style={styles.xText}>{selectedIndex === 2 ? 'X' : ' '}</Text>
            </GridCell>
          </GridRow>
        );
      })}

      <KeepTogether minPresenceAhead={16}>
        <GridRow style={styles.sumRow}>
          <GridCell width={COL.actividad} backgroundColor={COLOR.sumLeft}>
            <Text style={styles.sumText}>SUMATORIA</Text>
          </GridCell>
          <GridCell width={COL.valorA} backgroundColor={COLOR.white}>
            <Text style={styles.xText}>{formatCoef(sumatorias[0])}</Text>
          </GridCell>
          <GridCell width={COL.valorB} backgroundColor={COLOR.white}>
            <Text style={styles.xText}>{formatCoef(sumatorias[1])}</Text>
          </GridCell>
          <GridCell width={COL.valorC} backgroundColor={COLOR.white} isLast>
            <Text style={styles.xText}>{formatCoef(sumatorias[2])}</Text>
          </GridCell>
        </GridRow>
      </KeepTogether>
    </View>
  );
}

const styles = StyleSheet.create({
  barText: {
    fontSize: 8,
    fontWeight: 700,
  },
  headerRow: {
    minHeight: 16,
  },
  headText: {
    fontSize: 7.6,
    fontWeight: 700,
    textAlign: 'center',
  },
  headTextLeft: {
    fontSize: 7.6,
    fontWeight: 700,
    textAlign: 'left',
  },
  activityRow: {
    minHeight: 16,
  },
  activityText: {
    fontSize: 7.6,
    textAlign: 'left',
    textTransform: 'uppercase',
    lineHeight: 1.15,
  },
  xText: {
    fontSize: 8.2,
    fontWeight: 700,
    textAlign: 'center',
  },
  sumRow: {
    minHeight: 16,
    borderTopWidth: pdfTheme.sizes.borderWidth,
    borderTopColor: pdfTheme.colors.border,
  },
  sumText: {
    fontSize: 7.6,
    fontWeight: 700,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});






