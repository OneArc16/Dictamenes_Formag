import assert from 'node:assert/strict';
import test from 'node:test';

import type { AgendaCreationContext } from '@/features/agenda/application/agenda-creation-context';
import type { AgendaPreview } from '@/features/agenda/domain/types';
import { buildAgendaCreationPayload } from './agenda-creation-payload';
import {
  agendaCreationReducer,
  createInitialAgendaCreationState,
} from './agenda-creation-reducer';
import type { AgendaDoctorOption } from './agenda-creation-types';
import { validateAgendaCreationPayload } from './agenda-creation-validation';

const context: Extract<AgendaCreationContext, { status: 'ready' }> = {
  status: 'ready',
  site: { id: 3, name: 'Sede Norte' },
  timeZone: 'America/Bogota',
  today: '2026-07-28',
  defaultEndDate: '2026-08-03',
  limits: {
    maxDoctors: 50,
    maxRangeDays: 90,
    minDurationMinutes: 5,
    maxDurationMinutes: 240,
    durationStepMinutes: 5,
  },
};

const doctor: AgendaDoctorOption = {
  id: 12,
  nombre: 'Ana Médica',
  documento: '123',
  especialidadPrincipal: 'Medicina laboral',
  tieneHorarioParticular: false,
};

const preview: AgendaPreview = {
  fingerprint: 'fingerprint-1234567890',
  sedeId: 3,
  sedeNombre: 'Sede Norte',
  fechaInicial: '2026-07-28',
  fechaFinal: '2026-08-03',
  duracionMinutos: 30,
  zonaHoraria: 'America/Bogota',
  totalMedicos: 1,
  totalCandidatos: 10,
  totalNuevos: 10,
  totalOmitidos: 0,
  totalConflictos: 0,
  fechasLaboralesEvaluadas: ['2026-07-28'],
  bloqueado: false,
  errores: [],
  medicos: [],
};

test('agrega médicos sin duplicarlos', () => {
  const initial = createInitialAgendaCreationState(context);
  const added = agendaCreationReducer(initial, {
    type: 'doctorAdded',
    doctor,
    maximum: context.limits.maxDoctors,
  });
  const repeated = agendaCreationReducer(added, {
    type: 'doctorAdded',
    doctor,
    maximum: context.limits.maxDoctors,
  });

  assert.equal(added.selectedDoctors.length, 1);
  assert.equal(repeated, added);
  assert.equal(added.revision, 1);
});

test('agrega médicos activos en lote sin duplicar y respeta el máximo', () => {
  const initial = createInitialAgendaCreationState(context);
  const doctors = [
    doctor,
    { ...doctor, id: 13, nombre: 'Beatriz Médica' },
    { ...doctor, id: 14, nombre: 'Carlos Médico' },
    { ...doctor, id: 13, nombre: 'Beatriz duplicada' },
  ];
  const state = agendaCreationReducer(initial, {
    type: 'doctorsAdded',
    doctors,
    maximum: 2,
  });

  assert.deepEqual(
    state.selectedDoctors.map((item) => item.id),
    [12, 13],
  );
  assert.equal(state.revision, 1);
  assert.match(state.announcement, /2 médicos activos/);
  assert.match(state.announcement, /límite de 2/);
});

test('informa cuando la sede no tiene médicos activos disponibles', () => {
  const initial = createInitialAgendaCreationState(context);
  const state = agendaCreationReducer(initial, {
    type: 'doctorsAdded',
    doctors: [],
    maximum: context.limits.maxDoctors,
  });

  assert.equal(state.revision, 0);
  assert.match(state.announcement, /No hay médicos activos/);
});

test('quitar un médico elimina también sus exclusiones particulares', () => {
  let state = createInitialAgendaCreationState(context);
  state = agendaCreationReducer(state, {
    type: 'doctorAdded',
    doctor,
    maximum: context.limits.maxDoctors,
  });
  state = agendaCreationReducer(state, {
    type: 'doctorDateToggled',
    doctorId: doctor.id,
    date: '2026-07-30',
    excluded: true,
  });
  state = agendaCreationReducer(state, {
    type: 'doctorScheduleOverrideChanged',
    doctorId: doctor.id,
    blocks: [{ diaSemana: 1, horaInicio: '08:00', horaFin: '12:00' }],
  });
  state = agendaCreationReducer(state, { type: 'doctorRemoved', doctorId: doctor.id });

  assert.deepEqual(state.selectedDoctors, []);
  assert.deepEqual(state.doctorExclusions, {});
  assert.deepEqual(state.doctorScheduleOverrides, {});
  assert.match(state.announcement, /retirado/);
});

