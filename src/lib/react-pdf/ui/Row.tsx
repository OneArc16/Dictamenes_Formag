import React from 'react';
import { View, type Style } from '@react-pdf/renderer';

export function Row({ children, style }: { children: React.ReactNode; style?: Style | Style[] }) {
  return <View style={[{ flexDirection: 'row' }, style]}>{children}</View>;
}