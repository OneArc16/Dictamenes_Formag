import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { Bar, Tbl, Td, Tr, TPL } from '../components/Tpl';

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

  const line = { fontSize: 8, lineHeight: 1.2, marginBottom: 3 } as const;
  const bold = { fontWeight: 700 } as const;
  const boldItalic = { fontWeight: 700, fontStyle: 'italic' } as const;

  return (
    <Tbl>
      <View wrap={false}>
        <Bar bg={TPL.blue}>PROCEDIMIENTO</Bar>

        <Tr minH={60}>
          <Td w={1} bg={TPL.pale} valign="top" px={6} py={6}>
            <Text style={line}>
              Valor de la Deficiencia Título I + Valor de las limitaciones y restricciones Título II ={' '}
              <Text style={bold}>{procedimiento === 'A' ? formatValue(base) : '______'}</Text>
              <Text style={bold}>%</Text>{' '}
              <Text style={boldItalic}>(Valor Pérdida de Capacidad Laboral)</Text>
            </Text>

            <Text style={[line, bold]}>
              Valor Pérdida de Capacidad Laboral X Valor Título III ={' '}
              {procedimiento === 'A' ? formatValue(totalTitulo3) : '______'}%{' '}
              <Text style={boldItalic}>(Valor para adicionar por Título III)</Text>
            </Text>

            <Text style={[line, bold]}>
              Valor para adicionar por Título III + Valor Pérdida de Capacidad Laboral ={' '}
              {procedimiento === 'A' ? formatValue(totalFinal) : '______'}%{' '}
              <Text style={boldItalic}>(Valor final ajustado de PCL)</Text>
            </Text>

            <Text style={line}>PROCEDIMIENTO B</Text>

            <Text style={line}>
              Valor de la Deficiencia Título I + Valor de las limitaciones y restricciones Título II ={' '}
              {procedimiento === 'B' ? formatValue(base) : '______'}%
            </Text>
          </Td>
        </Tr>
      </View>
    </Tbl>
  );
}
