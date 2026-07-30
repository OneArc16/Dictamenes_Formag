import {
  CalendarX2,
  Info,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TimeBlock } from '@/features/agenda/domain/types';
import { formatAgendaDate } from './agenda-creation-date';

type AgendaDoctorDateEditorProps = {
  editorId: string;
  doctorId: number;
  selectedDate: string;
  blocks: TimeBlock[];
  customized: boolean;
  holidayName?: string;
  excluded: boolean;
  onBlocksChange: (blocks: TimeBlock[]) => void;
  onResetDate: () => void;
};

function nextBlockSuggestion(blocks: TimeBlock[]): TimeBlock | null {
  const last = [...blocks].sort((left, right) =>
    left.horaFin.localeCompare(right.horaFin),
  ).at(-1);
  if (!last) return { horaInicio: '08:00', horaFin: '12:00' };

  const [hour, minute] = last.horaFin.split(':').map(Number);
  const startMinutes = hour * 60 + minute;
  if (startMinutes >= 23 * 60 + 59) return null;
  const endMinutes = Math.min(startMinutes + 4 * 60, 23 * 60 + 59);
  const formatTime = (value: number) =>
    `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(
      value % 60,
    ).padStart(2, '0')}`;

  return {
    horaInicio: formatTime(startMinutes),
    horaFin: formatTime(endMinutes),
  };
}

export function AgendaDoctorDateEditor({
  editorId,
  doctorId,
  selectedDate,
  blocks,
  customized,
  holidayName,
  excluded,
  onBlocksChange,
  onResetDate,
}: AgendaDoctorDateEditorProps) {
  const nextBlock = nextBlockSuggestion(blocks);
  const updateBlock = (index: number, patch: Partial<TimeBlock>) => {
    onBlocksChange(
      blocks.map((block, blockIndex) =>
        blockIndex === index ? { ...block, ...patch } : block,
      ),
    );
  };

  return (
    <section
      aria-labelledby={editorId}
      className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4"
    >
      {selectedDate ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3
                id={editorId}
                className="text-base font-semibold capitalize text-slate-950"
              >
                {formatAgendaDate(selectedDate)}
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                {customized
                  ? 'Horario personalizado para esta fecha'
                  : 'Horario predeterminado para este día'}
              </p>
            </div>
            {customized ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Personalizada
              </span>
            ) : null}
          </div>

          {holidayName ? (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                <strong>Festivo:</strong> {holidayName}. No generará cupos con el
                horario predeterminado; personaliza sus horas para habilitarlo.
              </span>
            </div>
          ) : null}

          {excluded ? (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
              <CalendarX2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Esta fecha está excluida y no generará cupos mientras conserve esa
              exclusión.
            </div>
          ) : null}

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-slate-900">
              Horas de atención
            </legend>

            {blocks.length === 0 ? (
              <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-600">
                  El horario predeterminado no tiene atención este día.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 min-h-11 border-sky-200 text-sky-800 hover:bg-sky-50"
                  onClick={() =>
                    onBlocksChange([
                      { horaInicio: '08:00', horaFin: '12:00' },
                    ])
                  }
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Agregar atención
                </Button>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {blocks.map((block, index) => (
                  <div
                    key={`${selectedDate}-${index}`}
                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px] items-end gap-2"
                  >
                    <div>
                      <Label
                        htmlFor={`agenda-${doctorId}-${selectedDate}-${index}-start`}
                        className="mb-1.5 block text-xs text-slate-600"
                      >
                        Desde
                      </Label>
                      <Input
                        id={`agenda-${doctorId}-${selectedDate}-${index}-start`}
                        type="time"
                        value={block.horaInicio}
                        onChange={(event) =>
                          updateBlock(index, {
                            horaInicio: event.target.value,
                          })
                        }
                        className="min-h-11 px-2 text-sm tabular-nums"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor={`agenda-${doctorId}-${selectedDate}-${index}-end`}
                        className="mb-1.5 block text-xs text-slate-600"
                      >
                        Hasta
                      </Label>
                      <Input
                        id={`agenda-${doctorId}-${selectedDate}-${index}-end`}
                        type="time"
                        value={block.horaFin}
                        onChange={(event) =>
                          updateBlock(index, {
                            horaFin: event.target.value,
                          })
                        }
                        className="min-h-11 px-2 text-sm tabular-nums"
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={blocks.length === 1}
                      title={
                        blocks.length === 1
                          ? 'Debe conservar al menos un bloque'
                          : 'Eliminar bloque'
                      }
                      aria-label="Eliminar bloque de atención"
                      className="h-11 w-11 rounded-full text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                      onClick={() =>
                        onBlocksChange(
                          blocks.filter(
                            (_, blockIndex) => blockIndex !== index,
                          ),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={!customized}
                className="min-h-11 text-slate-600"
                onClick={onResetDate}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Restablecer día
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={blocks.length === 0 || blocks.length >= 5 || !nextBlock}
                className="min-h-11 border-sky-200 text-sky-800 hover:bg-sky-50"
                onClick={() => {
                  if (nextBlock) onBlocksChange([...blocks, nextBlock]);
                }}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Agregar bloque
              </Button>
            </div>
          </fieldset>
        </>
      ) : (
        <div className="flex min-h-60 items-center justify-center text-center text-sm text-slate-600">
          Selecciona una fecha del periodo para revisar sus horas.
        </div>
      )}
    </section>
  );
}
