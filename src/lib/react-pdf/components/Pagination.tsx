import React from 'react';
import { View } from '@react-pdf/renderer';

type ViewStyleProp = React.ComponentProps<typeof View>['style'];

type PaginationBlockProps = {
  children: React.ReactNode;
  style?: ViewStyleProp;
  minPresenceAhead?: number;
};

export function HeaderWithFirstRow({
  children,
  style,
  minPresenceAhead = 18,
}: PaginationBlockProps) {
  return (
    <View wrap={false} minPresenceAhead={minPresenceAhead} style={style}>
      {children}
    </View>
  );
}

export function SafeRow({
  children,
  style,
  minPresenceAhead,
}: PaginationBlockProps) {
  return (
    <View wrap={false} minPresenceAhead={minPresenceAhead} style={style}>
      {children}
    </View>
  );
}

export function FlowTextBlock({
  children,
  style,
  minPresenceAhead = 8,
}: PaginationBlockProps) {
  return (
    <View wrap minPresenceAhead={minPresenceAhead} style={style}>
      {children}
    </View>
  );
}
