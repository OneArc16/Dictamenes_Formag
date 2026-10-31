'use client';

import { useMutation } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, History, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';

import type { AtencionDetalle } from '@/features/atenciones/application/atencion-detail';

import { formatAtencionFecha, formatAtencionHora } from '../AtencionesTable';
import AttendDialog from '../AttendDialog';
import { AtencionEstadoBadge } from './AtencionEstadoBadge';
import type { AtencionTabId, Pendiente } from './atencion-tabs';
import type { SaveStatus } from './useAutosave';

const SAVE_LABEL: Record<SaveStatus, string> = {
  idle: 'Los cambios se guardan automáticamente.',
  saving: 'Guardando…',
  saved: 'Cambios guardados.',
  error: 'No se pudo guardar.',
};

export function AtencionRightPanel({
  detalle,
  pendientes,
  saveStatus,
  saveError,
  onGoToTab,
  onFlush,
  onFinalized,
}: {
  detalle: AtencionDetalle;
  pendientes: Pendiente[];
  saveStatus: SaveStatus;
  saveError: string | null;
  onGoToTab: (tab: AtencionTabId) => void;
  onFlush: () => Promise<boolean>;
  onFinalized: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const editable = detalle.estado === 'ACTIVADA' && detalle.canAttend;

  const finalize = useMutation({
    mutationFn: async () => {
      // Lo último que se escribió debe quedar guardado antes de cerrar la atención.
      if (!(await onFlush())) throw new Error(saveError ?? 'No se pudieron guardar los últimos cambios.');
      const response = await fetch(`/api/atenciones/${detalle.id}/atender`, { method: 'POST', credentials: 'include' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.ok) {
        throw new Error(data?.message ?? 'No fue posible finalizar la atención.');
      }
    },
    onSuccess: () => {
      toast.success('Atención finalizada.');
      setConfirming(false);
      onFinalized();
    },
  });

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-950">Atención</h2>
          <AtencionEstadoBadge estado={detalle.estado} />
        </div>
        {detalle.activadaAt ? (
          <p className="mt-2 text-xs leading-5 text-slate-600">
            Activado por recepción el {formatAtencionFecha(detalle.activadaAt)} ·{' '}
            {formatAtencionHora(detalle.activadaAt)}
          </p>
        ) : null}

        {editable ? (
          <div className="mt-4 border-t border-slate-100 pt-4">
            {pendientes.length > 0 ? (
              <>
                <p className="flex items-center gap-2 text-xs font-semibold text-amber-800">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  Falta diligenciar
                </p>
                <ul className="mt-1">
                  {pendientes.map((item) => (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => {
                          onGoToTab(item.tab);
                          window.requestAnimationFrame(() => document.getElementById(item.inputId)?.focus());
                        }}
                        className="min-h-8 w-full rounded-lg px-2 text-left text-xs font-medium text-sky-800 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Lista para finalizar
              </p>
            )}
            <p
              role="status"
              className={`mt-2 text-[11px] leading-5 ${saveStatus === 'error' ? 'text-rose-700' : 'text-slate-500'}`}
            >
              {saveStatus === 'error' && saveError ? saveError : SAVE_LABEL[saveStatus]}
            </p>
          </div>
        ) : null}

        <div className="mt-4 border-t border-slate-100 pt-4">
          {detalle.estado === 'ATENDIDA' ? (
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Atención finalizada
            </p>
          ) : detalle.canAttend ? (
            <button
              type="button"
              disabled={pendientes.length > 0}
              onClick={() => {
                finalize.reset();
                setConfirming(true);
              }}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Stethoscope className="h-4 w-4" aria-hidden="true" />
              Finalizar atención
            </button>
          ) : (
            <p className="text-xs leading-5 text-slate-600">
              Tienes acceso de consulta. Solo el médico asignado puede diligenciar y finalizar esta atención.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
          <History className="h-4 w-4 text-slate-500" aria-hidden="true" />
          Atenciones anteriores
        </h2>
        {detalle.anteriores.length === 0 ? (
          <p className="mt-2 text-xs leading-5 text-slate-500">Es la primera atención registrada de este docente.</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-100">
            {detalle.anteriores.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/atenciones/${item.id}`}
                  className="-mx-2 block rounded-lg px-2 py-2 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                >
                  <span className="block text-xs font-semibold text-slate-800">
                    {formatAtencionFecha(item.inicioProgramado)} · {item.especialidadNombre}
                  </span>
                  <span className="block truncate text-[11px] text-slate-500">{item.medicoNombre}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AttendDialog
        row={
          confirming
            ? {
                docenteNombre: detalle.docente.nombreCompleto,
                docenteDocumento: detalle.docente.documento,
                inicioProgramado: detalle.inicioProgramado,
                especialidadNombre: detalle.especialidadNombre,
              }
            : null
        }
        title="¿Finalizar la atención?"
        confirmLabel="Finalizar atención"
        isPending={finalize.isPending}
        errorMessage={finalize.isError ? finalize.error.message : undefined}
        onConfirm={() => finalize.mutate()}
        onOpenChange={(open) => {
          if (!open && !finalize.isPending) setConfirming(false);
        }}
      />
    </>
  );
}
