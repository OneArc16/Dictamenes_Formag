import React from 'react';
import { View } from '@react-pdf/renderer';
import { Bar, Stack, Sub, T, Tbl, Td, Tr, TPL } from '../components/Tpl';

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

// Proporciones de columnas de la plantilla (pt sobre 552,4 de ancho).
const COL = { clase: 147.9, criterio: 106.4, a: 133.6, b: 165.7 } as const;
const PROC_W = COL.a + COL.b;

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
      <Tr key={clase.key} minH={22}>
        <Td w={COL.clase} bg={TPL.pale}><T b>{clase.label}</T></Td>
        <Td w={COL.criterio} bg={TPL.pale}><T>{clase.descripcion}</T></Td>
        <Td w={COL.a} bg={TPL.white}><T b size={8.2}>{marcaA}</T></Td>
        <Td w={COL.b} bg={TPL.white}><T b size={8.2}>{marcaB}</T></Td>
      </Tr>
    );
  };

  return (
    <Tbl>
      {/* Barra + encabezado + primera fila: nunca quedan solos al final de la hoja */}
      <View wrap={false}>
        <Bar bg={TPL.navy} color={TPL.white} minH={16} size={8.2}>TITULO II - CAPITULO 2</Bar>

        {/* "Clase" ocupa las dos filas del encabezado (rowspan 2) */}
        <Tr minH={32}>
          <Td w={COL.clase} bg={TPL.pale} valign="top"><T>Clase</T></Td>
          <Stack w={COL.criterio + PROC_W}>
            <Sub first minH={16}>
              <Td w={COL.criterio} bg={TPL.pale}><T>Criterio 1</T></Td>
              <Td w={PROC_W} bg={TPL.pale}><T>PROCEDIMIENTO</T></Td>
            </Sub>
            <Sub minH={16}>
              <Td w={COL.criterio} bg={TPL.pale}><T>Limitaciones en el perfil laboral</T></Td>
              <Td w={COL.a} bg={TPL.pale}><T>A</T></Td>
              <Td w={COL.b} bg={TPL.pale}><T>B</T></Td>
            </Sub>
          </Stack>
        </Tr>

        {renderClaseRow(CLASES[0])}
      </View>

      {CLASES.slice(1).map(renderClaseRow)}

      <Tr minH={20}>
        <Td w={COL.clase + COL.criterio} bg={TPL.pale}><T>VALOR TOTAL</T></Td>
        <Td w={COL.a} bg={TPL.white}><T>{procedimiento === 'A' ? formatPercent(total) : ''}</T></Td>
        <Td w={COL.b} bg={TPL.white}><T>{procedimiento === 'B' ? formatPercent(total) : ''}</T></Td>
      </Tr>
    </Tbl>
  );
}
