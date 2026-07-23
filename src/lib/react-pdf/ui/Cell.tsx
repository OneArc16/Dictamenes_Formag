import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import { theme } from '../styles/theme';

type Props = {
  label?: string;
  value?: string | number | null;
  width?: number | string;
  style?: Style | Style[];
  labelStyle?: Style | Style[];
  valueStyle?: Style | Style[];
  bordered?: boolean;
};

export function Cell({
  label,
  value,
  width,
  style,
  labelStyle,
  valueStyle,
  bordered = true,
}: Props) {
  const cellStyles: Style[] = [
    width != null ? { width } : { flex: 1 },
    ...(bordered ? [{ borderWidth: theme.border, borderColor: '#000' }] : []),
    { paddingHorizontal: theme.padX, paddingVertical: theme.padY },
    ...(Array.isArray(style) ? style : style ? [style] : []),
  ];
  const labelStyles: Style[] = [
    { fontWeight: 700 },
    ...(Array.isArray(labelStyle) ? labelStyle : labelStyle ? [labelStyle] : []),
  ];

  return (
    <View style={cellStyles}>
      {label ? <Text style={labelStyles}>{label}</Text> : null}
      <Text style={valueStyle}>{value ?? ' '}</Text>
    </View>
  );
}
