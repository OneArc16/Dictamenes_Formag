import React from 'react';
import { View } from '@react-pdf/renderer';
import { Bar, Stack, Sub, T, Tbl, Td, Tr, TPL } from '../components/Tpl';
import { capPcl } from '@/lib/dictamen/pcl-cap';

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

// Proporciones de columnas de la plantilla (pt sobre 552,4 de ancho).
const COL = { blankL: 54.6, etapa: 91.9, a: 106.3, sep: 49.3, b: 83.6, blankR: 165.1 } as const;

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

  const totalPcl = capPcl(toNumber(dictamen?.totalPcl ?? dictamen?.pclTotal ?? totalCalculado));

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
  return (
    <Tbl>
      {/* Todo el cuadro es una sola pieza: la barra nunca queda sola */}
      <View wrap={false}>
        <Bar bg={TPL.blue}>PORCENTAJE DE PÉRDIDA DE CAPACIDAD LABORAL</Bar>

        <Tr minH={16 * 7}>
          <Td w={COL.blankL} bg={TPL.white} />
          <Stack w={COL.etapa + COL.a + COL.sep + COL.b}>
            <Sub first minH={26}>
              <Td w={COL.etapa} bg={TPL.blue} valign="bottom"><T>ETAPA</T></Td>
              <Td w={COL.a} bg={TPL.soft}><T>PROCEDIMIENTO A</T></Td>
              <Td w={COL.sep} bg={TPL.white} />
              <Td w={COL.b} bg={TPL.blue}><T>PROCEDIMIENTO B</T></Td>
            </Sub>
            {rows.map((row) => {
              const textStyle = { b: Boolean(row.bold) };
              return (
                <Sub key={row.label} minH={16}>
                  <Td w={COL.etapa} bg={TPL.blue}><T {...textStyle}>{row.label}</T></Td>
                  <Td w={COL.a} bg={TPL.soft}><T {...textStyle}>{row.a}</T></Td>
                  <Td w={COL.sep} bg={TPL.white} />
                  <Td w={COL.b} bg={TPL.soft}><T {...textStyle}>{row.b}</T></Td>
                </Sub>
              );
            })}
          </Stack>
          <Td w={COL.blankR} bg={TPL.white} />
        </Tr>
      </View>
    </Tbl>
  );
}
