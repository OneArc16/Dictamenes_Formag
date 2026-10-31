import { DocenteSummaryCard } from '@/components/clinical-document/DocenteSummaryCard';
import type { AtencionDetalle } from '@/features/atenciones/application/atencion-detail';

import { formatAtencionFecha, formatAtencionHora } from '../AtencionesTable';
import { AtencionEstadoBadge } from './AtencionEstadoBadge';

function Row({ label, value, stacked = false }: { label: string; value: string | null; stacked?: boolean }) {
  // Los valores largos (EPS, cargo) se leen mejor debajo de su etiqueta.
  if (stacked) {
    return (
      <div>
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="break-words text-xs font-medium text-slate-800">{value || '—'}</dd>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-xs text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-right text-xs font-medium text-slate-800">{value || '—'}</dd>
    </div>
  );
}

export function AtencionLeftPanel({
  detalle,
  onEditDocente,
}: {
  detalle: AtencionDetalle;
  onEditDocente?: () => void;
}) {
  const { docente } = detalle;

  return (
    <>
      <DocenteSummaryCard
        docente={{
          nombreCompleto: docente.nombreCompleto,
          tipoDocumento: docente.tipoDocumento,
          documento: docente.documento,
          edad: docente.edad,
          secretaria: docente.secretaria,
          institucion: docente.institucion,
        }}
        onEdit={onEditDocente}
        showTipoDictamen={false}
      />

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Contacto y afiliación</h2>
        <dl className="mt-3 space-y-2">
          <Row label="Teléfono" value={docente.telefono} />
          <Row label="EPS" value={docente.eps} stacked />
          <Row label="Cargo" value={docente.cargo} stacked />
        </dl>
      </section>

      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Datos de la cita</h2>
          <AtencionEstadoBadge estado={detalle.estado} />
        </div>
        <dl className="mt-3 space-y-2">
          <Row label="Fecha" value={formatAtencionFecha(detalle.inicioProgramado)} />
          <Row
            label="Hora"
            value={`${formatAtencionHora(detalle.inicioProgramado)} – ${formatAtencionHora(detalle.finProgramado)}`}
          />
          <Row label="Especialidad" value={detalle.especialidadNombre} />
          <Row label="Modalidad" value={detalle.modalidadNombre} />
          <Row label="Sede" value={detalle.sedeNombre} />
          <Row label="Médico" value={detalle.medicoNombre} />
        </dl>
      </section>
    </>
  );
}
