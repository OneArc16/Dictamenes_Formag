import React from 'react';
import { View } from '@react-pdf/renderer';

type ViewStyleProp = React.ComponentProps<typeof View>['style'];

type PaginationBlockProps = {
  children: React.ReactNode;
  style?: ViewStyleProp;
  minPresenceAhead?: number;
  startOnNewPage?: boolean;
};

export function HeaderWithFirstRow({
  children,
  style,
  minPresenceAhead = 18,
  startOnNewPage = false,
}: PaginationBlockProps) {
  // `break` in React-PDF offsets fixed elements on the following page. Asking
  // for nearly a full printable area instead moves the non-fragmentable
  // segment through the normal wrapping path, where fixed headers repeat.
  const requiredPresence = startOnNewPage ? 630 : minPresenceAhead;

  return (
    <View
      wrap={false}
      minPresenceAhead={requiredPresence}
      style={style}
    >
      {children}
    </View>
  );
}

/**
 * React-PDF has no HTML `thead`; each non-fragmentable table segment owns its
 * reusable header. Conservative chunks make it repeat on continuation pages.
 */
export function splitIntoPageChunks<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks.length ? chunks : [[]];
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
