'use client';

import type { ReactNode } from 'react';

import { ATENCION_TABS as TABS, type AtencionTabId } from './atencion-tabs';

export function AtencionCenterPanel({
  activeTab,
  onTabChange,
  panels,
}: {
  activeTab: AtencionTabId;
  onTabChange: (tab: AtencionTabId) => void;
  panels: Record<AtencionTabId, ReactNode>;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto border-b border-slate-200 bg-slate-50">
        <div role="tablist" aria-label="Secciones de la atención" className="flex min-w-max px-2">
          {TABS.map((tab, index) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`atencion-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`atencion-panel-${tab.id}`}
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
                className={`flex min-h-12 items-center gap-2 border-b-2 px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-600 ${
                  active
                    ? 'border-sky-700 bg-white text-sky-900'
                    : 'border-transparent text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                {tab.label}
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
