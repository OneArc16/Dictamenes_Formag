import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { theme } from '../styles/theme';

export function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View
      style={{
        width: 10,
        height: 10,
        borderWidth: theme.border,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 9, lineHeight: 1 }}>{checked ? 'X' : ' '}</Text>
    </View>
  );
}