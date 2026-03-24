import { type RecomendacionEstado } from '@/components/recomendaciones/detail/types';

const statusMap: Record<
  RecomendacionEstado,
  { label: string; className: string }
> = {
  BORRADOR: {
    label: 'Pendiente',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  },
  REABIERTO: {
    label: 'Reabierta',
    className: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  },
  CERRADA: {
    label: 'Cerrada',
    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  },
  ANULADA: {
    label: 'Anulada',
    className: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
  },
};

export function RecomendacionStatusBadge({
  estado,
}: {
  estado: RecomendacionEstado;
}) {
  const config = statusMap[estado];

  return (
    <span
      className={
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ' +
        config.className
      }
    >
      {config.label}
    </span>
  );
}
