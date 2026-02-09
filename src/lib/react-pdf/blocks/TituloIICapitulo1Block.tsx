import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = {
  dictamen: any;
};

// Para usar minPresenceAhead sin pelear con typings
const V: any = View;

const COLOR = {
  bar: pdfTheme.colors.templateBlue, // azul oscuro cabecera
  left: '#D9E1F2', // azul claro (columna izquierda)
  head: '#D9E1F2', // header suave
  sumLeft: '#9DC3E6', // fila "SUMATORIA" izquierda
  white: '#FFFFFF',
};

// ✅ Bordes internos más notorios (sin afectar el resto del PDF)
const GRID = {
  w: 1.2, // antes 0.7
  color: pdfTheme.colors.border,
};

const COL = {
  act: 18,
  c1: 3,
  c2: 3,
  c3: 3,
} as const;

// Orden y labels como el formato
const ACTIVIDADES: { key: string; label: string }[] = [
  { key: 'MIRAR', label: 'MIRAR' },
  { key: 'ESCUCHAR', label: 'ESCUCHAR' },
  { key: 'PENSAR', label: 'PENSAR' },
  { key: 'LEER', label: 'LEER' },
  { key: 'ESCRIBIR', label: 'ESCRIBIR' },
  { key: 'COMUNICARSE_CON_MENSAJES_ESCRITOS', label: 'COMUNICARSE CON-RECEPCIÓN DE MENSAJES\nESCRITOS' },
  { key: 'HABLA', label: 'HABLA' },
  { key: 'PRODUCCION_MENSAJES_NO_VERBALES', label: 'PRODUCCIÓN DE MENSAJES NO VERBALES' },
  { key: 'MENSAJES_ESCRITOS', label: 'MENSAJES ESCRITOS' },
  { key: 'CONVERSACION', label: 'CONVERSACIÓN' },
  { key: 'MANTENER_CAMBIAR_POSICION_CUERPO', label: 'MANTENER Y CAMBIAR LA POSICIÓN DEL CUERPO Y\nPOSTURAS CORPORALES' },
  { key: 'USO_MANO_BRAZO', label: 'USO DE LA MANO Y BRAZO' },
  { key: 'DESPLAZARSE_ENTORNO', label: 'DESPLAZARSE EN EL ENTORNO' },
  { key: 'USO_TRANSPORTE_PASAJERO', label: 'UTILIZACIÓN DE TRANSPORTE COMO PASAJERO' },
  { key: 'CONDUCCION', label: 'CONDUCCIÓN' },
  { key: 'LAVARSE', label: 'LAVARSE' },
  { key: 'CUIDADO_PARTES_CUERPO', label: 'CUIDADO DE PARTES DEL CUERPO' },
  { key: 'VESTIRSE', label: 'VESTIRSE' },
  { key: 'COMER', label: 'COMER' },
  { key: 'BEBER', label: 'BEBER' },
  { key: 'ADQUIRIR_LO_NECESARIO_PARA_VIVIR', label: 'ADQUISICIÓN DE LO NECESARIO PARA VIVIR' },
  { key: 'ADQUIRIR_BIENES_SERVICIOS', label: 'ADQUISICIÓN DE BIENES Y SERVICIOS' },
  { key: 'PREPARAR_COMIDAS', label: 'PREPARAR COMIDAS' },
  { key: 'QUEHACERES_CASA', label: 'REALIZAR LOS QUEHACERES DE LA CASA' },
  { key: 'AYUDAR_A_LOS_DEMAS', label: 'AYUDAR A LOS DEMÁS' },
];

