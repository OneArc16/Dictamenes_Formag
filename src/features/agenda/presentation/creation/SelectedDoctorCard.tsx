'use client';

import { Clock3, Stethoscope, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type {
  AgendaPreviewDoctor,
  DoctorDateScheduleOverride,
} from '@/features/agenda/domain/types';
import type { AgendaDoctorDateSchedule } from './agenda-creation-work-dates';
import type { AgendaDoctorOption } from './agenda-creation-types';
import { AgendaDoctorDurationDialog } from './AgendaDoctorDurationDialog';
import { AgendaDoctorScheduleDialog } from './AgendaDoctorScheduleDialog';
import { DoctorScheduleSummary } from './DoctorScheduleSummary';

type SelectedDoctorCardProps = {
  siteId: number;
  doctor: AgendaDoctorOption;
  preview?: AgendaPreviewDoctor;
  scheduleOverride?: DoctorDateScheduleOverride[];
  defaultDuration: number;
  durationOverride?: number;
  minimumDuration: number;
  maximumDuration: number;
  durationStep: number;
  periodDates: string[];
  dateSchedules?: AgendaDoctorDateSchedule[];
  globallyExcludedDates: string[];
  scheduleLoading?: boolean;
  scheduleError?: string;
  excludedDates: string[];
  onExcludedDateChange: (date: string, excluded: boolean) => void;
  onScheduleOverrideChange: (dates?: DoctorDateScheduleOverride[]) => void;
  onDurationChange: (duration?: number) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export function SelectedDoctorCard({
  siteId,
  doctor,
  preview,
  scheduleOverride,
  defaultDuration,
  durationOverride,
  minimumDuration,
  maximumDuration,
  durationStep,
  periodDates,
  dateSchedules,
  globallyExcludedDates,
  scheduleLoading = false,
  scheduleError,
  excludedDates,
  onExcludedDateChange,
  onScheduleOverrideChange,
  onDurationChange,
  onRemove,
  disabled = false,
}: SelectedDoctorCardProps) {
  const scheduleLabel = scheduleOverride
    ? `${scheduleOverride.length} ${
        scheduleOverride.length === 1 ? 'fecha personalizada' : 'fechas personalizadas'
      } solo para esta agenda`
    : preview?.horarioLaboralNombre
    ? `${preview.horarioLaboralNombre} · ${
        preview.horarioOrigen === 'PARTICULAR' ? 'Horario particular' : 'Horario de sede'
      }`
    : doctor.tieneHorarioParticular
      ? 'Horario particular'
      : 'Horario de sede';

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[minmax(210px,0.58fr)_minmax(440px,1.42fr)_auto] lg:items-start">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
            <Stethoscope className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-950">{doctor.nombre}</h3>
            <p className="mt-0.5 text-sm leading-5 text-slate-600">
              {doctor.documento ? `${doctor.documento} · ` : ''}
              {doctor.especialidadPrincipal ?? 'Sin especialidad principal'}
            </p>
            <p className="mt-1 flex items-start gap-1.5 text-xs leading-4 text-slate-500">
              <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{scheduleLabel}</span>
            </p>
          </div>
        </div>
        <DoctorScheduleSummary
          doctorId={doctor.id}
          doctorName={doctor.nombre}
          schedules={dateSchedules}
          globallyExcludedDates={globallyExcludedDates}
          doctorExcludedDates={excludedDates}
          onExcludedDateChange={onExcludedDateChange}
          isLoading={scheduleLoading}
          error={scheduleError}
          disabled={disabled}
        />
        <div className="flex items-center justify-end gap-1.5">
          <AgendaDoctorScheduleDialog
            siteId={siteId}
            doctorId={doctor.id}
            doctorName={doctor.nombre}
            override={scheduleOverride}
            periodDates={periodDates}
            globallyExcludedDates={globallyExcludedDates}
            doctorExcludedDates={excludedDates}
            onChange={onScheduleOverrideChange}
            disabled={disabled}
          />
          <AgendaDoctorDurationDialog
            doctorId={doctor.id}
            doctorName={doctor.nombre}
            defaultDuration={defaultDuration}
            duration={durationOverride}
            minimum={minimumDuration}
            maximum={maximumDuration}
            step={durationStep}
            onChange={onDurationChange}
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
        <div role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {preview.errores.join(' ')}
        </div>
      ) : null}
    </article>
  );
}
