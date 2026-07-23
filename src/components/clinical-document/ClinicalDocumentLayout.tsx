import type { ReactNode } from 'react';

type Props = {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
};

export function ClinicalDocumentLayout({ left, center, right }: Props) {
  return (
    <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(260px,300px)_minmax(0,1fr)_minmax(240px,260px)] 2xl:grid-cols-[300px_minmax(0,1fr)_280px]">
      <aside className="space-y-4 xl:sticky xl:top-16" aria-label="Resumen del expediente">
        {left}
      </aside>
      <section className="min-w-0">{center}</section>
      <aside
        className="space-y-4 xl:sticky xl:top-16"
        aria-label="Progreso y acciones del documento"
      >
        {right}
      </aside>
    </div>
  );
}
