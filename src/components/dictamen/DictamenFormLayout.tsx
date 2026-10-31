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
        - Móvil / tablet (< lg): todo apilado (datos, formulario, totales).
        - Laptop (lg a 2xl): 2 columnas. Datos y totales a la izquierda, formulario a la derecha.
          Los totales quedan fijos (sticky) debajo de los datos.
        - Escritorio grande (2xl+): 3 columnas, datos | formulario | totales.
      */}
      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] 2xl:grid-cols-[320px_minmax(0,1fr)_240px] 2xl:grid-rows-1">
        {/* Panel izquierdo */}
        <aside className={`min-w-0 self-start lg:col-start-1 lg:row-start-1 2xl:sticky ${stickyTopClassName}`}>
          {/* Si el panel es más alto que la pantalla, que tenga scroll propio */}
          <div className="space-y-5 2xl:max-h-[calc(100vh-1rem)] 2xl:overflow-auto 2xl:pr-1">
            {left}
          </div>
        </aside>

        {/* Panel central (formulario) */}
        <main className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 2xl:row-span-1">{center}</main>

        {/* Panel derecho */}
        {right && (
          <aside
            className={`min-w-0 self-start lg:sticky lg:col-start-1 lg:row-start-2 2xl:col-start-3 2xl:row-start-1 ${stickyTopClassName}`}
          >
            <div className="space-y-5 lg:max-h-[calc(100vh-1rem)] lg:overflow-auto lg:pr-1">
              {right}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
