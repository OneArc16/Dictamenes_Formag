'use client';

import { ChevronLeft, ChevronRight, Loader2, Save } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';

import { ATENCION_TABS as TABS, siguientePestana, type AtencionTabId } from './atencion-tabs';

export function AtencionCenterPanel({
  activeTab,
  onTabChange,
  panels,
  pendientes,
  onSave,
}: {
  activeTab: AtencionTabId;
  onTabChange: (tab: AtencionTabId) => void;
  panels: Record<AtencionTabId, ReactNode>;
  /** Obligatorios sin diligenciar por pestaña; se muestran como contador. */
  pendientes: Partial<Record<AtencionTabId, number>>;
  /** Guarda lo pendiente; sin él (solo lectura) no se muestra el botón. */
  onSave?: () => Promise<boolean>;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ left: false, right: false });
  const [saving, setSaving] = useState(false);
  const nextTab = siguientePestana(activeTab);

  // Guarda y, si salió bien, pasa a la pestaña siguiente con la vista al inicio del panel.
  const saveAndContinue = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      if (!(await onSave())) {
        toast.error('No se pudieron guardar los cambios.');
        return;
      }
      toast.success('Cambios guardados.');
      if (nextTab) {
        onTabChange(nextTab);
        listRef.current?.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } finally {
      setSaving(false);
    }
  };

  const updateOverflow = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    setOverflow({
      left: list.scrollLeft > 1,
      right: list.scrollLeft + list.clientWidth < list.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(list);
    list.addEventListener('scroll', updateOverflow, { passive: true });
    return () => {
      observer.disconnect();
      list.removeEventListener('scroll', updateOverflow);
    };
  }, [updateOverflow]);

  // La pestaña activa siempre queda a la vista, también al cambiarla desde fuera.
  // Solo desplaza la barra (no la página).
  useEffect(() => {
    const list = listRef.current;
    const tab = document.getElementById(`atencion-tab-${activeTab}`);
    if (!list || !tab) return;
    const left = tab.offsetLeft - list.offsetLeft;
    const right = left + tab.offsetWidth;
    const margin = 48;
    if (left < list.scrollLeft + margin) list.scrollTo({ left: left - margin, behavior: 'smooth' });
    else if (right > list.scrollLeft + list.clientWidth - margin) {
      list.scrollTo({ left: right - list.clientWidth + margin, behavior: 'smooth' });
    }
  }, [activeTab]);

  const scrollBy = (direction: -1 | 1) => {
    const list = listRef.current;
    list?.scrollBy({ left: direction * list.clientWidth * 0.6, behavior: 'smooth' });
  };

  const arrowClass =
    'absolute top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600';

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Una sola fila con desplazamiento horizontal; las flechas y los degradados indican que hay más. */}
      <div className="relative border-b border-slate-200 bg-slate-50 p-2">
        {overflow.left ? (
          <>
            <div className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-12 bg-gradient-to-r from-slate-50 to-transparent" aria-hidden="true" />
            <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => scrollBy(-1)} className={`${arrowClass} left-1.5`}>
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        ) : null}
        {overflow.right ? (
          <>
            <div className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-12 bg-gradient-to-l from-slate-50 to-transparent" aria-hidden="true" />
            <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => scrollBy(1)} className={`${arrowClass} right-1.5`}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : null}
        <div
          ref={listRef}
          role="tablist"
          aria-label="Secciones de la atención"
          className="flex gap-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
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
                className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 ${
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

      {onSave ? (
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveAndContinue()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 text-sm font-semibold text-white transition hover:bg-sky-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            {saving ? 'Guardando…' : nextTab ? 'Guardar y continuar' : 'Guardar'}
          </button>
        </div>
      ) : null}
    </section>
  );
}
