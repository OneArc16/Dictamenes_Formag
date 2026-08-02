import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MODULE_DEFINITIONS,
  getCurrentModule,
  getModuleByKey,
  getModuleEntryPath,
  getVisibleModules,
  getVisibleSecondaryNavigation,
  isModuleNavigationActive,
  isSecondaryNavigationActive,
} from './module-navigation';
import { hasProtectedAreaAbility } from './auth/ability-utils';

test('los roles no conceden módulos sin permisos explícitos', () => {
  assert.deepEqual(getVisibleModules({ permissions: [] }), []);
});

test('agrupa Dictámenes y Recomendaciones en un único módulo visible', () => {
  const modules = getVisibleModules({
    permissions: [
      'module.medico.access',
      'module.recomendaciones.access',
    ],
  });

  assert.deepEqual(
    modules.map((moduleItem) => moduleItem.key),
    ['medicina-laboral'],
  );
});

test('muestra Medicina Laboral con cualquiera de sus permisos hijos', () => {
  assert.deepEqual(
    getVisibleModules({ permissions: ['module.medico.access'] }).map(
      (moduleItem) => moduleItem.key,
    ),
    ['medicina-laboral'],
  );
  assert.deepEqual(
    getVisibleModules({
      permissions: ['module.recomendaciones.access'],
    }).map((moduleItem) => moduleItem.key),
    ['medicina-laboral'],
  );
});

test('filtra los submódulos de Medicina Laboral por permiso', () => {
  const medicinaLaboral = getModuleByKey('medicina-laboral');
  assert.ok(medicinaLaboral);

  assert.deepEqual(
    getVisibleSecondaryNavigation(medicinaLaboral, {
      permissions: ['module.medico.access'],
    }).map((item) => item.key),
    ['dictamenes'],
  );
  assert.deepEqual(
    getVisibleSecondaryNavigation(medicinaLaboral, {
      permissions: ['module.recomendaciones.access'],
    }).map((item) => item.key),
    ['recomendaciones'],
  );
  assert.deepEqual(
    getVisibleSecondaryNavigation(medicinaLaboral, {
      permissions: [
        'module.medico.access',
        'module.recomendaciones.access',
      ],
    }).map((item) => item.key),
    ['dictamenes', 'recomendaciones'],
  );
});

test('elige el primer submódulo autorizado como entrada de Medicina Laboral', () => {
  const medicinaLaboral = getModuleByKey('medicina-laboral');
  assert.ok(medicinaLaboral);

  assert.equal(
    getModuleEntryPath(medicinaLaboral, {
      permissions: [
        'module.medico.access',
        'module.recomendaciones.access',
      ],
    }),
    '/medico',
  );
  assert.equal(
    getModuleEntryPath(medicinaLaboral, {
      permissions: ['module.recomendaciones.access'],
    }),
    '/recomendaciones',
  );
});

test('resuelve Medicina Laboral como módulo activo en sus rutas profundas', () => {
  assert.equal(
    getCurrentModule('/medico/dictamen/42')?.key,
    'medicina-laboral',
  );
  assert.equal(
    getCurrentModule('/recomendaciones/42')?.key,
    'medicina-laboral',
  );
  assert.equal(
    getCurrentModule('/medicina-laboral')?.key,
    'medicina-laboral',
  );
  assert.equal(getCurrentModule('/admin/perfiles/7/permisos')?.key, 'admin');
  assert.equal(getCurrentModule('/inicio'), null);
});

test('compara rutas por segmentos completos', () => {
  const medicinaLaboral = getModuleByKey('medicina-laboral');
  assert.ok(medicinaLaboral);

  assert.equal(
    isModuleNavigationActive('/medico-legado', medicinaLaboral),
    false,
  );
  assert.equal(getCurrentModule('/recomendaciones-archivo'), null);
});

test('el catálogo no declara prefijos de ruta duplicados', () => {
  const prefixes = MODULE_DEFINITIONS.flatMap((moduleItem) => [
    ...moduleItem.routePrefixes,
  ]);
  assert.equal(new Set(prefixes).size, prefixes.length);

  for (const [index, prefix] of prefixes.entries()) {
    for (const otherPrefix of prefixes.slice(index + 1)) {
      assert.equal(
        prefix.startsWith(`${otherPrefix}/`) ||
          otherPrefix.startsWith(`${prefix}/`),
        false,
        `Los prefijos ${prefix} y ${otherPrefix} se solapan`,
      );
    }
  }
});

