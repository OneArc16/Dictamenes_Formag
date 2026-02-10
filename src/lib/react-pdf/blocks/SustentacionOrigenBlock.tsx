// /lib/react-pdf/blocks/SustentacionOrigenBlock.tsx
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = { dictamen: any };

const BW = 1.2;
const BC = pdfTheme.colors.border;

const COLOR = {
  blue: '#9BC2E6',
  light: '#E0EDF8',
  white: '#FFFFFF',
};

function safeText(v: any): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

function dateParts(v: any): { dd: string; mm: string; yyyy: string } {
  if (!v) return { dd: '', mm: '', yyyy: '' };
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return { dd: '', mm: '', yyyy: '' };

  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  return { dd, mm, yyyy };
}

// ancho fijo por % (evita “torcido”)
const w = (n: number, total: number) => ({ width: `${(n / total) * 100}%` });

export default function SustentacionOrigenBlock({ dictamen }: Props) {
  const sust = safeText(dictamen?.sustentacionObservaciones);

  const { dd, mm, yyyy } = dateParts(dictamen?.fechaEstructuracionInvalidez);

  const tipo = dictamen?.tipoEvento as 'ENFERMEDAD' | 'ACCIDENTE' | undefined;
  const origen = dictamen?.origenEvento as 'LABORAL' | 'COMUN' | undefined;

  const mark = (val: any, expected: any) => (val === expected ? 'X' : '');

  // Columnas FECHA (deja el 3er cuadro ligeramente diferente si quieres, pero aquí van estables)
  const COL_DATE = { label: 64, d: 12, m: 12, y: 12 } as const;
  const TOTAL_DATE = COL_DATE.label + COL_DATE.d + COL_DATE.m + COL_DATE.y;

  // Columnas CALIFICACIONES (label + opcion + check + separador + opcion + check)
  const COL = { label: 24, opt1: 22, chk1: 8, sep: 16, opt2: 22, chk2: 8 } as const;
  const TOTAL = COL.label + COL.opt1 + COL.chk1 + COL.sep + COL.opt2 + COL.chk2;

  // bloque completo “no-partible” (como el formato)
  return (
    <View style={styles.box} wrap={false} minPresenceAhead={170}>
      {/* 5. Sustentación y Observaciones */}
      <View style={styles.sustWrap}>
        <Text style={styles.sustText}>
          <Text style={styles.bold}>5. SUSTENTACIÓN Y OBSERVACIONES: </Text>
          {sust}
        </Text>
      </View>

      {/* Fecha estructuración */}
      <View style={[styles.row, styles.bb]} wrap={false}>
        <View style={[styles.cellLeft, w(COL_DATE.label, TOTAL_DATE), styles.blueCell]}>
          <Text style={styles.leftLabel}>
            FECHA DE ESTRUCTURACIÓN DE LA INVALIDEZ (DIA, MES,{'\n'}AÑOS)
          </Text>
        </View>

        <View style={[styles.cellCenter, styles.bl, w(COL_DATE.d, TOTAL_DATE), styles.lightCell]}>
          <Text style={styles.valueText}>{dd}</Text>
        </View>

        <View style={[styles.cellCenter, styles.bl, w(COL_DATE.m, TOTAL_DATE), styles.lightCell]}>
          <Text style={styles.valueText}>{mm}</Text>
        </View>

        <View style={[styles.cellCenter, styles.bl, w(COL_DATE.y, TOTAL_DATE), styles.lightCell]}>
          <Text style={styles.valueText}>{yyyy}</Text>
        </View>
      </View>

      {/* Header calificaciones */}
      <View style={[styles.headerRow, styles.bb]} wrap={false}>
        <Text style={styles.headerText}>CALIFICACIONES DEL ORIGEN</Text>
      </View>

      {/* Tipo de evento */}
      <View style={[styles.row, styles.bb]} wrap={false}>
        <View style={[styles.cellLeft, w(COL.label, TOTAL), styles.blueCell]}>
          <Text style={styles.leftLabel}>TIPO DE EVENTO:</Text>
        </View>

        <View style={[styles.cellCenter, styles.bl, w(COL.opt1, TOTAL), styles.lightCell]}>
          <Text style={styles.midText}>ENFERMEDAD</Text>
        </View>

        <View style={[styles.cellCenter, styles.bl, w(COL.chk1, TOTAL), styles.whiteCell]}>
          <Text style={styles.xText}>{mark(tipo, 'ENFERMEDAD')}</Text>
        </View>

        <View style={[styles.cellCenter, styles.bl, w(COL.sep, TOTAL), styles.whiteCell]} />

        <View style={[styles.cellCenter, styles.bl, w(COL.opt2, TOTAL), styles.lightCell]}>
          <Text style={styles.midText}>ACCIDENTE</Text>
        </View>

        <View style={[styles.cellCenter, styles.bl, w(COL.chk2, TOTAL), styles.whiteCell]}>
          <Text style={styles.xText}>{mark(tipo, 'ACCIDENTE')}</Text>
        </View>
      </View>

      {/* Origen */}
      <View style={styles.row} wrap={false}>
        <View style={[styles.cellLeft, w(COL.label, TOTAL), styles.blueCell]}>
          <Text style={styles.leftLabel}>ORIGEN:</Text>
        </View>

        <View style={[styles.cellCenter, styles.bl, w(COL.opt1, TOTAL), styles.lightCell]}>
          <Text style={styles.midText}>LABORAL</Text>
        </View>

        <View style={[styles.cellCenter, styles.bl, w(COL.chk1, TOTAL), styles.whiteCell]}>
          <Text style={styles.xText}>{mark(origen, 'LABORAL')}</Text>
        </View>

        <View style={[styles.cellCenter, styles.bl, w(COL.sep, TOTAL), styles.whiteCell]} />

        <View style={[styles.cellCenter, styles.bl, w(COL.opt2, TOTAL), styles.lightCell]}>
          <Text style={styles.midText}>COMUN</Text>
        </View>

        <View style={[styles.cellCenter, styles.bl, w(COL.chk2, TOTAL), styles.whiteCell]}>
          <Text style={styles.xText}>{mark(origen, 'COMUN')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    borderWidth: BW,
    borderColor: BC,
  },

  // líneas
  row: { flexDirection: 'row', width: '100%' },
  bb: { borderBottomWidth: BW, borderBottomColor: BC },
  bl: { borderLeftWidth: BW, borderLeftColor: BC },

  // colores
  blueCell: { backgroundColor: COLOR.blue },
  lightCell: { backgroundColor: COLOR.light },
  whiteCell: { backgroundColor: COLOR.white },

  // Sustentación
  sustWrap: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderBottomWidth: BW,
    borderBottomColor: BC,
    backgroundColor: COLOR.white,
  },
  sustText: {
    fontSize: 8,
    lineHeight: 1.15,
    textAlign: 'justify',
  },

  // Header calificaciones
  headerRow: {
    height: 16,
    backgroundColor: COLOR.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: { fontSize: 8, fontWeight: 700 },

  // celdas
  cellLeft: {
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  cellCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 3,
  },

  leftLabel: { fontSize: 7.5, fontWeight: 700 },
  valueText: { fontSize: 8, fontWeight: 700 },
  midText: { fontSize: 8, fontWeight: 700 },
  xText: { fontSize: 9, fontWeight: 700 },

  bold: { fontWeight: 700 },
});