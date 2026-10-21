import React from 'react';
import { View } from '@react-pdf/renderer';
import { Bar, T, Td, Tr, TPL } from '../components/Tpl';

type Props = { dictamen: any };

function formatDateDMY(value?: string | Date | null) {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getUTCFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

// Proporciones de columnas de la plantilla (pt sobre 552,4 de ancho).
const COL = [84.4, 111.4, 29.4, 134.3, 25.7, 115, 49.4] as const;
const EST = { label: 147, value: 106.3, entLabel: 133.2, entValue: 165.1 } as const;

export function AspectosGeneralesBlock({ dictamen }: Props) {
  const u = dictamen?.usuario ?? {};
  const ciudad = 'SANTA MARTA';

  const proc = String(dictamen?.procedimientoPcl ?? '').toUpperCase();
  const marcaA = proc === 'A' ? 'X' : '';
  const marcaB = proc === 'B' ? 'X' : '';

  const establecimiento = String(
    u?.institucionEducativaRef?.nombre ??
      dictamen?.establecimientoEducativo ??
      dictamen?.institucionEducativa ??
      '—'
  );

  const secretariaDondeLabora = String(
    u?.secretariaRef?.nombre ??
      u?.institucionEducativaRef?.secretaria?.nombre ??
      dictamen?.secretariaDondeLabora ??
      dictamen?.secretaria ??
      '—'
  );

  const fecha = formatDateDMY(dictamen?.fechaDictamen ?? dictamen?.fecha ?? null);
  const B = TPL.blue;

  return (
    <View wrap={false}>
      <Bar bg={TPL.salmon}>1. Aspectos Generales del Dictamen</Bar>

      <Tr bg={B} minH={26}>
        <Td w={COL[0]} bg={B}><T b>CIUDAD</T></Td>
        <Td w={COL[1]} bg={B}><T b align="left">ENFERMEDAD GENERAL</T></Td>
        <Td w={COL[2]} bg={B} />
        <Td w={COL[3]} bg={B}>
          <T b align="left">DECRETO 1848 DE 1968</T>
          <T b align="left">O Laboral-Profesional</T>
        </Td>
        <Td w={COL[4]} bg={B} />
        <Td w={COL[5]} bg={B}><T b>PROCEDIMIENTO A</T></Td>
        <Td w={COL[6]} bg={B}><T b>{marcaA}</T></Td>
      </Tr>

      <Tr bg={B} minH={22}>
        <Td w={COL[0]} bg={B}><T>{ciudad}</T></Td>
        <Td w={COL[1]} bg={B}><T b align="left">ATEP</T></Td>
        <Td w={COL[2]} bg={B} />
        <Td w={COL[3]} bg={B} valign="top"><T b align="left">LEY 100/93</T></Td>
        <Td w={COL[4]} bg={B} />
        <Td w={COL[5]} bg={B}><T b>PROCEDIMIENTO B</T></Td>
        <Td w={COL[6]} bg={B}><T b>{marcaB}</T></Td>
      </Tr>

      <Tr minH={32}>
        <Td w={EST.label} bg={B} valign="top">
          <T b align="left">Establecimiento educativo donde labora:</T>
        </Td>
        <Td w={EST.value} bg={TPL.light}><T>{establecimiento}</T></Td>
        <Td w={EST.entLabel} bg={TPL.mid} valign="top">
          <T b align="left">Entidad territorial donde labora:</T>
        </Td>
        <Td w={EST.entValue} bg={TPL.light}><T>{secretariaDondeLabora}</T></Td>
      </Tr>

      <Tr bg={B}>
        <Td w={1} bg={B}>
          <T b align="left">Fecha: {fecha}</T>
        </Td>
      </Tr>
    </View>
  );
}
