import { AlertCircle, CheckCircle2, Eye, FileCheck2, Save } from 'lucide-react';

import type { FormularioOrigenDto, OriginTab } from './types';

const LABELS: Record<OriginTab, string> = {
  descripcion: 'Descripción',
  'historial-laboral': 'Historial laboral',
  'informacion-fundamentos': 'Información y Fundamentos',
  'diagnostico-tratamiento': 'Diagnósticos',
  sustentacion: 'Sustentación',
};

export function FormularioOrigenRightPanel({
  formulario,
  saving,
  finalizing,
  onGoToTab,
  onSaveDraft,
  onFinalize,
  onOpenPcl,
  onOpenPdf,
}: {
  formulario: FormularioOrigenDto;
  saving: boolean;
  finalizing: boolean;
  onGoToTab: (tab: OriginTab) => void;
  onSaveDraft: () => void;
  onFinalize: () => void;
  onOpenPcl: () => void;
  onOpenPdf: () => void;
}) {
  const { completed, total, incomplete } = formulario.validation.progress;
  const percentage = Math.round((completed / total) * 100);

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-950">Progreso</h2>
          <span className="text-sm font-semibold tabular-nums text-sky-800">
            {completed} de {total}
          </span>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-label="Progreso del formulario"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
        >
          <div
            className="h-full rounded-full bg-sky-700 transition-transform motion-reduce:transition-none"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-600">
          Versión de trabajo {formulario.versionActual} · Formato {formulario.formatoVersion}
        </p>
        {incomplete.length > 0 ? (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="flex items-center gap-2 text-xs font-semibold text-amber-800">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              Secciones incompletas
            </p>
            <ul className="mt-2 space-y-1">
              {incomplete.map((tab) => (
                <li key={tab}>
                  <button
                    type="button"
                    onClick={() => onGoToTab(tab)}
                    className="min-h-11 w-full rounded-lg px-2 text-left text-xs font-medium text-sky-800 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                  >
                    {LABELS[tab]}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Listo para finalizar
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {formulario.estado === 'FINALIZADO' ? (
          <div className="space-y-3">
            <button
              type="button"
              onClick={onOpenPdf}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-sky-700 bg-white px-4 text-sm font-semibold text-sky-800 hover:bg-sky-50"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Determinacion de Origen
            </button>
            {formulario.canOpenPcl ? (
              <button
                type="button"
                onClick={onOpenPcl}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
              >
                <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                Diligenciar PCL
              </button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            {!formulario.readOnly ? (
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={saving || finalizing}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-sky-700 bg-white px-4 text-sm font-semibold text-sky-800 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                {saving ? 'Guardando…' : 'Guardar borrador'}
              </button>
            ) : null}
            {formulario.canFinalize ? (
              <button
                type="button"
                onClick={onFinalize}
                disabled={saving || finalizing}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-sky-800 px-4 text-sm font-semibold text-white hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                {finalizing ? 'Finalizando…' : 'Finalizar formulario'}
              </button>
            ) : null}
            {formulario.readOnly && !formulario.canFinalize ? (
              <p className="text-sm leading-5 text-slate-600">
                Tienes acceso de consulta. La edición y finalización requieren permisos adicionales.
              </p>
            ) : null}
          </div>
        )}
      </section>
    </>
  );
}
