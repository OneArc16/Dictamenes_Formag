'use client';

import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef } from 'react';

import ModulePageLayout from '@/components/module-shell/ModulePageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { AgendaCreationContext } from '@/features/agenda/application/agenda-creation-context';
import {
  differenceInCalendarDays,
  eachDateInclusive,
} from '@/features/agenda/domain/date-time';
import { deriveAgendaWorkDates } from './agenda-creation-work-dates';
import { AgendaCreationActions } from './AgendaCreationActions';
import { AgendaCreationHeader } from './AgendaCreationHeader';
import { AgendaDateExclusionDialog } from './AgendaDateExclusionDialog';
import { AgendaDateSelector } from './AgendaDateSelector';
import { AgendaDoctorCombobox } from './AgendaDoctorCombobox';
import { AgendaDurationSelector } from './AgendaDurationSelector';
import { AgendaPreviewPanel } from './AgendaPreviewPanel';
import { SelectedDoctorsSection } from './SelectedDoctorsSection';
import { useAgendaActiveDoctors } from './useAgendaActiveDoctors';
import { useAgendaCreationController } from './useAgendaCreationController';
import { useAgendaDoctorSearch } from './useAgendaDoctorSearch';
import { useAgendaEffectiveSchedules } from './useAgendaEffectiveSchedules';

const DOCTOR_SEARCH_INPUT_ID = 'agenda-doctor-search';

type ReadyAgendaCreationFormProps = {
  context: Extract<AgendaCreationContext, { status: 'ready' }>;
};

