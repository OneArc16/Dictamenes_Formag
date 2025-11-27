'use client';

import React from 'react';

type DictamenFormLayoutProps = {
  left: React.ReactNode;
  center: React.ReactNode;
  right?: React.ReactNode;
};

export function DictamenFormLayout({ left, center, right }: DictamenFormLayoutProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)_minmax(260px,280px)]">
      <aside className="space-y-4">{left}</aside>
      <section className="space-y-3">{center}</section>
      <aside className="hidden lg:block">{right}</aside>
    </div>
  );
}
