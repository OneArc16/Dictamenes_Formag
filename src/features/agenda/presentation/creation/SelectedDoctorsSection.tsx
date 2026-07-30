'use client';

import { UsersRound } from 'lucide-react';

import type {
  AgendaPreview,
  DoctorDateScheduleOverride,
} from '@/features/agenda/domain/types';
import type { AgendaDoctorDateSchedule } from './agenda-creation-work-dates';
import { SelectedDoctorCard } from './SelectedDoctorCard';
import type { AgendaDoctorOption } from './agenda-creation-types';

type SelectedDoctorsSectionProps = {
  siteId: number;
  doctors: AgendaDoctorOption[];
  periodDates: string[];
  globallyExcludedDates: string[];
  doctorExclusions: Record<number, string[]>;
  doctorScheduleOverrides: Record<number, DoctorDateScheduleOverride[]>;
  defaultDuration: number;
  doctorDurationOverrides: Record<number, number>;
  minimumDuration: number;
  maximumDuration: number;
  durationStep: number;
  dateSchedulesByDoctor?: Record<number, AgendaDoctorDateSchedule[]>;
  scheduleErrorsByDoctor?: Record<number, string>;
  workSchedulesLoading?: boolean;
  workSchedulesError?: string;
  preview?: AgendaPreview;
  onRemove: (doctorId: number) => void;
  onDoctorDateChange: (doctorId: number, date: string, excluded: boolean) => void;
  onDoctorScheduleChange: (
    doctorId: number,
    dates?: DoctorDateScheduleOverride[],
  ) => void;
  onDoctorDurationChange: (
    doctorId: number,
    duration?: number,
  ) => void;
  scheduleError?: string;
  disabled?: boolean;
};

export function SelectedDoctorsSection({
  siteId,
  doctors,
  periodDates,
  globallyExcludedDates,
  doctorExclusions,
  doctorScheduleOverrides,
  defaultDuration,
  doctorDurationOverrides,
  minimumDuration,
  maximumDuration,
  durationStep,
  dateSchedulesByDoctor,
  scheduleErrorsByDoctor,
  workSchedulesLoading = false,
  workSchedulesError,
  preview,
  onRemove,
  onDoctorDateChange,
  onDoctorScheduleChange,
  onDoctorDurationChange,
  scheduleError,
  disabled = false,
}: SelectedDoctorsSectionProps) {
  const previewByDoctor = new Map(preview?.medicos.map((doctor) => [doctor.medicoId, doctor]));

  return (
    <section aria-labelledby="selected-doctors-title" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="selected-doctors-title" className="text-lg font-semibold text-slate-950">
            Médicos seleccionados
          </h2>
        </div>
        <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-sky-50 px-3 text-sm font-semibold text-sky-800">
          <UsersRound className="h-4 w-4" aria-hidden="true" />
          <span className="tabular-nums">{doctors.length}</span>
          {doctors.length === 1 ? 'médico' : 'médicos'}
        </span>
      </div>

      {scheduleError ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
        >
          {scheduleError}
        </p>
      ) : null}

      {doctors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-6 text-center">
          <UsersRound className="mx-auto h-7 w-7 text-slate-400" aria-hidden="true" />
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Aún no has agregado médicos. Búscalos en el campo superior para comenzar.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {doctors.map((doctor) => {
            const doctorPreview = previewByDoctor.get(doctor.id);

            return (
              <SelectedDoctorCard
                key={doctor.id}
                siteId={siteId}
                doctor={doctor}
                preview={doctorPreview}
                scheduleOverride={doctorScheduleOverrides[doctor.id]}
                defaultDuration={defaultDuration}
                durationOverride={doctorDurationOverrides[doctor.id]}
                minimumDuration={minimumDuration}
                maximumDuration={maximumDuration}
                durationStep={durationStep}
                periodDates={periodDates}
                dateSchedules={dateSchedulesByDoctor?.[doctor.id]}
                globallyExcludedDates={globallyExcludedDates}
                scheduleLoading={workSchedulesLoading}
                scheduleError={
                  workSchedulesError ?? scheduleErrorsByDoctor?.[doctor.id]
                }
                excludedDates={doctorExclusions[doctor.id] ?? []}
                onExcludedDateChange={(date, excluded) =>
                  onDoctorDateChange(doctor.id, date, excluded)
                }
                onScheduleOverrideChange={(blocks) =>
                  onDoctorScheduleChange(doctor.id, blocks)
                }
                onDurationChange={(duration) =>
                  onDoctorDurationChange(doctor.id, duration)
                }
                onRemove={() => onRemove(doctor.id)}
                disabled={disabled}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
