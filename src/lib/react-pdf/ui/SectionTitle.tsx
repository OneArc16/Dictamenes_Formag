import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { theme } from '../styles/theme';

export function SectionTitle({ title }: { title: string }) {
  return (
    <View
      style={{
        borderWidth: theme.border,
        borderColor: '#000',
        paddingHorizontal: theme.padX,
        paddingVertical: theme.padY,
      }}
    >
      <Text style={{ fontWeight: 700 }}>{title}</Text>
    </View>
  );
}