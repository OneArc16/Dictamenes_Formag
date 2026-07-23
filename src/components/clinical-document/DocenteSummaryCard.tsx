import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';

type Props = {
  docente: {
    nombreCompleto: string;
    tipoDocumento: string;
    documento: string;
    tipoDictamen?: string | null;
    edad?: number | null;
    secretaria?: string | null;
    institucion?: string | null;
  };
  onEdit?: () => void;
};

export function DocenteSummaryCard({ docente, onEdit }: Props) {
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Docente
          </h2>
          <p className="mt-1 break-words text-lg font-semibold leading-6 text-slate-900">
            {docente.nombreCompleto}
          </p>
          <p className="text-xs text-slate-600">
            {docente.tipoDocumento} {docente.documento}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Tipo de dictamen:{' '}
            <span className="font-medium text-slate-700">
              {docente.tipoDictamen === 'RECALIFICACION'
                ? 'Recalificación'
                : docente.tipoDictamen
                  ? 'Calificación'
                  : '—'}
            </span>
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Edad:{' '}
            {docente.edad == null ? 'Edad no registrada' : `${docente.edad} años`}
          </p>

          <p className="mt-2 text-xs font-semibold text-slate-500">Secretaría</p>
          <p className="break-words text-xs text-slate-700">
            {docente.secretaria || 'Sin secretaría registrada'}
          </p>

          <p className="mt-2 text-xs font-semibold text-slate-500">Institución</p>
          <p className="break-words text-xs text-slate-700">
            {docente.institucion || 'Sin institución registrada'}
          </p>
        </div>

        {onEdit ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="min-h-11 shrink-0 gap-2 rounded-full border-sky-600 text-sky-700 hover:bg-sky-50"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Editar
          </Button>
        ) : null}
      </div>
    </section>
  );
}
