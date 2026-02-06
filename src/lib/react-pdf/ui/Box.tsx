import React from 'react';
import { View, type Style } from '@react-pdf/renderer';
import { theme } from '../styles/theme';

type Props = {
  children: React.ReactNode;
  style?: Style | Style[];
  bordered?: boolean;
};

export function Box({ children, style, bordered = true }: Props) {
  return (
    <View
      style={[
        bordered && { borderWidth: theme.border, borderColor: '#000' },
        style,
      ]}
    >
      {children}
    </View>
  );
}