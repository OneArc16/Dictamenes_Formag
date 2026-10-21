import React from 'react';
import { Font, Text, View } from '@react-pdf/renderer';

type ViewStyleProp = React.ComponentProps<typeof View>['style'];
type TextStyleProp = React.ComponentProps<typeof Text>['style'];
type Align = 'left' | 'center' | 'right';
type VAlign = 'top' | 'center' | 'bottom';

/**
 * Kit de tablas que reproduce el estilo de la plantilla oficial
 * (public/templates/dictamen/formato-blanco.pdf).
 *
 * React-PDF no tiene `border-collapse` ni `thead`, y al partir un View entre
 * páginas elimina el borde inferior del primer fragmento y el superior del
 * segundo. Para que una tabla siempre quede cerrada:
 *  - cada fila (`Tr`) dibuja sus propios bordes superior, inferior y derecho,
 *    cada celda (`Td`) el izquierdo, y las filas se solapan `BW` (margin
 *    negativo) para emular `border-collapse: collapse`;
 *  - las filas son `wrap={false}` (nunca se parten);
 *  - los contenedores que se parten (`Tbl`) no llevan borde ni fondo propio.
 *
 * (Los `as never` en `style` son solo para el tipado de React-PDF, que no admite `null` en arreglos de estilos.)
 */

// El corte silábico por defecto de React-PDF es inglés y parte palabras en español
// ("GEN-ERAL", "UR-BANA"): la plantilla solo corta entre palabras.
Font.registerHyphenationCallback((word) => [word]);

export const TPL = {
  blue: '#9BC2E6',
  mid: '#A5C9EB',
  light: '#DDEBF7',
  pale: '#DAE9F7',
  soft: '#E0EDF8',
  salmon: '#FCE4D6',
  navy: '#1F4E78',
  white: '#FFFFFF',
  ink: '#000000',
} as const;

// Grosor de línea de la plantilla (0,5 pt).
export const BW = 0.5;

// Altura mínima de una fila de una línea.
export const ROW_H = 16;

const FS = 7.6;
const LINE = 1.15;

const JUSTIFY: Record<VAlign, 'flex-start' | 'center' | 'flex-end'> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
};

/**
 * Reparte el ancho de una fila en porcentajes exactos según el peso `w` de cada celda.
 * Con `flexGrow` el relleno y el borde de cada celda (y el número de celdas) desplazaban
 * los cortes verticales de una fila a otra; con porcentajes todas las filas coinciden.
 */
function withTotal(children: React.ReactNode) {
  const items = React.Children.toArray(children);
  const total = items.reduce<number>(
    (sum, child) =>
      React.isValidElement<{ w?: number }>(child) && typeof child.props.w === 'number' ? sum + child.props.w : sum,
    0,
  );
  return items.map((child) =>
    total > 0 && React.isValidElement<{ w?: number; total?: number }>(child) && typeof child.props.w === 'number'
      ? React.cloneElement(child, { total })
      : child,
  );
}

type TProps = {
  children?: React.ReactNode;
  b?: boolean;
  i?: boolean;
  u?: boolean;
  align?: Align;
  size?: number;
  color?: string;
  style?: TextStyleProp;
};

/** Texto de celda. */
export function T({ children, b, i, u, align = 'center', size = FS, color, style }: TProps) {
  return (
    <Text
      style={[
        {
          fontSize: size,
          fontWeight: b ? 700 : 400,
          fontStyle: i ? 'italic' : 'normal',
          textAlign: align,
          lineHeight: LINE,
        },
        u ? { textDecoration: 'underline' } : null,
        color ? { color } : null,
        style,
      ] as never}
    >
      {children}
    </Text>
  );
}

type TblProps = {
  children: React.ReactNode;
  /** Separación vertical respecto al bloque anterior (la plantilla deja un renglón entre algunas tablas). */
  gap?: number;
  /** Espacio mínimo que debe quedar bajo el bloque para no dejarlo solo al final de la hoja. */
  minPresence?: number;
  style?: ViewStyleProp;
};

/** Contenedor de filas: puede partirse entre páginas; no dibuja nada. */
export function Tbl({ children, gap = 0, minPresence, style }: TblProps) {
  return (
    <View minPresenceAhead={minPresence} style={[gap ? { marginTop: gap } : null, style] as never}>
      {children}
    </View>
  );
}

type TrProps = {
  children: React.ReactNode;
  /** Primera fila tras un hueco o al inicio de la hoja: no se solapa con la anterior. */
  first?: boolean;
  minH?: number;
  bg?: string;
  style?: ViewStyleProp;
};

/** Fila con bordes propios en los cuatro lados (el izquierdo lo pone la primera celda). */
export function Tr({ children, first, minH = ROW_H, bg, style }: TrProps) {
  return (
    <View
      wrap={false}
      style={[
        {
          flexDirection: 'row',
          borderTopWidth: BW,
          borderBottomWidth: BW,
          borderRightWidth: BW,
          borderColor: TPL.ink,
          marginTop: first ? 0 : -BW,
          minHeight: minH,
        },
        bg ? { backgroundColor: bg } : null,
        style,
      ] as never}
    >
      {withTotal(children)}
    </View>
  );
}

