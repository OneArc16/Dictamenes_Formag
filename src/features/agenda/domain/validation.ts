import { z } from 'zod';

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function isRealDateOnly(value: string) {
  if (!DATE_ONLY_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const dateOnlySchema = z.string().refine(isRealDateOnly, 'La fecha no es válida.');
export const timeSchema = z.string().regex(TIME_PATTERN, 'La hora debe usar el formato HH:mm.');

const exclusionsByDoctorSchema = z.object({
  medicoId: z.number().int().positive(),
  fechas: z.array(dateOnlySchema).max(90).default([]),
});

export const workScheduleBlockSchema = z.object({
  diaSemana: z.number().int().min(1).max(7),
  horaInicio: timeSchema,
  horaFin: timeSchema,
  orden: z.number().int().min(1).max(50).optional(),
});

export const scheduleBlocksSchema = z
  .array(workScheduleBlockSchema)
  .min(1)
  .max(35)
  .superRefine((blocks, context) => {
    const byDay = new Map<number, Array<{ start: string; end: string; index: number }>>();
    blocks.forEach((block, index) => {
      if (block.horaInicio >= block.horaFin) {
        context.addIssue({
          code: 'custom',
          path: [index, 'horaFin'],
          message: 'La hora final debe ser posterior.',
        });
      }
      const day = byDay.get(block.diaSemana) ?? [];
      day.push({ start: block.horaInicio, end: block.horaFin, index });
      byDay.set(block.diaSemana, day);
    });

    for (const [day, dayBlocks] of byDay) {
      const sorted = [...dayBlocks].sort((left, right) => left.start.localeCompare(right.start));
      for (let index = 1; index < sorted.length; index += 1) {
        if (sorted[index].start < sorted[index - 1].end) {
          context.addIssue({
            code: 'custom',
            path: [],
            message: `Hay bloques superpuestos en el día ${day}.`,
          });
          break;
        }
      }
    }
  });

const customScheduleSchema = z.object({
  medicoId: z.number().int().positive(),
  bloques: scheduleBlocksSchema,
});

export const agendaGenerationSchema = z
  .object({
    sedeId: z.number().int().positive(),
    medicoIds: z.array(z.number().int().positive()).min(1).max(50),
    fechaInicial: dateOnlySchema,
    fechaFinal: dateOnlySchema,
    duracionMinutos: z.number().int().min(5).max(240).refine((value) => value % 5 === 0, {
      message: 'La duración debe ser múltiplo de 5 minutos.',
    }),
    fechasExcluidas: z.array(dateOnlySchema).max(90).default([]),
    exclusionesPorMedico: z.array(exclusionsByDoctorSchema).max(50).default([]),
    horariosPersonalizados: z.array(customScheduleSchema).max(50).default([]),
  })
  .superRefine((value, context) => {
    if (value.fechaFinal < value.fechaInicial) {
      context.addIssue({
        code: 'custom',
        path: ['fechaFinal'],
        message: 'La fecha final no puede ser anterior a la fecha inicial.',
      });
    }

    if (new Set(value.medicoIds).size !== value.medicoIds.length) {
      context.addIssue({ code: 'custom', path: ['medicoIds'], message: 'No repitas médicos.' });
    }

    const allowedDoctors = new Set(value.medicoIds);
    if (value.exclusionesPorMedico.some((item) => !allowedDoctors.has(item.medicoId))) {
      context.addIssue({
        code: 'custom',
        path: ['exclusionesPorMedico'],
        message: 'Las exclusiones solo pueden pertenecer a médicos seleccionados.',
      });
    }

    if (value.horariosPersonalizados.some((item) => !allowedDoctors.has(item.medicoId))) {
      context.addIssue({
        code: 'custom',
        path: ['horariosPersonalizados'],
        message: 'Los horarios personalizados solo pueden pertenecer a médicos seleccionados.',
      });
    }

    const customDoctorIds = value.horariosPersonalizados.map((item) => item.medicoId);
    if (new Set(customDoctorIds).size !== customDoctorIds.length) {
      context.addIssue({
        code: 'custom',
        path: ['horariosPersonalizados'],
        message: 'No repitas personalizaciones para el mismo médico.',
      });
    }
  });

export const confirmAgendaGenerationSchema = agendaGenerationSchema.and(
  z.object({
    idempotencyKey: z.string().uuid(),
    previewFingerprint: z.string().min(16).max(128).optional(),
  }),
);

export const workScheduleSchema = z
  .object({
    sedeId: z.number().int().positive(),
    medicoId: z.number().int().positive().nullable().optional(),
    nombre: z.string().trim().min(3).max(120),
    zonaHoraria: z.string().trim().min(3).max(80).default('America/Bogota'),
    bloques: scheduleBlocksSchema,
  })
  .superRefine((value, context) => {
    try {
      new Intl.DateTimeFormat('es-CO', { timeZone: value.zonaHoraria }).format();
    } catch {
      context.addIssue({ code: 'custom', path: ['zonaHoraria'], message: 'La zona horaria IANA no es válida.' });
    }

  });

export const cancelSlotsSchema = z
  .object({
    cupoIds: z.array(z.number().int().positive()).max(500).default([]),
    medicoId: z.number().int().positive().optional(),
    desde: z.string().datetime({ offset: true }).optional(),
    hasta: z.string().datetime({ offset: true }).optional(),
    motivo: z.string().trim().max(500).nullable().optional(),
  })
  .refine((value) => value.cupoIds.length > 0 || (value.medicoId && value.desde && value.hasta), {
    message: 'Selecciona cupos o indica médico y rango.',
  });

export function validationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Los datos enviados no son válidos.';
}
