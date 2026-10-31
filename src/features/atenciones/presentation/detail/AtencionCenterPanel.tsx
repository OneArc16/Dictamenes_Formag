'use client';

import type { ReactNode } from 'react';

import { ATENCION_TABS as TABS, type AtencionTabId } from './atencion-tabs';

export function AtencionCenterPanel({
  activeTab,
  onTabChange,
  panels,
  pendientes,
}: {
  activeTab: AtencionTabId;
  onTabChange: (tab: AtencionTabId) => void;
  panels: Record<AtencionTabId, ReactNode>;
  /** Obligatorios sin diligenciar por pestaña; se muestran como contador. */
  pendientes: Partial<Record<AtencionTabId, number>>;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Las pestañas pasan a otra línea si no caben, en lugar de desplazarse horizontalmente. */}
      <div className="border-b border-slate-200 bg-slate-50 p-2">
        <div role="tablist" aria-label="Secciones de la atención" className="flex flex-wrap gap-1">
          {TABS.map((tab, index) => {
            const active = activeTab === tab.id;
            const pending = pendientes[tab.id] ?? 0;
            return (
              <button
                key={tab.id}
                id={`atencion-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`atencion-panel-${tab.id}`}
                title={tab.label}
                tabIndex={active ? 0 : -1}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(event) => {
                  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                  event.preventDefault();
                  const nextIndex =
                    event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? TABS.length - 1
                        : event.key === 'ArrowRight'
                          ? (index + 1) % TABS.length
                          : (index - 1 + TABS.length) % TABS.length;
                  const next = TABS[nextIndex];
                  onTabChange(next.id);
                  window.requestAnimationFrame(() => document.getElementById(`atencion-tab-${next.id}`)?.focus());
                }}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
                  active
                    ? 'bg-white text-sky-900 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                }`}
              >
                <span className="hidden min-[1800px]:inline">{tab.label}</span>
                <span className="min-[1800px]:hidden">{tab.short}</span>
                {pending > 0 ? (
                  <span
                    className="inline-flex min-w-4 justify-center rounded-full bg-amber-100 px-1 text-[10px] font-bold leading-4 text-amber-800"
                    aria-label={`${pending} ${pending === 1 ? 'pendiente' : 'pendientes'}`}
                    title="Campos obligatorios pendientes"
                  >
                    {pending}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id={`atencion-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`atencion-tab-${activeTab}`}
        className="p-4 sm:p-6"
      >
        {panels[activeTab]}
      </div>
    </section>
  );
}
