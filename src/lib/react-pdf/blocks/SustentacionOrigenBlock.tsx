import React from 'react';
import { View } from '@react-pdf/renderer';
import { Bar, FlowCell, Stack, Sub, T, Tbl, Td, Tr, TPL } from '../components/Tpl';

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

// Proporciones de columnas de la plantilla (pt sobre 552,4 de ancho).
const FECHA_COL = { label: 303.1, day: 84.3, month: 107.9, year: 57.9 } as const;
const ORIGEN_COL = { label: 147.9, opt: 106.4, chk: 49.3, blank: 84.3, optR: 107.9, chkR: 57.9 } as const;

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

  return <FlowCell bg={TPL.white}>{`5. SUSTENTACIÓN Y OBSERVACIONES: ${sustentacion}`}</FlowCell>;
}

export function SustentacionTablaOrigenPart({ dictamen }: Props) {
  const { day, month, year } = getDateParts(dictamen?.fechaEstructuracionInvalidez);

  return (
    <Tbl minPresence={20}>
      <View wrap={false}>
        <Tr minH={26}>
          <Td w={FECHA_COL.label} bg={TPL.blue}>
            <T align="left">FECHA DE ESTRUCTURACIÓN DE LA INVALIDEZ (DIA, MES, AÑOS)</T>
          </Td>
          <Td w={FECHA_COL.day} bg={TPL.soft}><T b>{day}</T></Td>
          <Td w={FECHA_COL.month} bg={TPL.soft}><T b>{month}</T></Td>
          <Td w={FECHA_COL.year} bg={TPL.soft}><T b>{year}</T></Td>
        </Tr>

        <Bar bg={TPL.blue} b={false} size={8}>CALIFICACIONES DEL ORIGEN</Bar>

        {/* La celda en blanco central abarca las dos filas (rowspan 2) */}
        <Tr minH={32}>
          <Stack w={ORIGEN_COL.label + ORIGEN_COL.opt + ORIGEN_COL.chk}>
            <Sub first minH={16}>
              <Td w={ORIGEN_COL.label} bg={TPL.blue}><T>TIPO DE EVENTO:</T></Td>
              <Td w={ORIGEN_COL.opt} bg={TPL.white}><T>ENFERMEDAD</T></Td>
              <Td w={ORIGEN_COL.chk} bg={TPL.soft}><T b size={9}>{mark(dictamen?.tipoEvento, 'ENFERMEDAD')}</T></Td>
            </Sub>
            <Sub minH={16}>
              <Td w={ORIGEN_COL.label} bg={TPL.blue}><T>ORIGEN:</T></Td>
              <Td w={ORIGEN_COL.opt} bg={TPL.white}><T>LABORAL</T></Td>
              <Td w={ORIGEN_COL.chk} bg={TPL.soft}><T b size={9}>{mark(dictamen?.origenEvento, 'LABORAL')}</T></Td>
            </Sub>
          </Stack>
          <Td w={ORIGEN_COL.blank} bg={TPL.white} />
          <Stack w={ORIGEN_COL.optR + ORIGEN_COL.chkR}>
            <Sub first minH={16}>
              <Td w={ORIGEN_COL.optR} bg={TPL.white}><T>ACCIDENTE</T></Td>
              <Td w={ORIGEN_COL.chkR} bg={TPL.soft}><T b size={9}>{mark(dictamen?.tipoEvento, 'ACCIDENTE')}</T></Td>
            </Sub>
            <Sub minH={16}>
              <Td w={ORIGEN_COL.optR} bg={TPL.white}><T>COMUN</T></Td>
              <Td w={ORIGEN_COL.chkR} bg={TPL.soft}><T b size={9}>{mark(dictamen?.origenEvento, 'COMUN')}</T></Td>
            </Sub>
          </Stack>
        </Tr>
      </View>
    </Tbl>
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
