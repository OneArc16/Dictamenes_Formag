import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getCurrentModule,
  getModuleByKey,
  getModuleEntryPath,
  getVisibleModules,
  getVisibleSecondaryNavigation,
} from './module-navigation';

test('los roles no conceden módulos sin permisos explícitos', () => {
  assert.deepEqual(getVisibleModules({ permissions: [] }), []);
});

test('muestra únicamente módulos con permiso vigente', () => {
  const modules = getVisibleModules({
    permissions: [
      'module.medico.access',
      'module.recomendaciones.access',
    ],
  });

  assert.deepEqual(
    modules.map((moduleItem) => moduleItem.key),
    ['medico', 'recomendaciones'],
  );
});

test('resuelve el módulo activo para rutas profundas', () => {
  assert.equal(getCurrentModule('/medico/dictamen/42')?.key, 'medico');
  assert.equal(getCurrentModule('/admin/perfiles/7/permisos')?.key, 'admin');
  assert.equal(getCurrentModule('/inicio'), null);
});

test('filtra la navegación secundaria con el mismo conjunto de permisos', () => {
  const admin = getModuleByKey('admin');
  assert.ok(admin);

  const navigation = getVisibleSecondaryNavigation(admin, {
    permissions: ['admin.empleados.read', 'admin.auditoria.read'],
  });

  assert.deepEqual(
    navigation.map((item) => item.key),
    ['employees', 'audit'],
  );
});

test('usa el primer acceso secundario autorizado si no puede abrir el dashboard', () => {
  const admin = getModuleByKey('admin');
  assert.ok(admin);

  assert.equal(
    getModuleEntryPath(admin, { permissions: ['admin.perfiles.read'] }),
    '/admin/perfiles',
  );
});

test('mantiene la ruta canónica cuando el landing está autorizado', () => {
  const admin = getModuleByKey('admin');
  assert.ok(admin);

  assert.equal(
    getModuleEntryPath(admin, { permissions: ['admin.dashboard.read'] }),
    '/admin',
  );
});

test('Agenda Médica usa permisos explícitos para módulo y accesos secundarios', () => {
  const agenda = getModuleByKey('agenda');
  assert.ok(agenda);

  assert.deepEqual(
    getVisibleModules({ permissions: ['module.agenda.access'] }).map((item) => item.key),
    ['agenda'],
  );
  assert.deepEqual(
    getVisibleSecondaryNavigation(agenda, {
      permissions: ['agenda.read', 'agenda.schedule.manage'],
    }).map((item) => item.key),
    ['agenda-list', 'agenda-schedule'],
  );
  assert.equal(
    getModuleEntryPath(agenda, { permissions: ['agenda.create'] }),
    '/agenda/crear',
  );
  assert.deepEqual(
    getVisibleSecondaryNavigation(agenda, { permissions: ['agenda.read.own'] }).map((item) => item.key),
    ['agenda-list'],
  );
});