function toNum(v: any) {
  if (v == null || v === '') return null;
  const n = typeof v === 'string' ? Number(v.replace(',', '.')) : Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatCoef(n: number) {
  // 0.6 -> 0,6
  return n.toFixed(1).replace('.', ',');
}

function approxEqual(a: number, b: number) {
  return Math.abs(a - b) < 0.0001;
}

const styles = StyleSheet.create({
  barRow: {
    backgroundColor: COLOR.bar,
    alignItems: 'center',
    justifyContent: 'center',
    height: 16,

    // ✅ antes: borderWidth: pdfTheme.sizes.borderWidth (0.7)
    // ✅ ahora: mismo grosor que el grid para que "encaje" la línea
    borderWidth: GRID.w,
    borderColor: GRID.color,
  },
  barText: {
    fontSize: 8.0,
    fontWeight: 700,
    textTransform: 'uppercase',
    color: pdfTheme.colors.white,
  },

  gridRow: {
    flexDirection: 'row',
    borderLeftWidth: GRID.w,
    borderRightWidth: GRID.w,
    borderLeftColor: GRID.color,
    borderRightColor: GRID.color,
  },

  // ✅ fila con borde inferior más grueso
  rowLine: {
    borderBottomWidth: GRID.w,
    borderBottomColor: GRID.color,
  },

  // celdas base
  cell: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRightWidth: GRID.w,
    borderRightColor: GRID.color,
    justifyContent: 'center',
  },
  cellLast: {
    borderRightWidth: 0,
  },

  // headers
  headLeft: {
    backgroundColor: COLOR.head,
  },
  headRight: {
    backgroundColor: COLOR.head,
    alignItems: 'center',
  },
  headText: {
    fontSize: 7.6,
    fontWeight: 700,
    textAlign: 'center',
  },

  // columna izquierda (actividades)
  actCell: {
    backgroundColor: COLOR.left,
  },
  actText: {
    fontSize: 7.6,
    textTransform: 'uppercase',
    lineHeight: 1.15,
  },

  // celdas de X
  xCell: {
    backgroundColor: COLOR.white,
    alignItems: 'center',
  },
  xText: {
    fontSize: 8.2,
    fontWeight: 700,
  },

  // sumatoria
  sumLeft: {
    backgroundColor: COLOR.sumLeft,
    alignItems: 'center',
  },
  sumText: {
    fontSize: 7.6,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
});

export function TituloIICapitulo1Block({ dictamen }: Props) {
  // ✅ SIEMPRE mostrar como Procedimiento B
  const proc = 'B';

  // ✅ Coeficientes fijos del Procedimiento B
  const cols = [0.6, 0.3, 0.0];

  // dictamen.limitacionesAvdAivd: [{ actividad, valor }]
  const lims = Array.isArray(dictamen?.limitacionesAvdAivd) ? dictamen.limitacionesAvdAivd : [];
  const valueByAct = new Map<string, number>();
  for (const it of lims) {
    const key = String(it?.actividad ?? '');
    const v = toNum(it?.valor);
    if (key && v != null) valueByAct.set(key, v);
  }

  // ✅ sumatoria aritmética por columna
  const sumCols = [0, 0, 0];
  for (const a of ACTIVIDADES) {
    const v = valueByAct.get(a.key);
    const idx = v == null ? -1 : cols.findIndex((c) => approxEqual(v, c));
    if (idx >= 0) sumCols[idx] += cols[idx];
  }

  return (
    <View>
      <V minPresenceAhead={320}>
        {/* Barra superior */}
        <View style={styles.barRow} wrap={false}>
          <Text style={styles.barText}>TITULO II - CAPITULO 1</Text>
        </View>

        {/* Fila: (vacío izq) + PROCEDIMIENTO */}
        <View style={[styles.gridRow, styles.rowLine]} wrap={false}>
          <View style={[styles.cell, styles.headLeft, { flex: COL.act }]}>
            <Text style={styles.headText}>{' '}</Text>
          </View>

          <View style={[styles.cell, styles.cellLast, styles.headRight, { flex: COL.c1 + COL.c2 + COL.c3 }]}>
            <Text style={styles.headText}>PROCEDIMIENTO</Text>
          </View>
        </View>

        {/* Fila: CATEGORIAS + letra del procedimiento */}
        <View style={[styles.gridRow, styles.rowLine]} wrap={false}>
          <View style={[styles.cell, styles.headLeft, { flex: COL.act }]}>
            <Text style={[styles.headText, { textAlign: 'left' }]}>CATEGORIAS DE ACTIVIDADES</Text>
          </View>

          <View style={[styles.cell, styles.cellLast, { flex: COL.c1 + COL.c2 + COL.c3, alignItems: 'center' }]}>
            <Text style={styles.headText}>{proc}</Text>
          </View>
        </View>

        {/* Fila: (vacío izq) + 3 coeficientes */}
        <View style={[styles.gridRow, styles.rowLine]} wrap={false}>
          <View style={[styles.cell, styles.headLeft, { flex: COL.act }]}>
            <Text style={styles.headText}>{' '}</Text>
          </View>

          <View style={[styles.cell, styles.xCell, { flex: COL.c1 }]}>
            <Text style={styles.headText}>{formatCoef(cols[0])}</Text>
          </View>
          <View style={[styles.cell, styles.xCell, { flex: COL.c2 }]}>
            <Text style={styles.headText}>{formatCoef(cols[1])}</Text>
          </View>
          <View style={[styles.cell, styles.cellLast, styles.xCell, { flex: COL.c3 }]}>
            <Text style={styles.headText}>{formatCoef(cols[2])}</Text>
          </View>
        </View>

        {/* Filas actividades */}
        {ACTIVIDADES.map((a) => {
          const v = valueByAct.get(a.key);
          const idx = v == null ? -1 : cols.findIndex((c) => approxEqual(v, c));

          return (
            <View key={a.key} style={[styles.gridRow, styles.rowLine]} wrap={false}>
              <View style={[styles.cell, styles.actCell, { flex: COL.act }]}>
                <Text style={styles.actText}>{a.label}</Text>
              </View>

              <View style={[styles.cell, styles.xCell, { flex: COL.c1 }]}>
                <Text style={styles.xText}>{idx === 0 ? 'X' : ' '}</Text>
              </View>
              <View style={[styles.cell, styles.xCell, { flex: COL.c2 }]}>
                <Text style={styles.xText}>{idx === 1 ? 'X' : ' '}</Text>
              </View>
              <View style={[styles.cell, styles.cellLast, styles.xCell, { flex: COL.c3 }]}>
                <Text style={styles.xText}>{idx === 2 ? 'X' : ' '}</Text>
              </View>
            </View>
          );
        })}

        {/* ✅ Sumatoria */}
        <View
          style={[
            styles.gridRow,
            { borderBottomWidth: GRID.w, borderBottomColor: GRID.color },
          ]}
          wrap={false}
        >
          <View style={[styles.cell, styles.sumLeft, { flex: COL.act }]}>
            <Text style={styles.sumText}>SUMATORIA</Text>
          </View>

          <View style={[styles.cell, styles.xCell, { flex: COL.c1 }]}>
            <Text style={styles.xText}>{formatCoef(sumCols[0])}</Text>
          </View>
          <View style={[styles.cell, styles.xCell, { flex: COL.c2 }]}>
            <Text style={styles.xText}>{formatCoef(sumCols[1])}</Text>
          </View>
          <View style={[styles.cell, styles.cellLast, styles.xCell, { flex: COL.c3 }]}>
            <Text style={styles.xText}>{formatCoef(sumCols[2])}</Text>
          </View>
        </View>
      </V>
    </View>
  );
}