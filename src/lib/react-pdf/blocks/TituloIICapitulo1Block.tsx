import React from 'react';
import { View } from '@react-pdf/renderer';
import { Bar, T, Tbl, Td, Tr, TPL } from '../components/Tpl';

type UnknownRecord = Record<string, unknown>;

type DictamenLike = {
  [key: string]: unknown;
  limitacionesAvdAivd?: unknown;
};

type Props = {
  dictamen: DictamenLike;
};

// Proporciones de columnas de la plantilla (pt sobre 552,4 de ancho).
const COL = { actividad: 303.1, a: 84.3, b: 107.9, c: 57.9 } as const;
const PROC_W = COL.a + COL.b + COL.c;

const ACTIVIDADES = [
  { key: 'MIRAR', label: 'Mirar' },
  { key: 'ESCUCHAR', label: 'Escuchar' },
  { key: 'PENSAR', label: 'Pensar' },
  { key: 'LEER', label: 'Leer' },
  { key: 'ESCRIBIR', label: 'Escribir' },
  {
    key: 'COMUNICARSE_CON_MENSAJES_ESCRITOS',
    label: 'Comunicarse con-recepción de mensajes escritos',
  },
  { key: 'HABLA', label: 'Habla' },
  {
    key: 'PRODUCCION_MENSAJES_NO_VERBALES',
    label: 'Producción de mensajes no verbales',
  },
  { key: 'MENSAJES_ESCRITOS', label: 'Mensajes escritos' },
  { key: 'CONVERSACION', label: 'Conversación' },
  {
    key: 'MANTENER_CAMBIAR_POSICION_CUERPO',
    label: 'Mantener y cambiar la posición del cuerpo y posturas corporales',
  },
  { key: 'USO_MANO_BRAZO', label: 'Uso de la mano y brazo' },
  { key: 'DESPLAZARSE_ENTORNO', label: 'Desplazarse en el entorno' },
  { key: 'USO_TRANSPORTE_PASAJERO', label: 'Utilización de transporte como pasajero' },
  { key: 'CONDUCCION', label: 'Conducción' },
  { key: 'LAVARSE', label: 'Lavarse' },
  { key: 'CUIDADO_PARTES_CUERPO', label: 'Cuidado de partes del cuerpo' },
  { key: 'VESTIRSE', label: 'Vestirse' },
  { key: 'COMER', label: 'Comer' },
  { key: 'BEBER', label: 'Beber' },
  { key: 'ADQUIRIR_LO_NECESARIO_PARA_VIVIR', label: 'Adquisición de lo necesario para vivir' },
  { key: 'ADQUIRIR_BIENES_SERVICIOS', label: 'Adquisición de bienes y servicios' },
  { key: 'PREPARAR_COMIDAS', label: 'Preparar comidas' },
  { key: 'QUEHACERES_CASA', label: 'Realizar los quehaceres de la casa' },
  { key: 'AYUDAR_A_LOS_DEMAS', label: 'Ayudar a los demás' },
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

  const renderActivityRow = (actividad: (typeof ACTIVIDADES)[number]) => {
    const value = valuesByActivity.get(actividad.key);
    const selectedIndex = value == null ? -1 : coeffs.findIndex((coef) => almostEqual(value, coef));
    const mark = (i: number) => (selectedIndex === i ? 'X' : ' ');

    return (
      <Tr key={actividad.key} minH={16}>
        <Td w={COL.actividad} bg={TPL.pale} px={6}>
          <T align="left">{actividad.label}</T>
        </Td>
        <Td w={COL.a} bg={TPL.white}><T b size={8.2}>{mark(0)}</T></Td>
        <Td w={COL.b} bg={TPL.white}><T b size={8.2}>{mark(1)}</T></Td>
        <Td w={COL.c} bg={TPL.white}><T b size={8.2}>{mark(2)}</T></Td>
      </Tr>
    );
  };

  const renderSumRow = () => (
    <Tr minH={16}>
      <Td w={COL.actividad} bg={TPL.blue}><T b>SUMATORIA</T></Td>
      <Td w={COL.a} bg={TPL.white}><T b size={8.2}>{formatCoef(sumatorias[0])}</T></Td>
      <Td w={COL.b} bg={TPL.white}><T b size={8.2}>{formatCoef(sumatorias[1])}</T></Td>
      <Td w={COL.c} bg={TPL.white}><T b size={8.2}>{formatCoef(sumatorias[2])}</T></Td>
    </Tr>
  );

  const lastIndex = ACTIVIDADES.length - 1;

  return (
    <Tbl>
      {/* Barra + encabezado + primera fila: nunca quedan solos al final de la hoja */}
      <View wrap={false}>
        <Bar bg={TPL.navy} color={TPL.white} minH={16} size={8.2}>TITULO II - CAPITULO 1</Bar>
        <Tr minH={16}>
          <Td w={COL.actividad} bg={TPL.pale} />
          <Td w={PROC_W} bg={TPL.pale}><T b>Procedimiento</T></Td>
        </Tr>
        <Tr minH={16}>
          <Td w={COL.actividad} bg={TPL.pale} px={6}><T align="left">CATEGORÍAS DE ACTIVIDADES</T></Td>
          <Td w={PROC_W} bg={TPL.pale}><T>B</T></Td>
        </Tr>
        <Tr minH={16}>
          <Td w={COL.actividad} bg={TPL.pale} />
          <Td w={COL.a} bg={TPL.white}><T>{formatCoef(coeffs[0])}</T></Td>
          <Td w={COL.b} bg={TPL.white}><T>{formatCoef(coeffs[1])}</T></Td>
          <Td w={COL.c} bg={TPL.white}><T>{formatCoef(coeffs[2])}</T></Td>
        </Tr>
        {renderActivityRow(ACTIVIDADES[0])}
      </View>

      {ACTIVIDADES.slice(1, lastIndex).map(renderActivityRow)}

      {/* La última actividad viaja con la SUMATORIA */}
      <View wrap={false}>
        {renderActivityRow(ACTIVIDADES[lastIndex])}
        {renderSumRow()}
      </View>
    </Tbl>
  );
}
