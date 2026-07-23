import React from 'react';
import { View } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import { theme } from '../styles/theme';

type Props = {
  children: React.ReactNode;
  style?: Style | Style[];
  bordered?: boolean;
};

export function Box({ children, style, bordered = true }: Props) {
  const styles: Style[] = [
    ...(bordered ? [{ borderWidth: theme.border, borderColor: '#000' }] : []),
    ...(Array.isArray(style) ? style : style ? [style] : []),
  ];

  return (
    <View style={styles}>
      {children}
    </View>
  );
}
