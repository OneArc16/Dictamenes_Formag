'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CalendarClock,
  LoaderCircle,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { IconTooltip } from '@/components/ui/icon-tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
  EffectiveWorkSchedule,
  WeeklyBlock,
} from '@/features/agenda/domain/types';
import {
  scheduleBlocksSchema,
  validationMessage,
} from '@/features/agenda/domain/validation';
import { agendaRequest } from '@/features/agenda/presentation/api-client';

const WEEK_DAYS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

type AgendaDoctorScheduleDialogProps = {
  siteId: number;
  doctorId: number;
  doctorName: string;
  override?: WeeklyBlock[];
  onChange: (blocks?: WeeklyBlock[]) => void;
  disabled?: boolean;
};

type ScheduleEditorProps = {
  doctorId: number;
  schedule: EffectiveWorkSchedule;
  initialBlocks: WeeklyBlock[];
  customized: boolean;
  onSave: (blocks: WeeklyBlock[]) => void;
  onReset: () => void;
};

function ScheduleEditor({
  doctorId,
  schedule,
  initialBlocks,
  customized,
  onSave,
  onReset,
}: ScheduleEditorProps) {
  const [blocks, setBlocks] = useState(() => initialBlocks.map((block) => ({ ...block })));
  const [error, setError] = useState('');

  const updateBlock = (index: number, patch: Partial<WeeklyBlock>) => {
    setBlocks((current) =>
      current.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...patch } : block,
      ),
    );
  };

  const save = () => {
    const parsed = scheduleBlocksSchema.safeParse(blocks);
    if (!parsed.success) {
      setError(validationMessage(parsed.error));
      return;
    }

    onSave(
      parsed.data.map((block) => ({
        diaSemana: block.diaSemana,
        horaInicio: block.horaInicio,
        horaFin: block.horaFin,
      })),
    );
  };

  return (
    <>
      <div className="min-h-0 overflow-y-auto px-5 py-4 sm:px-6">
        <div className="mb-4 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs leading-5 text-sky-900">
          Esta personalización solo se usará para generar esta agenda. El horario
          predeterminado “{schedule.nombre}” no se modificará.
        </div>

        {error ? (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700"
          >
            {error}
          </p>
        ) : null}

        <fieldset>
          <legend className="sr-only">Bloques semanales personalizados</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {WEEK_DAYS.map((day, dayIndex) => {
              const dayNumber = dayIndex + 1;
              const dayBlocks = blocks
                .map((block, index) => ({ block, index }))
                .filter(({ block }) => block.diaSemana === dayNumber);

              return (
                <section key={day} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex min-h-11 items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-800">{day}</h3>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={blocks.length >= 35}
                      title={`Agregar bloque el ${day.toLowerCase()}`}
                      aria-label={`Agregar bloque el ${day.toLowerCase()}`}
                      className="h-11 w-11 rounded-full text-sky-700 hover:bg-sky-50"
                      onClick={() =>
                        setBlocks((current) => [
                          ...current,
                          {
                            diaSemana: dayNumber,
                            horaInicio: '08:00',
                            horaFin: '12:00',
                          },
                        ])
                      }
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>

                  {dayBlocks.length === 0 ? (
                    <p className="py-2 text-xs text-slate-500">Sin atención</p>
                  ) : (
                    <div className="space-y-2">
                      {dayBlocks.map(({ block, index }) => (
                        <div
                          key={`${dayNumber}-${index}`}
                          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] items-end gap-2"
                        >
                          <div>
                            <Label
                              htmlFor={`agenda-${doctorId}-${dayNumber}-${index}-start`}
                              className="sr-only"
                            >
                              Inicio {day}
                            </Label>
                            <Input
                              id={`agenda-${doctorId}-${dayNumber}-${index}-start`}
                              type="time"
                              value={block.horaInicio}
                              onChange={(event) =>
                                updateBlock(index, { horaInicio: event.target.value })
                              }
                              className="min-h-11 px-2 text-sm"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor={`agenda-${doctorId}-${dayNumber}-${index}-end`}
                              className="sr-only"
                            >
                              Fin {day}
                            </Label>
                            <Input
                              id={`agenda-${doctorId}-${dayNumber}-${index}-end`}
                              type="time"
                              value={block.horaFin}
                              onChange={(event) =>
                                updateBlock(index, { horaFin: event.target.value })
                              }
                              className="min-h-11 px-2 text-sm"
                            />
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            title={`Eliminar bloque de ${day.toLowerCase()}`}
                            aria-label={`Eliminar bloque de ${day.toLowerCase()}`}
                            className="h-11 w-11 rounded-full text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                            onClick={() =>
                              setBlocks((current) =>
                                current.filter((_, blockIndex) => blockIndex !== index),
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </fieldset>
      </div>

      <DialogFooter className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-between sm:px-6">
        <Button
          type="button"
          variant="ghost"
          disabled={!customized}
          className="min-h-11 justify-start text-slate-600"
          onClick={onReset}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Usar predeterminado
        </Button>
        <Button
          type="button"
          className="min-h-11 bg-sky-700 px-5 text-white hover:bg-sky-800"
          onClick={save}
        >
          Aplicar a esta agenda
        </Button>
      </DialogFooter>
    </>
  );
}

export function AgendaDoctorScheduleDialog({
  siteId,
  doctorId,
  doctorName,
  override,
  onChange,
  disabled = false,
}: AgendaDoctorScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const scheduleQuery = useQuery<{ schedule: EffectiveWorkSchedule }, Error>({
    queryKey: ['agenda-effective-schedule', siteId, doctorId],
    enabled: open,
    queryFn: () =>
      agendaRequest(
        `/api/agenda/medicos/${doctorId}/horario-efectivo?sedeId=${siteId}`,
      ),
    staleTime: 60_000,
    retry: 1,
  });
  const tooltipId = `agenda-doctor-schedule-tooltip-${doctorId}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <IconTooltip
        id={tooltipId}
        label="Personalizar horario"
        align="right"
      >
        <DialogTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={disabled}
            aria-label={`Personalizar horas de ${doctorName} solo para esta agenda`}
            aria-describedby={tooltipId}
            className={`h-11 w-11 rounded-full shadow-none transition-colors duration-200 ${
              override
                ? 'border-sky-300 bg-sky-50 text-sky-800 hover:border-sky-400 hover:bg-sky-100'
                : 'border-slate-200 text-sky-700 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-800'
            }`}
          >
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DialogTrigger>
      </IconTooltip>

      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-3xl grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden border-slate-200 bg-white p-0 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 px-5 py-5 pr-14 sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-left text-lg text-slate-950">
            <CalendarClock className="h-5 w-5 text-sky-700" aria-hidden="true" />
            Personalizar horas
          </DialogTitle>
          <DialogDescription className="text-left leading-5 text-slate-600">
            Configura los bloques semanales de {doctorName} únicamente para esta
            agenda.
          </DialogDescription>
        </DialogHeader>

        {scheduleQuery.isLoading ? (
          <div className="flex min-h-52 items-center justify-center gap-2 px-5 text-sm text-slate-600">
            <LoaderCircle
              className="h-5 w-5 animate-spin text-sky-700 motion-reduce:animate-none"
              aria-hidden="true"
            />
            Cargando horario predeterminado…
          </div>
        ) : scheduleQuery.error ? (
          <div className="space-y-3 px-5 py-8 sm:px-6">
            <p role="alert" className="text-sm font-medium text-rose-700">
              {scheduleQuery.error.message}
            </p>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => void scheduleQuery.refetch()}
            >
              Reintentar
            </Button>
          </div>
        ) : scheduleQuery.data?.schedule ? (
          <ScheduleEditor
            key={`${doctorId}-${override ? JSON.stringify(override) : 'default'}`}
            doctorId={doctorId}
            schedule={scheduleQuery.data.schedule}
            initialBlocks={override ?? scheduleQuery.data.schedule.bloques}
            customized={Boolean(override)}
            onSave={(blocks) => {
              onChange(blocks);
              setOpen(false);
            }}
            onReset={() => {
              onChange(undefined);
              setOpen(false);
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
