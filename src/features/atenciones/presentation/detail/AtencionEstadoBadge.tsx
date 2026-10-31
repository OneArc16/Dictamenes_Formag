import type { AtencionEstado } from '@/features/atenciones/application/atencion-detail';

export function AtencionEstadoBadge({ estado }: { estado: AtencionEstado }) {
  return estado === 'ATENDIDA' ? (
    <span className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
      Atendido
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">
      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" aria-hidden="true" />
      Activado
    </span>
  );
}