type TdProps = {
  children?: React.ReactNode;
  /** Peso relativo del ancho (se conservan las proporciones de la plantilla). */
  w?: number;
  /** Suma de pesos de la fila (la completa `Tr`/`Sub`); da el porcentaje exacto de ancho. */
  total?: number;
  bg?: string;
  valign?: VAlign;
  px?: number;
  py?: number;
  style?: ViewStyleProp;
};

/** Celda: ancho proporcional + borde izquierdo propio. */
export function Td({ children, w = 1, total, bg, valign = 'center', px = 4, py = 2, style }: TdProps) {
  return (
    <View
      style={[
        total ? { width: `${(w / total) * 100}%`, flexGrow: 0, flexShrink: 0 } : { flexGrow: w, flexShrink: 1, flexBasis: 0 },
        {
          borderLeftWidth: BW,
          borderColor: TPL.ink,
          justifyContent: JUSTIFY[valign],
          paddingHorizontal: px,
          paddingVertical: py,
        },
        bg ? { backgroundColor: bg } : null,
        style,
      ] as never}
    >
      {children}
    </View>
  );
}

/** Celda combinada en vertical (rowspan): apila filas `Sub`. */
export function Stack({
  children,
  w = 1,
  total,
  style,
}: {
  children: React.ReactNode;
  w?: number;
  total?: number;
  style?: ViewStyleProp;
}) {
  return (
    <View
      style={[
        total ? { width: `${(w / total) * 100}%`, flexGrow: 0, flexShrink: 0 } : { flexGrow: w, flexShrink: 1, flexBasis: 0 },
        { flexDirection: 'column' },
        style,
      ] as never}
    >
      {children}
    </View>
  );
}

/** Fila interna de un `Stack`. */
export function Sub({
  children,
  first,
  minH = ROW_H,
  bg,
}: {
  children: React.ReactNode;
  first?: boolean;
  minH?: number;
  bg?: string;
}) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flexGrow: 1,
          minHeight: minH,
          borderTopWidth: first ? 0 : BW,
          borderColor: TPL.ink,
        },
        bg ? { backgroundColor: bg } : null,
      ] as never}
    >
      {withTotal(children)}
    </View>
  );
}

/** Barra de sección (salmón / azul / marino) de ancho completo. */
export function Bar({
  children,
  bg,
  color,
  b = true,
  size = 8.4,
  first,
  minH = 18,
}: {
  children: React.ReactNode;
  bg: string;
  color?: string;
  b?: boolean;
  size?: number;
  first?: boolean;
  minH?: number;
}) {
  return (
    <Tr first={first} bg={bg} minH={minH} style={{ borderLeftWidth: BW }}>
      <View style={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 6, paddingVertical: 2 }}>
        <T b={b} size={size} color={color}>
          {children}
        </T>
      </View>
    </Tr>
  );
}

/** Texto girado 90° (columna CRITERIOS). `len` = largo disponible en vertical. */
export function RotText({ children, len, size = 7 }: { children: string; len: number; size?: number }) {
  const h = 26;
  return (
    <View
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: len,
        height: h,
        marginLeft: -len / 2,
        marginTop: -h / 2,
        justifyContent: 'center',
        transform: 'rotate(-90deg)',
        transformOrigin: 'center',
      }}
    >
      <T size={size}>{children}</T>
    </View>
  );
}

/**
 * Celda de texto corrido (puede ocupar varias páginas). Los bordes laterales y
 * el fondo van en cada fragmento de texto, y las tapas superior/inferior son
 * hijos `fixed`: React-PDF los repite en cada fragmento, de modo que la caja
 * queda cerrada al final de una página y reabierta al inicio de la siguiente.
 */
export function FlowCell({
  children,
  bg = TPL.white,
  first,
  size = FS,
  minPresence,
}: {
  children: React.ReactNode;
  bg?: string;
  first?: boolean;
  size?: number;
  minPresence?: number;
}) {
  const side = {
    borderLeftWidth: BW,
    borderRightWidth: BW,
    borderColor: TPL.ink,
    backgroundColor: bg,
  } as const;
  return (
    <View style={{ marginTop: first ? 0 : -BW }} minPresenceAhead={minPresence}>
      <View fixed style={{ height: BW, backgroundColor: TPL.ink }} />
      <View fixed style={[side, { height: 3 }] as never} />
      <Text
        style={[
          side,
          {
            fontSize: size,
            lineHeight: LINE,
            paddingHorizontal: 5,
          },
        ] as never}
      >
        {children}
      </Text>
      <View fixed style={[side, { height: 3 }] as never} />
      <View fixed style={{ height: BW, backgroundColor: TPL.ink }} />
    </View>
  );
}
