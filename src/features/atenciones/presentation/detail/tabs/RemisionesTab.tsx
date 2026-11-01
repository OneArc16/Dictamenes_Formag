'use client';

import { CheckCircle2, ChevronDown, LoaderCircle, Plus, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Cie10DiagnosticoSelect } from '@/components/forms/Cie10DiagnosticoSelect';
import { inputClassName } from '@/features/formulario-origen/presentation/FormField';
import {
  REMISION_MOTIVO_MAX,
  estadoAtajos,
  type CreateRemisionCommand,
  type Remision,
  type RemisionAtajo,
} from '@/features/atenciones/domain/remisiones';

import { formatAtencionFecha, formatAtencionHora } from '../../AtencionesTable';

type DiagnosticoOpcion = { codigo: string; label: string };

const EMPTY_FORM = { cupsCodigo: '', cupsLabel: '', motivo: '' };

function RemisionCard({
  remision,
  highlighted,
  onQuitar,
  quitando,
}: {
  remision: Remision;
  highlighted: boolean;
  onQuitar?: () => void;
  quitando: boolean;
}) {
  return (
    <li
      id={`remision-${remision.id}`}
      className={`rounded-lg border bg-white p-3 transition-colors ${highlighted ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-slate-200'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            <span className="mr-1.5 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">
              {remision.cups.codigo}
            </span>
            {remision.cups.nombre}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {remision.diagnosticos.map((dx, index) => (
              <span
                key={dx.codigo}
                className={`rounded-full px-2 py-0.5 text-[11px] ${index === 0 ? 'bg-sky-50 font-semibold text-sky-800' : 'bg-slate-100 text-slate-600'}`}
                title={index === 0 ? 'Diagnóstico de remisión' : `Relacionado ${index + 1}`}
              >
                {dx.codigo} · {dx.nombre}
              </span>
            ))}
          </div>
          {remision.motivo ? (
            <p className="mt-1.5 whitespace-pre-line text-xs text-slate-700">{remision.motivo}</p>
          ) : null}
          <p className="mt-1.5 text-[11px] text-slate-500">
            {formatAtencionFecha(remision.fecha)} · {formatAtencionHora(remision.fecha)}
            {remision.medicoNombre ? ` · ${remision.medicoNombre}` : ''}
          </p>
        </div>
        {onQuitar ? (
          <button
            type="button"
            onClick={onQuitar}
            disabled={quitando}
            aria-label={`Quitar remisión ${remision.cups.nombre}`}
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

export function RemisionesTab({
  remisiones,
  historial,
  atajos,
  diagnosticos,
  readOnly,
  agregando,
  quitandoId,
  onAgregar,
  onQuitar,
  onIrADiagnosticos,
}: {
  remisiones: Remision[];
  historial: Remision[];
  atajos: RemisionAtajo[];
  /** Diagnósticos de la atención; el primero es el principal. */
  diagnosticos: DiagnosticoOpcion[];
  readOnly: boolean;
  agregando: boolean;
  quitandoId: number | null;
  onAgregar: (input: CreateRemisionCommand) => Promise<unknown>;
  onQuitar: (remisionId: number) => void;
  onIrADiagnosticos: () => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const principal = diagnosticos[0]?.codigo ?? '';
  // La remisión lleva los diagnósticos de la atención: el principal y, si hay, el 2.º y el 3.º como relacionados.
  const diagnosticosRemision = {
    diagnosticoCodigo: principal,
    relacionado2Codigo: diagnosticos[1]?.codigo ?? null,
    relacionado3Codigo: diagnosticos[2]?.codigo ?? null,
  };
  const atajosEstado = estadoAtajos(atajos, remisiones);
  const yaRemitido = remisiones.some((remision) => remision.cups.codigo === form.cupsCodigo);

  const resaltar = (cupsCodigo: string) => {
    const remision = remisiones.find((item) => item.cups.codigo === cupsCodigo);
    if (!remision) return;
    setHighlightId(remision.id);
    document.getElementById(`remision-${remision.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => setHighlightId(null), 1800);
  };

  const usarAtajo = (atajo: (typeof atajosEstado)[number]) => {
    if (atajo.cargado) return resaltar(atajo.cupsCodigo);
    if (!principal) {
      toast.error('Registra primero el diagnóstico principal en la pestaña Diagnósticos.');
      return;
    }
    void onAgregar({ cupsCodigo: atajo.cupsCodigo, ...diagnosticosRemision });
  };

  const agregar = async () => {
    try {
      await onAgregar({
        cupsCodigo: form.cupsCodigo,
        ...diagnosticosRemision,
        motivo: form.motivo.trim() || undefined,
      });
      setForm(EMPTY_FORM);
    } catch {
      // El aviso de error ya se mostró; se conserva lo escrito para corregirlo.
    }
  };

  return (
    <div className="space-y-5">
      {!readOnly ? (
        <section className="flex flex-wrap items-center gap-x-2 gap-y-1.5" aria-label="Remisiones frecuentes">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Frecuentes</h3>
          {atajosEstado.length === 0 ? (
            <p className="text-xs text-slate-500">No hay atajos configurados.</p>
          ) : (
            atajosEstado.map((atajo) => (
              <button
                key={atajo.cupsCodigo}
                type="button"
                onClick={() => usarAtajo(atajo)}
                disabled={agregando}
                title={`${atajo.cupsCodigo} - ${atajo.cupsNombre}${atajo.cargado ? ' (ya cargada en esta atención)' : ' (clic para agregar)'}`}
                aria-label={`${atajo.etiqueta}: ${atajo.cargado ? 'cargada' : 'sin cargar, clic para agregar'}`}
                className={`inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-60 ${
                  atajo.cargado
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-100'
                    : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-sky-50 hover:text-sky-800 hover:ring-sky-300'
                }`}
              >
                {atajo.cargado ? (
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {atajo.etiqueta}
              </button>
            ))
          )}
        </section>
      ) : null}

      {!readOnly ? (
        <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Nueva remisión</h3>
          {diagnosticos.length === 0 ? (
            <p className="mt-2 text-xs text-amber-800">
              Para remitir, registra primero los diagnósticos de la atención.{' '}
              <button type="button" onClick={onIrADiagnosticos} className="font-semibold underline">
                Ir a Diagnósticos
              </button>
            </p>
          ) : (
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="remision-cups" className="text-[11px] font-semibold text-slate-700">
                  Servicio (CUPS) <span className="text-rose-700">*</span>
                </label>
                <div className="mt-1">
                  <Cie10DiagnosticoSelect
                    inputId="remision-cups"
                    endpoint="/api/cups/search"
                    catalogLabel="CUPS"
                    placeholder="Buscar por código o nombre CUPS…"
                    value={form.cupsCodigo}
                    initialLabel={form.cupsLabel || undefined}
                    onChange={(value, option) =>
                      setForm((current) => ({ ...current, cupsCodigo: value ?? '', cupsLabel: option?.label ?? '' }))
                    }
                  />
                </div>
                {yaRemitido ? (
                  <p className="mt-1 text-[11px] font-medium text-amber-800">
                    Este servicio ya está remitido en la atención.
                  </p>
                ) : null}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="remision-motivo" className="text-[11px] font-semibold text-slate-700">
                  Motivo de la remisión
                </label>
                <textarea
                  id="remision-motivo"
                  value={form.motivo}
                  rows={2}
                  maxLength={REMISION_MOTIVO_MAX}
                  onChange={(event) => setForm((current) => ({ ...current, motivo: event.target.value }))}
                  className={`${inputClassName} mt-1 resize-y`}
                />
              </div>
              <div className="flex justify-end md:col-span-2">
                <button
                  type="button"
                  onClick={() => void agregar()}
                  disabled={!form.cupsCodigo || !principal || yaRemitido || agregando}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-sky-800 px-4 text-sm font-semibold text-white transition hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {agregando ? (
                    <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden="true" />
                  )}
                  Agregar remisión
                </button>
              </div>
            </div>
          )}
        </section>
      ) : null}

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Remisiones de esta atención ({remisiones.length})
        </h3>
        {remisiones.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-500">
            No se han registrado remisiones en esta atención.
          </p>
        ) : (
          <ul className="space-y-2">
            {remisiones.map((remision) => (
              <RemisionCard
                key={remision.id}
                remision={remision}
                highlighted={highlightId === remision.id}
                quitando={quitandoId === remision.id}
                onQuitar={readOnly ? undefined : () => onQuitar(remision.id)}
              />
            ))}
          </ul>
        )}
      </section>

      <details className="group rounded-xl border border-slate-200 bg-white">
        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 px-3 text-xs font-semibold text-slate-700 [&::-webkit-details-marker]:hidden">
          <span>
            Historial de remisiones del docente <span className="font-normal text-slate-500">({historial.length})</span>
          </span>
          <ChevronDown
            className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-slate-100 p-3">
          {historial.length === 0 ? (
            <p className="text-xs text-slate-500">El docente no tiene remisiones en atenciones anteriores.</p>
          ) : (
            <ul className="space-y-2">
              {historial.map((remision) => (
                <RemisionCard key={remision.id} remision={remision} highlighted={false} quitando={false} />
              ))}
            </ul>
          )}
        </div>
      </details>
    </div>
  );
}
