import React from 'react';
import { View } from '@react-pdf/renderer';
import { T, Tbl, Td, Tr, TPL } from '../components/Tpl';

type Props = {
  dictamen: {
    diagnosticos?: unknown;
  };
};

type DiagnosticoItem = {
  cie10Codigo?: unknown;
  cie10Label?: unknown;
  nombre?: unknown;
  cie10?: {
    codigo?: unknown;
    nombre?: unknown;
  } | null;
};

function asDiagnosticoItem(value: unknown): DiagnosticoItem {
  return value && typeof value === 'object' ? (value as DiagnosticoItem) : {};
}

// Proporciones de columnas de la plantilla (pt sobre 552,4 de ancho).
const W = { num: 18, diag: 477.8, code: 56.6 } as const;

export function DiagnosticosMotivoBlock({ dictamen }: Props) {
  const items = Array.isArray(dictamen?.diagnosticos) ? dictamen.diagnosticos : [];
  const rows = items.length
    ? items.map((item, idx: number) => {
        const it = asDiagnosticoItem(item);
        const codigo = String(it.cie10Codigo ?? it.cie10?.codigo ?? '—');

        return {
          key: `${codigo}-${idx}`,
          nombre: String(it.cie10?.nombre ?? it.cie10Label ?? it.nombre ?? '—'),
          codigo,
        };
      })
    : [{ key: 'empty-0', nombre: '—', codigo: '—' }];
  const renderHeader = () => (
    <Tr minH={24}>
      <Td w={W.num + W.diag} bg={TPL.blue}>
        <T b align="left" size={7.8}>Diagnóstico (s) motivo de calificación:</T>
      </Td>
      <Td w={W.code} bg={TPL.light}>
        <T>Códigos(s){'\n'}CIE-10</T>
      </Td>
    </Tr>
  );

  const renderRow = (row: { key: string; nombre: string; codigo: string }, idx: number) => (
    <Tr key={row.key} minH={16}>
      <Td w={W.num} bg={TPL.pale} px={1.5}>
        <T b align="left">{idx + 1}.</T>
      </Td>
      <Td w={W.diag} bg={TPL.pale} px={6}>
        <T align="left" style={{ textTransform: 'uppercase' }}>{row.nombre}</T>
      </Td>
      <Td w={W.code} bg={TPL.light}>
        <T style={{ textTransform: 'uppercase' }}>{row.codigo}</T>
      </Td>
    </Tr>
  );

  // Encabezado + primera fila no se separan; el resto fluye fila a fila.
  return (
    <Tbl>
      <View wrap={false}>
        {renderHeader()}
        {renderRow(rows[0], 0)}
      </View>
      {rows.slice(1).map((row, idx) => renderRow(row, idx + 1))}
    </Tbl>
  );
}
