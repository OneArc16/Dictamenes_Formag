import { isoDayOfWeek, localDateTimeToUtc } from './date-time';
import type { DateOnly, SlotCandidate, WeeklyBlock } from './types';

type GenerateSlotsInput = {
  medicoId: number;
  sedeId: number;
  horarioLaboralId: number;
  fecha: DateOnly;
  zonaHoraria: string;
  duracionMinutos: number;
  bloques: WeeklyBlock[];
};

export function generateSlotCandidates(input: GenerateSlotsInput): SlotCandidate[] {
  const day = isoDayOfWeek(input.fecha);
  const durationMs = input.duracionMinutos * 60_000;
  const candidates: SlotCandidate[] = [];

  const blocks = input.bloques
    .filter((block) => block.diaSemana === day)
    .sort((left, right) => left.horaInicio.localeCompare(right.horaInicio));

  for (const block of blocks) {
    let cursor = localDateTimeToUtc(input.fecha, block.horaInicio, input.zonaHoraria);
    const blockEnd = localDateTimeToUtc(input.fecha, block.horaFin, input.zonaHoraria);

    while (cursor.getTime() + durationMs <= blockEnd.getTime()) {
      const end = new Date(cursor.getTime() + durationMs);
      candidates.push({
        medicoId: input.medicoId,
        sedeId: input.sedeId,
        horarioLaboralId: input.horarioLaboralId,
        fecha: input.fecha,
        inicio: new Date(cursor),
        fin: end,
        duracionMinutos: input.duracionMinutos,
      });
      cursor = end;
    }
  }

  return candidates;
}

export function intervalsOverlap(
  left: Pick<SlotCandidate, 'inicio' | 'fin'>,
  right: { inicio: Date; fin: Date },
) {
  return left.inicio < right.fin && left.fin > right.inicio;
}
