import assert from 'node:assert/strict';
import test from 'node:test';

import { agendaGenerationSchema } from './validation';

const validInput = {
  sedeId: 3,
  medicoIds: [12],
  fechaInicial: '2026-07-28',
  fechaFinal: '2026-08-03',
  duracionMinutos: 30,
  duracionesPorMedico: [],
  fechasExcluidas: [],
  fechasHabilitadas: [],
  exclusionesPorMedico: [],
  horariosPersonalizados: [
    {
      medicoId: 12,
      fechas: [
        {
          fecha: '2026-07-31',
          bloques: [
            { horaInicio: '08:00', horaFin: '12:00' },
            { horaInicio: '13:00', horaFin: '17:00' },
          ],
        },
      ],
    },
  ],
};

test('acepta una personalización con bloques válidos para una fecha del periodo', () => {
  assert.equal(agendaGenerationSchema.safeParse(validInput).success, true);
});

test('rechaza fechas personalizadas fuera del periodo', () => {
  const result = agendaGenerationSchema.safeParse({
    ...validInput,
    horariosPersonalizados: [
      {
        medicoId: 12,
        fechas: [
          {
            fecha: '2026-08-04',
            bloques: [{ horaInicio: '08:00', horaFin: '12:00' }],
          },
        ],
      },
    ],
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.error.issues[0]?.message ?? '', /pertenecer al periodo/);
  }
});

test('rechaza fechas habilitadas fuera del periodo', () => {
  const result = agendaGenerationSchema.safeParse({
    ...validInput,
    fechasHabilitadas: ['2026-08-04'],
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.error.issues[0]?.message ?? '', /pertenecer al periodo/);
  }
});

test('rechaza bloques superpuestos dentro de una fecha personalizada', () => {
  const result = agendaGenerationSchema.safeParse({
    ...validInput,
    horariosPersonalizados: [
      {
        medicoId: 12,
        fechas: [
          {
            fecha: '2026-07-31',
            bloques: [
              { horaInicio: '08:00', horaFin: '12:00' },
              { horaInicio: '11:30', horaFin: '14:00' },
            ],
          },
        ],
      },
    ],
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.match(result.error.issues[0]?.message ?? '', /superpuestos/);
  }
});

test('acepta una duración particular válida para un médico seleccionado', () => {
  const result = agendaGenerationSchema.safeParse({
    ...validInput,
    duracionesPorMedico: [{ medicoId: 12, duracionMinutos: 45 }],
  });

  assert.equal(result.success, true);
});

test('rechaza duraciones particulares duplicadas o de médicos no seleccionados', () => {
  const duplicated = agendaGenerationSchema.safeParse({
    ...validInput,
    duracionesPorMedico: [
      { medicoId: 12, duracionMinutos: 45 },
      { medicoId: 12, duracionMinutos: 60 },
    ],
  });
  const unselected = agendaGenerationSchema.safeParse({
    ...validInput,
    duracionesPorMedico: [{ medicoId: 99, duracionMinutos: 45 }],
  });

  assert.equal(duplicated.success, false);
  assert.equal(unselected.success, false);
});
