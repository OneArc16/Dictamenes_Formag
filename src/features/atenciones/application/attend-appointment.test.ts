import assert from 'node:assert/strict';
import test from 'node:test';

import { attendBlocker, editBlocker } from './attend-appointment';

const medico = { role: 'MEDICO' as const, empleadoId: 3 };
const activada = { estado: 'ASIGNADA', activadaAt: new Date('2026-11-03T12:00:00.000Z'), medicoId: 3 };

test('el médico asignado puede atender a su paciente activado', () => {
  assert.equal(attendBlocker(activada, medico), null);
});

test('no atiende pacientes sin activar, ya atendidos o con la cita cancelada', () => {
  assert.match(attendBlocker({ ...activada, activadaAt: null }, medico) ?? '', /no ha activado/);
  assert.match(attendBlocker({ ...activada, estado: 'ATENDIDA' }, medico) ?? '', /ya fue atendido/);
  assert.match(attendBlocker({ ...activada, estado: 'CANCELADA' }, medico) ?? '', /ya no está vigente/);
  assert.match(attendBlocker(null, medico) ?? '', /no existe/);
});

test('un médico no atiende pacientes de otro médico; el administrador sí', () => {
  assert.match(attendBlocker({ ...activada, medicoId: 9 }, medico) ?? '', /Solo el médico asignado/);
  assert.equal(attendBlocker({ ...activada, medicoId: 9 }, { role: 'ADMIN', empleadoId: 1 }), null);
});

test('con la atención finalizada, solo el médico que atendió puede editarla', () => {
  const atendida = { ...activada, estado: 'ATENDIDA' };
  assert.equal(editBlocker(atendida, medico), null);
  assert.match(editBlocker({ ...atendida, medicoId: 9 }, medico) ?? '', /Solo el médico que atendió/);
  assert.match(editBlocker({ ...atendida, medicoId: 9 }, { role: 'ADMIN', empleadoId: 1 }) ?? '', /Solo el médico que atendió/);
  // Finalizar de nuevo sigue bloqueado.
  assert.match(attendBlocker(atendida, medico) ?? '', /ya fue atendido/);
});

test('antes de finalizar, editar sigue las mismas reglas que atender', () => {
  assert.equal(editBlocker(activada, medico), null);
  assert.match(editBlocker({ ...activada, activadaAt: null }, medico) ?? '', /no ha activado/);
  assert.match(editBlocker({ ...activada, estado: 'CANCELADA' }, medico) ?? '', /ya no está vigente/);
  assert.match(editBlocker({ ...activada, medicoId: 9 }, medico) ?? '', /Solo el médico asignado/);
});
