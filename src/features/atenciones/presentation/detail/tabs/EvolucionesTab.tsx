'use client';

import { ChevronDown, LoaderCircle, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { inputClassName } from '@/features/formulario-origen/presentation/FormField';
import {
  EVOLUCION_TEXTO_MAX,
  type CreateEvolucionCommand,
  type Evolucion,
} from '@/features/atenciones/domain/evoluciones';

import { formatAtencionFecha, formatAtencionHora } from '../../AtencionesTable';

function EvolucionCard({
  evolucion,
  onQuitar,
  quitando,
}: {
  evolucion: Evolucion;
  onQuitar?: () => void;
  quitando: boolean;
}) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium text-slate-500">
          {formatAtencionFecha(evolucion.fecha)} · {formatAtencionHora(evolucion.fecha)}
          {evolucion.medicoNombre ? ` · ${evolucion.medicoNombre}` : ''}
        </p>
        {onQuitar ? (
          <button
            type="button"
            onClick={onQuitar}
            disabled={quitando}
            aria-label={`Quitar evolución del ${formatAtencionFecha(evolucion.fecha)} ${formatAtencionHora(evolucion.fecha)}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-300 px-2.5 py-1 text-[11px] text-slate-500 transition hover:border-rose-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            Quitar
          </button>
        ) : null}
      </div>
      <p className="mt-1.5 whitespace-pre-line text-sm text-slate-800">{evolucion.texto}</p>
    </li>
  );
}

export function EvolucionesTab({
  evoluciones,
  historial,
  readOnly,
  agregando,
  quitandoId,
  onAgregar,
  onQuitar,
}: {
  evoluciones: Evolucion[];
  historial: Evolucion[];
  readOnly: boolean;
  agregando: boolean;
  quitandoId: number | null;
  onAgregar: (input: CreateEvolucionCommand) => Promise<unknown>;
  onQuitar: (evolucionId: number) => void;
}) {
  const [texto, setTexto] = useState('');

  const guardar = async () => {
    try {
      await onAgregar({ texto: texto.trim() });
      setTexto('');
    } catch {
      // El aviso de error ya se mostró; se conserva lo escrito para corregirlo.
    }
  };

  return (
    <div className="space-y-5">
      {!readOnly ? (
        <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <label htmlFor="evolucion-texto" className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Nueva evolución
          </label>
          <textarea
            id="evolucion-texto"
            value={texto}
            rows={4}
            maxLength={EVOLUCION_TEXTO_MAX}
            placeholder="Describe la evolución del docente…"
            onChange={(event) => setTexto(event.target.value)}
            className={`${inputClassName} mt-2 resize-y`}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">
              {texto.length}/{EVOLUCION_TEXTO_MAX}
            </span>
            <button
              type="button"
              onClick={() => void guardar()}
              disabled={!texto.trim() || agregando}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-sky-800 px-4 text-sm font-semibold text-white transition hover:bg-sky-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {agregando ? (
                <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <Send className="h-4 w-4" aria-hidden="true" />
              )}
              Guardar evolución
            </button>
          </div>
        </section>
      ) : null}

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Evoluciones de esta atención ({evoluciones.length})
        </h3>
        {evoluciones.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-xs text-slate-500">
            No se han registrado evoluciones en esta atención.
          </p>
        ) : (
          <ul className="space-y-2">
            {evoluciones.map((evolucion) => (
              <EvolucionCard
                key={evolucion.id}
                evolucion={evolucion}
                quitando={quitandoId === evolucion.id}
                onQuitar={readOnly ? undefined : () => onQuitar(evolucion.id)}
              />
            ))}
          </ul>
        )}
      </section>

      <details className="group rounded-xl border border-slate-200 bg-white">
        <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-2 px-3 text-xs font-semibold text-slate-700 [&::-webkit-details-marker]:hidden">
          <span>
            Historial de evoluciones del docente <span className="font-normal text-slate-500">({historial.length})</span>
          </span>
          <ChevronDown
            className="h-4 w-4 text-slate-500 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-slate-100 p-3">
          {historial.length === 0 ? (
            <p className="text-xs text-slate-500">El docente no tiene evoluciones en atenciones anteriores.</p>
          ) : (
            <ul className="space-y-2">
              {historial.map((evolucion) => (
                <EvolucionCard key={evolucion.id} evolucion={evolucion} quitando={false} />
              ))}
            </ul>
          )}
        </div>
      </details>
    </div>
  );
}
