'use client';

import { CalendarRange, ChevronDown, FileBadge2, LoaderCircle, Repeat2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { dateInTimeZone } from '@/features/agenda/domain/date-time';
import { inputClassName } from '@/features/formulario-origen/presentation/FormField';
import {
  CATEGORIAS_INCAPACIDAD,
  INCAPACIDAD_DIAS_MAX,
  INCAPACIDAD_OBSERVACIONES_MAX,
  categoriaLabel,
  fechaFinIncapacidad,
  incapacidadesSeCruzan,
  type CategoriaIncapacidad,
  type CreateIncapacidadCommand,
  type Incapacidad,
} from '@/features/atenciones/domain/incapacidades';

import { formatAtencionFecha, formatAtencionHora } from '../../AtencionesTable';

type DiagnosticoOpcion = { codigo: string; label: string };

const labelClass = 'text-[11px] font-semibold text-slate-700';

/** AAAA-MM-DD → DD/MM/AAAA sin pasar por zona horaria. */
function formatFecha(fecha: string) {
  const [anio, mes, dia] = fecha.split('-');
  return `${dia}/${mes}/${anio}`;
}

function formatFechaLarga(fecha: string) {
  return new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${fecha}T00:00:00.000Z`),
  );
}

function hoy() {
  return dateInTimeZone(new Date(), 'America/Bogota');
}

function emptyForm() {
  return {
    categoria: '' as CategoriaIncapacidad | '',
    prorroga: false,
    fechaInicio: hoy(),
    dias: '',
    observaciones: '',
  };
}

function IncapacidadCard({
  incapacidad,
  onQuitar,
  quitando,
}: {
  incapacidad: Incapacidad;
  onQuitar?: () => void;
  quitando: boolean;
}) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
              N° {incapacidad.numeroInterno}
            </span>
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
              {categoriaLabel(incapacidad.categoria)}
            </span>
            {incapacidad.prorroga ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                <Repeat2 className="h-3 w-3" aria-hidden="true" />
                Prórroga
              </span>
            ) : null}
          </div>
          <p className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-900">
            <CalendarRange className="h-4 w-4 text-slate-500" aria-hidden="true" />
            {formatFecha(incapacidad.fechaInicio)} al {formatFecha(incapacidad.fechaFin)}
            <span className="font-normal text-slate-600">
              · {incapacidad.dias} {incapacidad.dias === 1 ? 'día' : 'días'}
            </span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {incapacidad.diagnosticos.map((dx, index) => (
              <span
                key={dx.codigo}
                className={`rounded-full px-2 py-0.5 text-[11px] ${index === 0 ? 'bg-sky-50 font-semibold text-sky-800' : 'bg-slate-100 text-slate-600'}`}
              >
                {dx.codigo} · {dx.nombre}
              </span>
            ))}
          </div>
          {incapacidad.observaciones ? (
            <p className="whitespace-pre-line text-xs text-slate-600">{incapacidad.observaciones}</p>
          ) : null}
          <p className="text-[11px] text-slate-500">
            Expedida el {formatAtencionFecha(incapacidad.fecha)} · {formatAtencionHora(incapacidad.fecha)}
            {incapacidad.medicoNombre ? ` · ${incapacidad.medicoNombre}` : ''}
          </p>
        </div>
        {onQuitar ? (
          <button
            type="button"
            onClick={onQuitar}
            disabled={quitando}
            aria-label={`Quitar incapacidad ${incapacidad.numeroInterno}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-300 px-2.5 py-1 text-[11px] text-slate-500 transition hover:border-rose-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            Quitar
          </button>
        ) : null}
      </div>
    </li>
  );
}