test('marca únicamente el submódulo activo de Medicina Laboral', () => {
  const medicinaLaboral = getModuleByKey('medicina-laboral');
  assert.ok(medicinaLaboral);

  const dictamenes = medicinaLaboral.secondaryNavigation.find(
    (item) => item.key === 'dictamenes',
  );
  const recomendaciones = medicinaLaboral.secondaryNavigation.find(
    (item) => item.key === 'recomendaciones',
  );
  assert.ok(dictamenes);
  assert.ok(recomendaciones);

  assert.equal(
    isSecondaryNavigationActive(
      '/medico/dictamen/42',
      dictamenes,
      medicinaLaboral,
    ),
    true,
  );
  assert.equal(
    isSecondaryNavigationActive(
      '/medico/dictamen/42',
      recomendaciones,
      medicinaLaboral,
    ),
    false,
  );
  assert.equal(
    isSecondaryNavigationActive(
      '/recomendaciones/42',
      recomendaciones,
      medicinaLaboral,
    ),
    true,
  );
});

test('la autorización de áreas protegidas permanece independiente', () => {
  const permissions = ['module.recomendaciones.access'];

  assert.equal(
    hasProtectedAreaAbility(permissions, 'recomendaciones'),
    true,
  );
  assert.equal(hasProtectedAreaAbility(permissions, 'medico'), false);
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

test('Admisiones expone Dictamen y Recepción como submódulos independientes', () => {
  const admisiones = getModuleByKey('admisiones');
  assert.ok(admisiones);

  assert.deepEqual(
    getVisibleSecondaryNavigation(admisiones, {
      permissions: ['dictamen.read', 'reception.read'],
    }).map((item) => item.key),
    ['admission-dictamen', 'patient-reception'],
  );
  assert.deepEqual(
    getVisibleSecondaryNavigation(admisiones, {
      permissions: ['reception.read'],
    }).map((item) => item.key),
    ['patient-reception'],
  );
});

test('Admisiones entra a Dictamen por defecto y respeta el acceso solo a Recepción', () => {
  const admisiones = getModuleByKey('admisiones');
  assert.ok(admisiones);

  assert.equal(
    getModuleEntryPath(admisiones, {
      permissions: ['dictamen.read', 'reception.read'],
    }),
    '/admisiones/dictamenes',
  );
  assert.equal(
    getModuleEntryPath(admisiones, {
      permissions: ['reception.read'],
    }),
    '/admisiones/recepcion-pacientes',
  );
});

test('marca el submódulo activo correcto dentro de Admisiones', () => {
  const admisiones = getModuleByKey('admisiones');
  assert.ok(admisiones);

  const dictamen = admisiones.secondaryNavigation.find(
    (item) => item.key === 'admission-dictamen',
  );
  const recepcion = admisiones.secondaryNavigation.find(
    (item) => item.key === 'patient-reception',
  );
  assert.ok(dictamen);
  assert.ok(recepcion);

  assert.equal(
    isSecondaryNavigationActive(
      '/admisiones/dictamenes/42',
      dictamen,
      admisiones,
    ),
    true,
  );
  assert.equal(
    isSecondaryNavigationActive(
      '/admisiones/dictamenes/42',
      recepcion,
      admisiones,
    ),
    false,
  );
  assert.equal(
    isSecondaryNavigationActive(
      '/admisiones/recepcion-pacientes',
      recepcion,
      admisiones,
    ),
    true,
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

test('solo marca Agendas creadas dentro de su propia ruta', () => {
  const agenda = getModuleByKey('agenda');
  assert.ok(agenda);

  const agendasCreadas = agenda.secondaryNavigation.find(
    (item) => item.key === 'agenda-list',
  );
  const crearAgenda = agenda.secondaryNavigation.find(
    (item) => item.key === 'agenda-create',
  );
  const horarioLaboral = agenda.secondaryNavigation.find(
    (item) => item.key === 'agenda-schedule',
  );
  assert.ok(agendasCreadas);
  assert.ok(crearAgenda);
  assert.ok(horarioLaboral);

  assert.equal(
    isSecondaryNavigationActive('/agenda', agendasCreadas, agenda),
    true,
  );
  assert.equal(
    isSecondaryNavigationActive('/agenda/crear', agendasCreadas, agenda),
    false,
  );
  assert.equal(
    isSecondaryNavigationActive('/agenda/horarios', agendasCreadas, agenda),
    false,
  );
  assert.equal(
    isSecondaryNavigationActive('/agenda/crear', crearAgenda, agenda),
    true,
  );
  assert.equal(
    isSecondaryNavigationActive('/agenda/horarios', horarioLaboral, agenda),
    true,
  );
});