test('cambiar el rango elimina exclusiones que queden fuera', () => {
  let state = createInitialAgendaCreationState(context);
  state = agendaCreationReducer(state, {
    type: 'doctorAdded',
    doctor,
    maximum: context.limits.maxDoctors,
  });
  state = agendaCreationReducer(state, {
    type: 'globalDateToggled',
    date: '2026-08-03',
    excluded: true,
  });
  state = agendaCreationReducer(state, {
    type: 'doctorDateToggled',
    doctorId: doctor.id,
    date: '2026-08-02',
    excluded: true,
  });
  state = agendaCreationReducer(state, {
    type: 'rangeChanged',
    startDate: '2026-07-28',
    endDate: '2026-07-31',
  });

  assert.deepEqual(state.excludedDates, []);
  assert.deepEqual(state.doctorExclusions, {});
});

test('cualquier cambio posterior a un preview lo marca como desactualizado', () => {
  let state = createInitialAgendaCreationState(context);
  state = agendaCreationReducer(state, {
    type: 'doctorAdded',
    doctor,
    maximum: context.limits.maxDoctors,
  });
  state = agendaCreationReducer(state, {
    type: 'previewSucceeded',
    revision: state.revision,
    preview,
    idempotencyKey: '2ab20f98-e32e-4f08-b099-6832aefd4b95',
  });
  state = agendaCreationReducer(state, { type: 'durationChanged', durationMinutes: 45 });

  assert.equal(state.process.status, 'stale');
  assert.equal(state.revision, 2);
});

test('ignora una respuesta de preview perteneciente a una revisión anterior', () => {
  let state = createInitialAgendaCreationState(context);
  state = agendaCreationReducer(state, { type: 'previewStarted', revision: 0 });
  state = agendaCreationReducer(state, { type: 'durationChanged', durationMinutes: 45 });
  state = agendaCreationReducer(state, {
    type: 'previewSucceeded',
    revision: 0,
    preview,
    idempotencyKey: '2ab20f98-e32e-4f08-b099-6832aefd4b95',
  });

  assert.equal(state.process.status, 'idle');
  assert.equal(state.durationMinutes, 45);
});

test('el constructor de payload normaliza y descarta exclusiones inválidas', () => {
  const state = {
    ...createInitialAgendaCreationState(context),
    selectedDoctors: [doctor],
    excludedDates: ['2026-07-30', '2026-07-30', '2026-09-01'],
    doctorExclusions: {
      12: ['2026-07-31', '2026-07-31'],
      99: ['2026-07-31'],
    },
  };

  assert.deepEqual(buildAgendaCreationPayload(context.site.id, state), {
    sedeId: 3,
    medicoIds: [12],
    fechaInicial: '2026-07-28',
    fechaFinal: '2026-08-03',
    duracionMinutos: 30,
    fechasExcluidas: ['2026-07-30'],
    exclusionesPorMedico: [{ medicoId: 12, fechas: ['2026-07-31'] }],
    horariosPersonalizados: [],
  });
});

test('personaliza y restablece el horario de un médico sin alterar otros datos', () => {
  let state = createInitialAgendaCreationState(context);
  state = agendaCreationReducer(state, {
    type: 'doctorAdded',
    doctor,
    maximum: context.limits.maxDoctors,
  });
  state = agendaCreationReducer(state, {
    type: 'doctorScheduleOverrideChanged',
    doctorId: doctor.id,
    blocks: [{ diaSemana: 1, horaInicio: '09:00', horaFin: '12:00' }],
  });

  assert.deepEqual(state.doctorScheduleOverrides[doctor.id], [
    { diaSemana: 1, horaInicio: '09:00', horaFin: '12:00' },
  ]);
  assert.deepEqual(buildAgendaCreationPayload(context.site.id, state).horariosPersonalizados, [
    {
      medicoId: doctor.id,
      bloques: [{ diaSemana: 1, horaInicio: '09:00', horaFin: '12:00' }],
    },
  ]);

  state = agendaCreationReducer(state, {
    type: 'doctorScheduleOverrideChanged',
    doctorId: doctor.id,
  });
  assert.equal(state.doctorScheduleOverrides[doctor.id], undefined);
});

test('la validación de presentación rechaza fechas pasadas', () => {
  const state = {
    ...createInitialAgendaCreationState(context),
    selectedDoctors: [doctor],
    startDate: '2026-07-27',
    endDate: '2026-07-30',
  };
  const result = validateAgendaCreationPayload(
    buildAgendaCreationPayload(context.site.id, state),
    context,
  );

  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.match(result.fieldErrors.startDate ?? '', /hoy o una fecha futura/);
  }
});

test('la validación rechaza bloques personalizados superpuestos', () => {
  const state = {
    ...createInitialAgendaCreationState(context),
    selectedDoctors: [doctor],
    doctorScheduleOverrides: {
      [doctor.id]: [
        { diaSemana: 1, horaInicio: '08:00', horaFin: '12:00' },
        { diaSemana: 1, horaInicio: '11:00', horaFin: '13:00' },
      ],
    },
  };
  const result = validateAgendaCreationPayload(
    buildAgendaCreationPayload(context.site.id, state),
    context,
  );

  assert.equal(result.valid, false);
  if (!result.valid) {
    assert.match(result.fieldErrors.schedules ?? '', /superpuestos/);
  }
});
