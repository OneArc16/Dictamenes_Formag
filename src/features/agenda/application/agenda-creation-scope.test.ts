import assert from 'node:assert/strict';
import test from 'node:test';

import { assertAgendaCreationScope } from './agenda-creation-scope';
import { AgendaApplicationError } from './errors';

function databaseWithEmployee(
  employee:
    | {
        idSede: number | null;
        sede: { id: number; nombre: string; estado: number } | null;
      }
    | null,
) {
  return {
    empleado: {
      findFirst: async () => employee,
    },
  } as never;
}

test('permite crear únicamente en la sede activa del empleado', async () => {
  const context = await assertAgendaCreationScope(
    7,
    3,
    databaseWithEmployee({
      idSede: 3,
      sede: { id: 3, nombre: 'Sede Norte', estado: 1 },
    }),
  );

  assert.equal(context.status, 'ready');
  assert.equal(context.site.id, 3);
});

test('rechaza un sedeId diferente aunque el usuario tenga sede activa', async () => {
  await assert.rejects(
    assertAgendaCreationScope(
      7,
      9,
      databaseWithEmployee({
        idSede: 3,
        sede: { id: 3, nombre: 'Sede Norte', estado: 1 },
      }),
    ),
    (error: unknown) =>
      error instanceof AgendaApplicationError &&
      error.status === 403 &&
      error.message.includes('sede diferente'),
  );
});

test('bloquea la creación cuando el empleado no tiene sede', async () => {
  await assert.rejects(
    assertAgendaCreationScope(
      7,
      3,
      databaseWithEmployee({
        idSede: null,
        sede: null,
      }),
    ),
    (error: unknown) =>
      error instanceof AgendaApplicationError &&
      error.status === 409 &&
      error.message.includes('No tienes una sede asignada'),
  );
});
