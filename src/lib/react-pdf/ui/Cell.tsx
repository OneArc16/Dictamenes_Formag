import React from 'react';
import { View, Text, type Style } from '@react-pdf/renderer';
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
  return (
    <View
      style={[
        width != null ? { width } : { flex: 1 },
        bordered && { borderWidth: theme.border, borderColor: '#000' },
        { paddingHorizontal: theme.padX, paddingVertical: theme.padY },
        style,
      ]}
    >
      {label ? <Text style={[{ fontWeight: 700 }, labelStyle]}>{label}</Text> : null}
      <Text style={valueStyle}>{value ?? ' '}</Text>
    </View>
  );
}