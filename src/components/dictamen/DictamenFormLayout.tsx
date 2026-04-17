'use client';

import React from 'react';

type DictamenFormLayoutProps = {
  left: React.ReactNode;
  center: React.ReactNode;
  right?: React.ReactNode;
  /** Ajusta si tienes header fijo. Ej: "top-4" o "top-20" */
  stickyTopClassName?: string;
};

export function DictamenFormLayout({
  left,
  center,
  right,
  stickyTopClassName = 'top-4',
}: DictamenFormLayoutProps) {
  return (
    <section className="mt-4">
      {/*
        Escritorio (lg):

        - Izquierda: 320px fijos
        - Centro:    2.4fr
        - Derecha:   210px aprox

        En móvil sigue apilado.
      */}
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,2.4fr)_210px] items-start">
        {/* Panel izquierdo */}
        <aside className={`space-y-4 lg:sticky ${stickyTopClassName} self-start`}>
          {/* Si el panel es más alto que la pantalla, que tenga scroll propio */}
          <div className="max-h-[calc(100vh-1rem)] overflow-auto pr-1 space-y-5">
            {left}
          </div>
        </aside>

        {/* Panel central (formulario) */}
        <main className="min-w-0">{center}</main>

        {/* Panel derecho */}
        {right && (
          <aside className={`hidden lg:block lg:sticky ${stickyTopClassName} self-start`}>
            <div className="max-h-[calc(100vh-1rem)] overflow-auto pr-1 space-y-5">
              {right}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
