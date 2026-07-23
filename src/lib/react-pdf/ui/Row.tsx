import React from 'react';
import { View } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';

export function Row({ children, style }: { children: React.ReactNode; style?: Style | Style[] }) {
  const styles: Style[] = [
    { flexDirection: 'row' },
    ...(Array.isArray(style) ? style : style ? [style] : []),
  ];
  return <View style={styles}>{children}</View>;
}
