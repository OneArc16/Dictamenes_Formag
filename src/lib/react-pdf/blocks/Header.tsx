import React from 'react';
import { Image, View } from '@react-pdf/renderer';
import { T, Td, Tr, TPL, BW } from '../components/Tpl';

type Props = {
  logoSrc?: string | null;
  numeroDictamen?: string | null;
  fechaDictamen?: string | Date | null;
};

// En la página 1 el encabezado arranca a 1,5 cm del borde superior.
const HEADER_TOP = 42.52;
// Margen superior del contenido de todas las páginas (la norma GTC 185 pide 3 cm a partir de la
// página 2; se subió a 1,5 cm para aprovechar el espacio). `DictamenReactPdf` lo aplica a la página.
export const DICTAMEN_PAGE_TOP = 42.52;

const W = {
  logo: 147,
  title: 405.4,
  label: 303.1,
  value: 249.3,
} as const;

function formatDateDMY(value?: string | Date | null) {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';

  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getUTCFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Encabezado de la plantilla: recuadro con logo (izq.) y título (der.), y debajo
 * las filas azules "FORMULARIO DE DICTAMEN / DICTAMEN NÚMERO / FECHA DEL DICTAMEN".
 * Va solo en la página 1: se sube con margen negativo desde el margen superior
 * de 3 cm de las demás páginas hasta los 1,5 cm que pide la norma.
 */
export function HeaderBlock({ logoSrc, numeroDictamen, fechaDictamen }: Props) {
  const numero = numeroDictamen?.trim() || '—';
  const fecha = formatDateDMY(fechaDictamen);

  return (
    <View wrap={false} style={{ marginTop: HEADER_TOP - DICTAMEN_PAGE_TOP }}>
      <Tr first minH={62} bg={TPL.white} style={{ borderLeftWidth: BW }}>
        <Td w={W.logo} bg={TPL.white} px={6} py={5}>
          {logoSrc ? <Image src={logoSrc} style={{ width: '100%', height: 52, objectFit: 'contain' }} /> : null}
        </Td>
        <Td w={W.title} bg={TPL.white} px={10}>
          <T b size={7.2} style={{ textTransform: 'uppercase', lineHeight: 1.25 }}>
            FORMATO PARA EL DICTAMEN MEDICO LABORAL DE LA PERDIDA DE CAPACIDAD LABORAL O DEL ESTADO DE
            INVALIDEZ PARA LOS EDUCADORES AFILIADOS AL FONDO DE PRESTACIONES SOCIALES DEL MAGISTERIO
          </T>
        </Td>
      </Tr>

      <Tr bg={TPL.blue} style={{ borderLeftWidth: BW }}>
        <Td w={1} bg={TPL.blue}>
          <T b size={8.5}>FORMULARIO DE DICTAMEN</T>
        </Td>
      </Tr>

      <Tr bg={TPL.blue}>
        <Td w={W.label} bg={TPL.blue}>
          <T b align="left" size={8.2}>DICTAMEN NÚMERO:</T>
        </Td>
        <Td w={W.value} bg={TPL.blue}>
          <T align="left" size={8.2}>{numero}</T>
        </Td>
      </Tr>

      <Tr bg={TPL.blue}>
        <Td w={W.label} bg={TPL.blue}>
          <T b align="left" size={8.2}>FECHA DEL DICTAMEN</T>
        </Td>
        <Td w={W.value} bg={TPL.blue}>
          <T align="left" size={8.2}>{fecha}</T>
        </Td>
      </Tr>
    </View>
  );
}
