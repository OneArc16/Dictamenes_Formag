'use client';

import { ArrowRight, FilePenLine, LockKeyhole, RotateCcw } from 'lucide-react';

import type {
  DictamenEstado,
  DictamenHistorialItem,
  DictamenHistorialTipo,
} from '@/components/dictamen/types';

const eventConfig: Record<
  DictamenHistorialTipo,
  { label: string; className: string; Icon: typeof RotateCcw }
> = {
  REAPERTURA: {
    label: 'Reapertura',
    className: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
    Icon: RotateCcw,
  },
  EDICION: {
    label: 'Edicion',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
    Icon: FilePenLine,
  },
  CIERRE: {
    label: 'Cierre',
    className: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
    Icon: LockKeyhole,
  },
};

const estadoConfig: Record<
  DictamenEstado,
  { label: string; className: string }
> = {
  PENDIENTE: {
    label: 'Pendiente',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  },
  REABIERTO: {
    label: 'Reabierto',
    className: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  },
  CERRADO: {
    label: 'Cerrado',
    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  },
};

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function DictamenEstadoBadge({ estado }: { estado: DictamenEstado }) {
  const config = estadoConfig[estado];

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
        config.className,
      ].join(' ')}
    >
      {config.label}
    </span>
  );
}

function EmptyHistoryState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">
      <p className="text-sm font-medium text-slate-700">Aun no hay eventos registrados.</p>
      <p className="mt-2 text-xs leading-6 text-slate-500">
        Cuando se cierre, reabra o edite el dictamen, el historial aparecera aqui.
      </p>
    </div>
  );
}

function FieldValue({ value }: { value: string | null }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
        {value ?? '—'}
      </p>
    </div>
  );
}

export default function TabHistorial({ historial }: { historial: DictamenHistorialItem[] }) {
  if (historial.length === 0) {
    return <EmptyHistoryState />;
  }

  return (
    <div className="space-y-4">
      {historial.map((item) => {
        const config = eventConfig[item.tipo];
        const EventIcon = config.Icon;

        return (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={[
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold',
                      config.className,
                    ].join(' ')}
                  >
                    <EventIcon className="h-3.5 w-3.5" />
                    {config.label}
                  </span>

                  {item.estadoAnterior && item.estadoNuevo ? (
                    <div className="flex items-center gap-2">
                      <DictamenEstadoBadge estado={item.estadoAnterior} />
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                      <DictamenEstadoBadge estado={item.estadoNuevo} />
                    </div>
                  ) : null}
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-900">{item.actorNombre}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
              </div>
            </div>

            {item.motivoReapertura ? (
              <div className="mt-4 rounded-lg border border-sky-100 bg-sky-50 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">
                  Motivo de reapertura
                </p>
                <p className="mt-1 text-sm leading-6 text-sky-900">{item.motivoReapertura}</p>
              </div>
            ) : null}

            {item.cambios.length > 0 ? (
              <div className="mt-4 space-y-3">
                {item.cambios.map((cambio) => (
                  <div
                    key={`${item.id}-${cambio.campo}`}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {cambio.etiqueta}
                    </p>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Antes
                        </p>
                        <FieldValue value={cambio.anterior} />
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Despues
                        </p>
                        <FieldValue value={cambio.nuevo} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs leading-6 text-slate-500">
                Este evento no cambio campos del formulario; solo actualizo el estado o registro operativo.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