function ReadyAgendaCreationForm({ context }: ReadyAgendaCreationFormProps) {
  const controller = useAgendaCreationController(context);
  const doctorSearch = useAgendaDoctorSearch(context.site.id);
  const activeDoctors = useAgendaActiveDoctors(context.site.id);
  const errorRef = useRef<HTMLDivElement>(null);
  const { state } = controller;
  const fieldsDisabled = state.process.status === 'confirming';

  useEffect(() => {
    if (state.formError) {
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  }, [state.formError]);

  const selectedIds = useMemo(
    () => new Set(state.selectedDoctors.map((doctor) => doctor.id)),
    [state.selectedDoctors],
  );
  const selectedDoctorIds = useMemo(
    () => state.selectedDoctors.map((doctor) => doctor.id),
    [state.selectedDoctors],
  );
  const effectiveSchedules = useAgendaEffectiveSchedules(
    context.site.id,
    selectedDoctorIds,
  );

  const periodDates = useMemo(() => {
    if (!state.startDate || !state.endDate || state.endDate < state.startDate) return [];
    const days = differenceInCalendarDays(state.startDate, state.endDate);
    if (!Number.isFinite(days) || days < 0 || days >= context.limits.maxRangeDays) return [];
    return eachDateInclusive(state.startDate, state.endDate);
  }, [context.limits.maxRangeDays, state.endDate, state.startDate]);

  const currentPreview =
    state.process.status === 'ready' || state.process.status === 'confirming'
      ? state.process.preview
      : undefined;
  const workDates = useMemo(
    () =>
      deriveAgendaWorkDates(
        periodDates,
        selectedDoctorIds,
        effectiveSchedules.schedules,
        state.doctorScheduleOverrides,
      ),
    [
      effectiveSchedules.schedules,
      periodDates,
      selectedDoctorIds,
      state.doctorScheduleOverrides,
    ],
  );
  const evaluatedWorkDates = workDates.complete
    ? workDates.allDoctors
    : currentPreview?.fechasLaboralesEvaluadas;

  const removeDoctor = (doctorId: number) => {
    controller.removeDoctor(doctorId);
    requestAnimationFrame(() => document.getElementById(DOCTOR_SEARCH_INPUT_ID)?.focus());
  };

  const addAllActiveDoctors = async () => {
    try {
      controller.addDoctors(await activeDoctors.load());
    } catch {
      // The query error is exposed next to the action by useAgendaActiveDoctors.
    }
  };

  return (
    <ModulePageLayout
      moduleKey="agenda"
      title="Crear agenda médica"
      description="Selecciona médicos, periodo y duración en una sola vista. La disponibilidad se valida antes de confirmar."
      compactHero
    >
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-6 p-4 sm:p-6">
          <AgendaCreationHeader context={context} />

          {state.formError ? (
            <div
              ref={errorRef}
              tabIndex={-1}
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              {state.formError}
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[minmax(320px,0.75fr)_minmax(580px,1.25fr)]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
              <AgendaDoctorCombobox
                inputId={DOCTOR_SEARCH_INPUT_ID}
                query={doctorSearch.query}
                onQueryChange={doctorSearch.setQuery}
                options={doctorSearch.options}
                selectedIds={selectedIds}
                onSelect={controller.addDoctor}
                minimumLength={doctorSearch.minimumLength}
                isLoading={doctorSearch.isLoading}
                error={doctorSearch.error}
                onRetry={() => void doctorSearch.retry()}
                onSelectAll={() => void addAllActiveDoctors()}
                isSelectingAll={activeDoctors.isLoading}
                selectAllError={activeDoctors.error}
                canSelectAll={state.selectedDoctors.length < context.limits.maxDoctors}
                validationError={state.fieldErrors.doctors}
                disabled={
                  fieldsDisabled || state.selectedDoctors.length >= context.limits.maxDoctors
                }
              />
              {state.selectedDoctors.length >= context.limits.maxDoctors ? (
                <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                  Alcanzaste el límite de {context.limits.maxDoctors} médicos por generación.
                </p>
              ) : null}
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
              <AgendaDateSelector
                startDate={state.startDate}
                endDate={state.endDate}
                periodDates={periodDates}
                onRangeChange={controller.changeRange}
                excludedDates={state.excludedDates}
                today={context.today}
                maxRangeDays={context.limits.maxRangeDays}
                evaluatedWorkDates={evaluatedWorkDates}
                startError={state.fieldErrors.startDate}
                endError={state.fieldErrors.endDate}
                disabled={fieldsDisabled}
              />
              <div
                role="group"
                aria-label="Configuración adicional de la agenda"
                className="flex flex-wrap items-start gap-x-5 gap-y-3"
              >
                {periodDates.length > 0 ? (
                  <AgendaDateExclusionDialog
                    periodDates={periodDates}
                    excludedDates={state.excludedDates}
                    onExcludedDateChange={controller.toggleGlobalDate}
                    evaluatedWorkDates={evaluatedWorkDates}
                    workDatesLoading={effectiveSchedules.isLoading}
                    workDatesError={effectiveSchedules.error}
                    onRetryWorkDates={() => void effectiveSchedules.retry()}
                    error={state.fieldErrors.exclusions}
                    disabled={fieldsDisabled}
                  />
                ) : null}
                <AgendaDurationSelector
                  value={state.durationMinutes}
                  onChange={controller.changeDuration}
                  minimum={context.limits.minDurationMinutes}
                  maximum={context.limits.maxDurationMinutes}
                  step={context.limits.durationStepMinutes}
                  error={state.fieldErrors.duration}
                  disabled={fieldsDisabled}
                />
              </div>
            </div>
          </div>

          <SelectedDoctorsSection
            siteId={context.site.id}
            doctors={state.selectedDoctors}
            periodDates={periodDates}
            globallyExcludedDates={state.excludedDates}
            doctorExclusions={state.doctorExclusions}
            doctorScheduleOverrides={state.doctorScheduleOverrides}
            workDatesByDoctor={workDates.complete ? workDates.byDoctor : undefined}
            preview={currentPreview}
            onRemove={removeDoctor}
            onDoctorDateChange={controller.toggleDoctorDate}
            onDoctorScheduleChange={controller.changeDoctorSchedule}
            scheduleError={state.fieldErrors.schedules}
            disabled={fieldsDisabled}
          />

          <AgendaPreviewPanel process={state.process} onRetry={controller.calculate} />

          <AgendaCreationActions
            process={state.process}
            onCalculate={controller.calculate}
            onConfirm={controller.confirm}
          />

          <p className="sr-only" aria-live="polite">
            {state.announcement}
          </p>
        </CardContent>
      </Card>
    </ModulePageLayout>
  );
}

function BlockedAgendaCreationForm({
  context,
}: {
  context: Extract<AgendaCreationContext, { status: 'blocked' }>;
}) {
  return (
    <ModulePageLayout
      moduleKey="agenda"
      title="Crear agenda médica"
      description="No es posible iniciar la creación de agenda con la configuración actual."
      compactHero
    >
      <Card className="border-amber-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-semibold">La creación de agenda está bloqueada</h2>
              <p className="mt-1 text-sm leading-6">{context.message}</p>
            </div>
          </div>
          <Button asChild variant="outline" className="mt-5 min-h-11">
            <Link href="/agenda">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver a agendas
            </Link>
          </Button>
        </CardContent>
      </Card>
    </ModulePageLayout>
  );
}

export default function AgendaCreationForm({ context }: { context: AgendaCreationContext }) {
  return context.status === 'ready' ? (
    <ReadyAgendaCreationForm context={context} />
  ) : (
    <BlockedAgendaCreationForm context={context} />
  );
}
