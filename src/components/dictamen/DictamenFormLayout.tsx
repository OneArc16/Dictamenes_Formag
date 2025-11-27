'use client';

import React from 'react';

type DictamenFormLayoutProps = {
  left: React.ReactNode;
  center: React.ReactNode;
  right?: React.ReactNode;
};

export function DictamenFormLayout({
  left,
  center,
  right,
}: DictamenFormLayoutProps) {
  return (
    <section className="mt-4">
      {/*
        Escritorio (lg):

        - Izquierda: 320px fijos
        - Centro:    2.4fr  🔥 (todavía más ancho)
        - Derecha:   210px aprox (más estrecho)

        En móvil sigue apilado.
      */}
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,2.4fr)_210px]">
        {/* Panel izquierdo */}
        <div className="space-y-4">{left}</div>

        {/* Panel central (formulario) */}
        <div>{center}</div>

        {/* Panel derecho */}
        {right && (
          <div className="hidden lg:block">
            {right}
          </div>
        )}
      </div>
    </section>
  );
}
