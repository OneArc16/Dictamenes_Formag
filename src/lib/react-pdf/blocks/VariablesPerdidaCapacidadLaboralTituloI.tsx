import React from 'react';
import { View } from '@react-pdf/renderer';
import { Bar, T, Tbl, Td, Tr, TPL } from '../components/Tpl';

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

// Proporciones de columnas de la plantilla (pt sobre 552,4 de ancho).
const COL = { num: 55, desc: 199.3, cap: 49.3, tabla: 84.3, valor: 165.7 } as const;
const LABEL_W = COL.num + COL.desc + COL.cap + COL.tabla;

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

  const renderBodyRow = (row: DeficienciaRow | null, index: number) => (
    <Tr key={`titulo-i-${index}`} minH={16}>
      <Td w={COL.num} bg={TPL.blue}>
        <T b align="left">{index + 1}.</T>
      </Td>
      <Td w={COL.desc} bg={TPL.pale}>
        <T style={{ textTransform: 'uppercase' }}>{row?.descripcion ?? '—'}</T>
      </Td>
      <Td w={COL.cap} bg={TPL.pale}>
        <T>{row?.capitulo ?? '—'}</T>
      </Td>
      <Td w={COL.tabla} bg={TPL.pale}>
        <T>{row?.tabla ?? '—'}</T>
      </Td>
      <Td w={COL.valor} bg={TPL.soft}>
        <T>{formatPercent(row?.valorDeficiencia)}</T>
      </Td>
    </Tr>
  );

  return (
    <Tbl>
      {/* Barras + encabezado + primera fila: nunca quedan solos al final de la hoja */}
      <View wrap={false}>
        <Bar bg={TPL.salmon}>4. Variables de la pérdida de la capacidad laboral</Bar>
        <Bar bg={TPL.navy} color={TPL.white} minH={16} size={8.2}>TITULO I</Bar>
        <Tr minH={16}>
          <Td w={COL.num + COL.desc} bg={TPL.blue}>
            <T b>Descripción de la Deficiencia (s)</T>
          </Td>
          <Td w={COL.cap} bg={TPL.blue}>
            <T b>Capítulo</T>
          </Td>
          <Td w={COL.tabla} bg={TPL.blue}>
            <T b>Tabla</T>
          </Td>
          <Td w={COL.valor} bg={TPL.blue}>
            <T b>Valor de la deficiencia (%)</T>
          </Td>
        </Tr>
        {renderBodyRow(printableRows[0], 0)}
      </View>

      {printableRows.slice(1).map((row, idx) => renderBodyRow(row, idx + 1))}

      <View wrap={false}>
        <Tr minH={16}>
          <Td w={LABEL_W} bg={TPL.blue}>
            <T b align="left">Suma con fórmula de valores combinados (75% ó 50%):</T>
          </Td>
          <Td w={COL.valor} bg={TPL.soft}>
            <T b>{formatPercent(dictamen?.totalTitulo1)}</T>
          </Td>
        </Tr>
        <Tr minH={16}>
          <Td w={LABEL_W} bg={TPL.blue}>
            <T b align="right">Deficiencia</T>
          </Td>
          <Td w={COL.valor} bg={TPL.soft} />
        </Tr>
      </View>
    </Tbl>
  );
}
