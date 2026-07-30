'use client';

import {
  AlertTriangle,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { AgendaPreview, AgendaPreviewDoctor } from '@/features/agenda/domain/types';
import type { AgendaCreationProcess } from './agenda-creation-types';

type AgendaPreviewPanelProps = {
  process: AgendaCreationProcess;
  onRetry: () => void;
};

function scheduleOriginLabel(origin: AgendaPreviewDoctor['horarioOrigen']) {
  if (origin === 'SEDE') return 'Sede';
  if (origin === 'PARTICULAR') return 'Particular';
  if (origin === 'PERSONALIZADO') return 'Personalizado para esta agenda';
  return '';
}

function DoctorPreviewMobileCard({ doctor }: { doctor: AgendaPreviewDoctor }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3">
      <h4 className="font-medium text-slate-950">{doctor.medicoNombre}</h4>
      <p className="mt-1 text-xs leading-5 text-slate-600">
        {doctor.horarioLaboralNombre ?? 'Sin horario'}
        {doctor.horarioOrigen
          ? ` · ${scheduleOriginLabel(doctor.horarioOrigen)}`
          : ''}
        {` · ${doctor.duracionMinutos} min por consulta`}
      </p>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="text-xs text-slate-500">Laborales</dt>
          <dd className="mt-1 font-semibold tabular-nums text-slate-900">
            {doctor.fechasLaborales}
          </dd>
        </div>
        <div className="rounded-lg bg-emerald-50 p-2">
          <dt className="text-xs text-emerald-700">Nuevos</dt>
          <dd className="mt-1 font-semibold tabular-nums text-emerald-900">
            {doctor.totalNuevos}
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2">
          <dt className="text-xs text-slate-500">Omitidos</dt>
          <dd className="mt-1 font-semibold tabular-nums text-slate-900">
            {doctor.totalOmitidos}
          </dd>
        </div>
        <div className="rounded-lg bg-amber-50 p-2">
          <dt className="text-xs text-amber-700">Conflictos</dt>
          <dd className="mt-1 font-semibold tabular-nums text-amber-900">
            {doctor.totalConflictos}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function PreviewContent({
  preview,
  confirmationError,
}: {
  preview: AgendaPreview;
  confirmationError?: string;
}) {
  const durations = [
    ...new Set(preview.medicos.map((doctor) => doctor.duracionMinutos)),
  ];
  const metrics = [
    { label: 'Médicos', value: preview.totalMedicos, tone: 'slate' },
    { label: 'Candidatos', value: preview.totalCandidatos, tone: 'slate' },
    { label: 'Nuevos', value: preview.totalNuevos, tone: 'emerald' },
    { label: 'Omitidos', value: preview.totalOmitidos, tone: 'slate' },
    { label: 'Conflictos', value: preview.totalConflictos, tone: 'amber' },
  ] as const;

  return (
    <div className="space-y-4">
      {confirmationError ? (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <p className="font-semibold">No se pudo confirmar la agenda</p>
          <p className="mt-1 leading-5">{confirmationError} Puedes intentarlo nuevamente.</p>
        </div>
      ) : null}

      {preview.bloqueado ? (
        <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <div className="flex items-start gap-2 font-semibold">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Hay problemas que bloquean la confirmación
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-6 leading-5">
            {preview.errores.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : preview.totalNuevos === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          No hay cupos nuevos para confirmar con esta configuración.
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          La agenda está lista para confirmar.
        </div>
      )}

      <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={
              metric.tone === 'emerald'
                ? 'rounded-xl border border-emerald-200 bg-emerald-50 p-3'
                : metric.tone === 'amber'
                  ? 'rounded-xl border border-amber-200 bg-amber-50 p-3'
                  : 'rounded-xl border border-slate-200 bg-slate-50 p-3'
            }
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {metric.label}
            </dt>
            <dd className="mt-2 text-2xl font-semibold tabular-nums text-slate-950">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-3 md:hidden">
        {preview.medicos.map((doctor) => (
          <DoctorPreviewMobileCard key={doctor.medicoId} doctor={doctor} />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-slate-200 md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th scope="col" className="p-3">Médico</th>
              <th scope="col" className="p-3">Horario efectivo</th>
              <th scope="col" className="p-3 text-right">Duración</th>
              <th scope="col" className="p-3 text-right">Laborales</th>
              <th scope="col" className="p-3 text-right">Nuevos</th>
              <th scope="col" className="p-3 text-right">Omitidos</th>
              <th scope="col" className="p-3 text-right">Conflictos</th>
            </tr>
          </thead>
          <tbody>
            {preview.medicos.map((doctor) => (
              <tr key={doctor.medicoId} className="border-t border-slate-100">
                <th scope="row" className="p-3 font-medium text-slate-900">
                  {doctor.medicoNombre}
                </th>
                <td className="p-3 text-slate-600">
                  {doctor.horarioLaboralNombre ?? 'Sin horario'}
                  {doctor.horarioOrigen
                    ? ` (${scheduleOriginLabel(doctor.horarioOrigen).toLocaleLowerCase('es-CO')})`
                    : ''}
                </td>
                <td className="p-3 text-right tabular-nums">
                  {doctor.duracionMinutos} min
                </td>
                <td className="p-3 text-right tabular-nums">{doctor.fechasLaborales}</td>
                <td className="p-3 text-right tabular-nums">{doctor.totalNuevos}</td>
                <td className="p-3 text-right tabular-nums">{doctor.totalOmitidos}</td>
                <td className="p-3 text-right tabular-nums">{doctor.totalConflictos}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="rounded-xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">
        Se crearán <strong>{preview.totalNuevos} cupos</strong>{' '}
        {durations.length === 1
          ? `de ${durations[0]} minutos`
          : 'con la duración configurada para cada médico'}{' '}
        para {preview.totalMedicos}{' '}
        {preview.totalMedicos === 1 ? 'médico' : 'médicos'} en {preview.sedeNombre}.
      </p>
    </div>
  );
}

export function AgendaPreviewPanel({ process, onRetry }: AgendaPreviewPanelProps) {
  if (process.status === 'idle') return null;

  return (
    <section aria-labelledby="agenda-preview-title" className="space-y-4">
      <div>
        <h2 id="agenda-preview-title" className="text-lg font-semibold text-slate-950">
          Vista previa
        </h2>
        <p className="mt-1 text-sm leading-5 text-slate-600">
          El servidor volverá a validar horarios y conflictos al confirmar.
        </p>
      </div>

      {process.status === 'calculating' ? (
        <div
          aria-live="polite"
          aria-busy="true"
          className="flex min-h-28 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700"
        >
          <LoaderCircle
            className="h-5 w-5 animate-spin text-sky-700 motion-reduce:animate-none"
            aria-hidden="true"
          />
          Calculando disponibilidad y conflictos…
        </div>
      ) : null}

      {process.status === 'error' ? (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
          <p className="font-semibold">No se pudo calcular la agenda</p>
          <p className="mt-1 leading-5">{process.message}</p>
          <Button type="button" variant="outline" className="mt-4 min-h-11" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      ) : null}

      {process.status === 'stale' ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950">
          <div className="flex items-start gap-2 font-semibold">
            <RefreshCw className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            La configuración cambió
          </div>
          <p className="mt-1 leading-5">
            Calcula nuevamente la agenda para actualizar cupos y conflictos.
          </p>
          <p className="mt-2 text-xs text-sky-800">
            El cálculo anterior estimaba {process.preview.totalNuevos} cupos nuevos.
          </p>
        </div>
      ) : null}

      {process.status === 'ready' ? (
        <PreviewContent
          preview={process.preview}
          confirmationError={process.confirmationError}
        />
      ) : null}

      {process.status === 'confirming' ? (
        <>
          <div
            aria-live="polite"
            aria-busy="true"
            className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm font-medium text-sky-900"
          >
            <LoaderCircle
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
            Confirmando la generación de forma segura…
          </div>
          <PreviewContent preview={process.preview} />
        </>
      ) : null}
    </section>
  );
}
