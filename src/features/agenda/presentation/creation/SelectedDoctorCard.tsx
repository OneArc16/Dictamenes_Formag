'use client';

import { CalendarMinus2, Clock3, Stethoscope, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type {
  AgendaPreviewDoctor,
  WeeklyBlock,
} from '@/features/agenda/domain/types';
import { formatAgendaDateShort } from './agenda-creation-date';
import type { AgendaDoctorOption } from './agenda-creation-types';
import { AgendaDoctorScheduleDialog } from './AgendaDoctorScheduleDialog';

type SelectedDoctorCardProps = {
  siteId: number;
  doctor: AgendaDoctorOption;
  preview?: AgendaPreviewDoctor;
  scheduleOverride?: WeeklyBlock[];
  selectableDates: string[];
  excludedDates: string[];
  onExcludedDateChange: (date: string, excluded: boolean) => void;
  onScheduleOverrideChange: (blocks?: WeeklyBlock[]) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export function SelectedDoctorCard({
  siteId,
  doctor,
  preview,
  scheduleOverride,
  selectableDates,
  excludedDates,
  onExcludedDateChange,
  onScheduleOverrideChange,
  onRemove,
  disabled = false,
}: SelectedDoctorCardProps) {
  const scheduleLabel = scheduleOverride
    ? 'Horario personalizado solo para esta agenda'
    : preview?.horarioLaboralNombre
    ? `${preview.horarioLaboralNombre} · ${
        preview.horarioOrigen === 'PARTICULAR' ? 'Horario particular' : 'Horario de sede'
      }`
    : doctor.tieneHorarioParticular
      ? 'Horario particular'
      : 'Horario de sede';

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
            <Stethoscope className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-950">{doctor.nombre}</h3>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              {doctor.documento ? `${doctor.documento} · ` : ''}
              {doctor.especialidadPrincipal ?? 'Sin especialidad principal'}
            </p>
            <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-500">
              <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{scheduleLabel}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AgendaDoctorScheduleDialog
            siteId={siteId}
            doctorId={doctor.id}
            doctorName={doctor.nombre}
            override={scheduleOverride}
            onChange={onScheduleOverrideChange}
            disabled={disabled}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            title={`Quitar a ${doctor.nombre}`}
            className="h-11 w-11 shrink-0 rounded-full text-rose-700 hover:bg-rose-50 hover:text-rose-800"
            onClick={onRemove}
            disabled={disabled}
            aria-label={`Quitar a ${doctor.nombre}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {preview?.errores.length ? (
        <div role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {preview.errores.join(' ')}
        </div>
      ) : null}

      <details className="mt-4 border-t border-slate-100 pt-3">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-2 py-2 text-sm font-medium text-slate-800 focus-visible:ring-2 focus-visible:ring-sky-500">
          <span className="flex items-center gap-2">
            <CalendarMinus2 className="h-4 w-4 text-sky-700" aria-hidden="true" />
            Excluir fechas solo para este médico
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs tabular-nums text-slate-600">
            {excludedDates.length}
          </span>
        </summary>

        <fieldset disabled={disabled} className="mt-3">
          <legend className="sr-only">Fechas excluidas para {doctor.nombre}</legend>
          {selectableDates.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-3 text-sm leading-5 text-slate-600">
              No hay fechas disponibles para configurar en el periodo actual.
            </p>
          ) : (
            <div className="grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3">
              {selectableDates.map((date) => {
                const excluded = excludedDates.includes(date);
                return (
                  <label
                    key={date}
                    className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-800 hover:border-sky-300"
                  >
                    <Checkbox
                      checked={excluded}
                      onCheckedChange={(value) => onExcludedDateChange(date, value === true)}
                      aria-label={`${excluded ? 'Incluir' : 'Excluir'} ${date} para ${doctor.nombre}`}
                      className="h-5 w-5"
                    />
                    <span className="capitalize">{formatAgendaDateShort(date)}</span>
                  </label>
                );
              })}
            </div>
          )}
        </fieldset>
      </details>
    </article>
  );
}
