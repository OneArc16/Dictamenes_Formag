import React from 'react';
import { View } from '@react-pdf/renderer';

type ViewStyleProp = React.ComponentProps<typeof View>['style'];

type Props = {
  children: React.ReactNode;
  style?: ViewStyleProp;
  minPresenceAhead?: number;
  break?: boolean;
};

export function KeepTogether({
  children,
  style,
  minPresenceAhead,
  break: shouldBreak,
}: Props) {
  return (
    <View wrap={false} minPresenceAhead={minPresenceAhead} break={shouldBreak} style={style}>
      {children}
    </View>
  );
}