export function IncapacidadesTab({
  incapacidades,
  historial,
  diasAcumulados,
  diagnosticos,
  readOnly,
  agregando,
  quitandoId,
  onAgregar,
  onQuitar,
  onIrADiagnosticos,
}: {
  incapacidades: Incapacidad[];
  historial: Incapacidad[];
  diasAcumulados: number;
  /** Diagnósticos de la atención; el primero es el principal. */
  diagnosticos: DiagnosticoOpcion[];
  readOnly: boolean;
  agregando: boolean;
  quitandoId: number | null;
  onAgregar: (input: CreateIncapacidadCommand) => Promise<unknown>;
  onQuitar: (incapacidadId: number) => void;
  onIrADiagnosticos: () => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  // Incapacidades conocidas del docente: la nueva no se puede cruzar con ellas.
  const delDocente = useMemo(
    () => [...incapacidades, ...historial].sort((a, b) => b.fechaFin.localeCompare(a.fechaFin)),
    [incapacidades, historial],
  );

  const dias = Number(form.dias);
  const diasValidos = Number.isInteger(dias) && dias >= 1 && dias <= INCAPACIDAD_DIAS_MAX;
  const fechaFin = diasValidos && form.fechaInicio ? fechaFinIncapacidad(form.fechaInicio, dias) : null;
  const cruce =
    fechaFin && form.fechaInicio
      ? delDocente.find((item) => incapacidadesSeCruzan(item, { fechaInicio: form.fechaInicio, fechaFin }))
      : undefined;

  const puedeExpedir =
    Boolean(form.categoria) &&
    diagnosticos.length > 0 &&
    Boolean(fechaFin) &&
    !cruce &&
    !agregando;

  const expedir = async () => {
    if (!puedeExpedir || !form.categoria) return;
    try {
      await onAgregar({
        categoria: form.categoria,
        prorroga: form.prorroga,
        fechaInicio: form.fechaInicio,
        dias,
        observaciones: form.observaciones.trim() || undefined,
      });
      setForm(emptyForm());
    } catch {
      // El aviso de error ya se mostró; se conserva lo escrito para corregirlo.
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <FileBadge2 className="h-4 w-4 text-sky-700" aria-hidden="true" />
        Días de incapacidad acumulados del docente:
        <span className="rounded-full bg-sky-50 px-2 py-0.5 font-semibold text-sky-800">{diasAcumulados}</span>
      </div>

      {!readOnly ? (
        <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-3" aria-labelledby="incapacidad-nueva">
          <h3 id="incapacidad-nueva" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Nueva incapacidad
          </h3>
          {diagnosticos.length === 0 ? (
            <p className="mt-2 text-xs text-amber-800">
              Para expedir una incapacidad, registra primero los diagnósticos de la atención.{' '}
              <button type="button" onClick={onIrADiagnosticos} className="font-semibold underline">
                Ir a Diagnósticos
              </button>
            </p>
          ) : null}

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div>
              <label htmlFor="incapacidad-categoria" className={labelClass}>
                Categoría <span className="text-rose-700">*</span>
              </label>
              <select
                id="incapacidad-categoria"
                value={form.categoria}
                onChange={(event) => set('categoria', event.target.value as CategoriaIncapacidad | '')}
                className={`${inputClassName} mt-1`}
              >
                <option value="">Selecciona</option>
                {CATEGORIAS_INCAPACIDAD.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <fieldset>
              <legend className={labelClass}>
                Prórroga <span className="text-rose-700">*</span>
              </legend>
              <div className="mt-1 grid grid-cols-2 rounded-lg border border-slate-300 bg-white p-0.5">
                {[
                  { value: false, label: 'No' },
                  { value: true, label: 'Sí' },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    aria-pressed={form.prorroga === option.value}
                    onClick={() => set('prorroga', option.value)}
                    className={`min-h-9 rounded-md text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      form.prorroga === option.value ? 'bg-sky-700 text-white' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <span className={labelClass}>N° interno</span>
              <p className="mt-1 flex min-h-10 items-center rounded-lg border border-dashed border-slate-300 bg-white px-3 text-xs text-slate-500">
                Se asigna automáticamente al expedir
              </p>
            </div>

            <div>
              <label htmlFor="incapacidad-inicio" className={labelClass}>
                Fecha de inicio <span className="text-rose-700">*</span>
              </label>
              <input
                id="incapacidad-inicio"
                type="date"
                value={form.fechaInicio}
                onChange={(event) => set('fechaInicio', event.target.value)}
                className={`${inputClassName} mt-1`}
              />
            </div>

            <div>
              <label htmlFor="incapacidad-dias" className={labelClass}>
                Días <span className="text-rose-700">*</span>
              </label>
              <input
                id="incapacidad-dias"
                type="number"
                inputMode="numeric"
                min={1}
                max={INCAPACIDAD_DIAS_MAX}
                value={form.dias}
                onChange={(event) => set('dias', event.target.value)}
                className={`${inputClassName} mt-1`}
              />
            </div>

            <div>
              <span className={labelClass}>Fecha de fin</span>
              <p className="mt-1 flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900">
                {fechaFin ? formatFecha(fechaFin) : <span className="text-xs font-normal text-slate-400">Se calcula con los días</span>}
              </p>
            </div>

            <div className="md:col-span-3">
              <label htmlFor="incapacidad-observaciones" className={labelClass}>
                Observaciones
              </label>
              <textarea
                id="incapacidad-observaciones"
                value={form.observaciones}
                rows={2}
                maxLength={INCAPACIDAD_OBSERVACIONES_MAX}
                onChange={(event) => set('observaciones', event.target.value)}
                className={`${inputClassName} mt-1 resize-y`}
              />
            </div>
          </div>

          {cruce ? (
            <p role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
              Las fechas se cruzan con la incapacidad {cruce.numeroInterno} del docente.
            </p>
          ) : null}

          <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-600" aria-live="polite">
              {fechaFin && form.categoria ? (
                <>
                  <span className="font-semibold text-slate-900">
                    {categoriaLabel(form.categoria)}
                    {form.prorroga ? ' (prórroga)' : ''} · {dias} {dias === 1 ? 'día' : 'días'}
                  </span>{' '}
                  del {formatFechaLarga(form.fechaInicio)} al {formatFechaLarga(fechaFin)}
                </>
              ) : (
                'Completa categoría, fecha de inicio y días.'
              )}
            </p>
            <button
              type="button"
              onClick={() => void expedir()}
              disabled={!puedeExpedir}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-sky-800 px-4 text-sm font-semibold text-white transition hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {agregando ? (
                <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <FileBadge2 className="h-4 w-4" aria-hidden="true" />
              )}
              Expedir incapacidad
            </button>
          </div>
        </section>
      ) : null}

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Incapacidades de esta atención ({incapacidades.length})
        </h3>
        {incapacidades.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-500">
            No se han expedido incapacidades en esta atención.
          </p>
        ) : (
          <ul className="space-y-2">
            {incapacidades.map((incapacidad) => (
              <IncapacidadCard
                key={incapacidad.id}
                incapacidad={incapacidad}
                quitando={quitandoId === incapacidad.id}
                onQuitar={readOnly ? undefined : () => onQuitar(incapacidad.id)}
              />
            ))}
          </ul>
        )}
      </section>

      <details className="group rounded-xl border border-slate-200 bg-white">
        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 px-3 text-xs font-semibold text-slate-700 [&::-webkit-details-marker]:hidden">
          <span>
            Historial de incapacidades del docente <span className="font-normal text-slate-500">({historial.length})</span>
          </span>
          <ChevronDown className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="border-t border-slate-100 p-3">
          {historial.length === 0 ? (
            <p className="text-xs text-slate-500">El docente no tiene incapacidades en atenciones anteriores.</p>
          ) : (
            <ul className="space-y-2">
              {historial.map((incapacidad) => (
                <IncapacidadCard key={incapacidad.id} incapacidad={incapacidad} quitando={false} />
              ))}
            </ul>
          )}
        </div>
      </details>
    </div>
  );
}
