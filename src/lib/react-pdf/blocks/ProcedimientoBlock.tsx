// /lib/react-pdf/blocks/ProcedimientoBlock.tsx
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = { dictamen: any };

const BW = 1;
const BC = pdfTheme.colors.border;

// Colores exactos del ejemplo
const COLOR = {
  blue: '#9BC2E6',
  light: '#E0EDF8',
  white: '#FFFFFF',
};

function toNum(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ✅ devuelve SOLO el número (sin %), porque el % ya lo pintamos afuera
function fmtNum(v: number): string {
  return Number.isInteger(v) ? `${v}` : `${v.toFixed(1)}`;
}

// ✅ para este formato: si es null o 0 → en blanco (______)
// (así evitamos que aparezca "0%")
function fmtBlankIfNullOrZero(v: number | null | undefined): string {
  if (v == null) return '______';
  if (v === 0) return '______';
  return fmtNum(v);
}

export default function ProcedimientoBlock({ dictamen }: Props) {
  const proc = (dictamen?.procedimientoPcl ?? dictamen?.procedimiento ?? 'A') as 'A' | 'B';

  // Reuso de rutas “tolerantes” como en tu otro bloque
  const t1 = toNum(dictamen?.totalTitulo1 ?? dictamen?.tituloI?.valorTotal);
  const c1 = toNum(dictamen?.totalCap1 ?? dictamen?.tituloII?.capitulo1?.valorTotal);
  const c2 = toNum(dictamen?.totalCap2 ?? dictamen?.tituloII?.capitulo2?.valorTotal);

  // ✅ totalTitulo3 (este es el campo que estás usando)
  const t3 = toNum(dictamen?.totalTitulo3 ?? dictamen?.tituloIII?.valorTotal);

  // Base = Título I + (cap1+cap2) del Título II
  const base = (() => {
    const hasAny = t1 != null || c1 != null || c2 != null;
    if (!hasAny) return null;
    return (t1 ?? 0) + (c1 ?? 0) + (c2 ?? 0);
  })();

  // (se mantiene por si lo usas como fallback del total final)
  const baseMasT3 = base != null && t3 != null ? base + t3 : null;

  // ✅ Si ya tienes el total final en dictamen, lo respetamos; si no, usamos base + t3
  const totalFinal = toNum(dictamen?.totalPcl ?? dictamen?.pclTotal ?? baseMasT3);

  // Para PROCEDIMIENTO B: solo base (T1 + T2)
  const baseB = base;

  return (
    // ✅ evita que se “parta” feo al cambiar de página
    <View style={styles.box} wrap={false} minPresenceAhead={140}>
      {/* Header */}
      <View style={styles.header} wrap={false}>
        <Text style={styles.headerText}>PROCEDIMIENTO</Text>
      </View>

      {/* Body */}
      <View style={styles.body} wrap={false}>
        {/* Líneas Procedimiento A */}
        <Text style={styles.line}>
          Valor de la Deficiencia Título I + Valor de las limitaciones y restricciones Título II ={' '}
          <Text style={styles.bold}>{proc === 'A' ? fmtBlankIfNullOrZero(base) : '______'}</Text>%{' '}
          <Text style={styles.italic}>(Valor Pérdida de Capacidad Laboral)</Text>
        </Text>

        <Text style={styles.line}>
          Valor Pérdida de Capacidad Laboral X Valor Título III ={' '}
          {/* ✅ AQUÍ VA totalTitulo3 */}
          <Text style={styles.bold}>{proc === 'A' ? fmtBlankIfNullOrZero(t3) : '______'}</Text>%{' '}
          <Text style={styles.italic}>(Valor Para para adicionar por Título III)</Text>
        </Text>

        <Text style={styles.line}>
          Valor Para para adicionar por Título III + Valor Pérdida de Capacidad Laboral ={' '}
          <Text style={styles.bold}>{proc === 'A' ? fmtBlankIfNullOrZero(totalFinal) : '______'}</Text>%{' '}
          <Text style={styles.italic}>(Valor final ajustado de PCL)</Text>
        </Text>

        {/* Separador / título Procedimiento B */}
        <Text style={[styles.line, styles.mt6]}>PROCEDIMIENTO B</Text>

        <Text style={styles.line}>
          Valor de la Deficiencia Título I + Valor de las limitaciones y restricciones Título II ={' '}
          <Text style={styles.bold}>{proc === 'B' ? fmtBlankIfNullOrZero(baseB) : '______'}</Text>%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    borderWidth: BW,
    borderColor: BC,
    backgroundColor: COLOR.light,
  },

  header: {
    backgroundColor: COLOR.blue,
    borderBottomWidth: BW,
    borderBottomColor: BC,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 8,
    fontWeight: 700,
  },

  body: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },

  line: {
    fontSize: 8,
    lineHeight: 1.15,
    marginBottom: 3,
  },

  bold: { fontWeight: 700 },
  italic: { fontStyle: 'italic' },

  mt6: { marginTop: 6 },
});