import assert from 'node:assert/strict';
import test from 'node:test';

import { getDiaSemanaBogota, isValidIsoDate } from './date';
import { buildNumeroDictamen } from './numero-dictamen';
import { canAccessPcl, canEditPcl, getVisibleCaseState } from './policies';
import { calculateSectionProgress, validateFormularioOrigen } from './validation';
import { getReopeningTargets } from './reopening';
import { hasCaseScope } from '@/lib/auth/case-scope';
import {
  descripcionOrigenSchema,
  diagnosticosOrigenSchema,
  informacionFundamentosOrigenSchema,
  registrarCasoDictamenSchema,
} from './schemas';

test('genera el número canónico con fecha y documento normalizado', () => {
  assert.equal(buildNumeroDictamen('2026-07-23', 'CC 12.345.678'), '2307202612345678');
});

test('calcula el día sin desplazamiento UTC', () => {
  assert.equal(getDiaSemanaBogota('2026-07-23'), 'jueves');
  assert.equal(isValidIsoDate('2026-02-29'), false);
});

test('protege PCL para el flujo nuevo y conserva LEGACY', () => {
  assert.equal(canAccessPcl({ flujoVersion: 'LEGACY' }), true);
  assert.equal(
    canAccessPcl({
      flujoVersion: 'ORIGEN_PREVIO',
      formularioOrigenEstado: 'BORRADOR',
    }),
    false,
  );
  assert.equal(
    canAccessPcl({
      flujoVersion: 'ORIGEN_PREVIO',
      formularioOrigenEstado: 'BORRADOR',
      pclIniciado: true,
    }),
    true,
  );
  assert.equal(
    canEditPcl(
      {
        flujoVersion: 'ORIGEN_PREVIO',
        formularioOrigenEstado: 'FINALIZADO',
        pclCerrado: false,
      },
      { hasEditPermission: true, isAssigned: true },
    ),
    true,
  );
});

test('acepta elegir PCL u Origen como documento inicial', () => {
  const documentoInicialSchema = registrarCasoDictamenSchema.shape.documentoInicial;

  assert.equal(documentoInicialSchema.parse('PCL'), 'PCL');
  assert.equal(documentoInicialSchema.parse('ORIGEN'), 'ORIGEN');
  assert.equal(documentoInicialSchema.parse(undefined), 'ORIGEN');
});

test('acepta y limita la actividad extralaboral opcional', () => {
  const parsed = descripcionOrigenSchema.parse({
    descripcion: 'Descripción del cargo.',
    actividadExtralaboral: 'Entrenamiento deportivo',
    expectedVersion: 1,
  });

  assert.equal(parsed.actividadExtralaboral, 'Entrenamiento deportivo');
  assert.equal(
    descripcionOrigenSchema.parse({
      descripcion: 'Descripción del cargo.',
      expectedVersion: 1,
    }).actividadExtralaboral,
    '',
  );
  assert.throws(() =>
    descripcionOrigenSchema.parse({
      descripcion: 'Descripción del cargo.',
      actividadExtralaboral: 'a'.repeat(1001),
      expectedVersion: 1,
    }),
  );
});

test('deriva etapa y estado sin persistirlos por duplicado', () => {
  assert.deepEqual(
    getVisibleCaseState({
      flujoVersion: 'ORIGEN_PREVIO',
      formularioOrigenEstado: 'FINALIZADO',
      pclIniciado: false,
    }),
    { etapa: 'DICTAMEN_PCL', estado: 'HABILITADO' },
  );
  assert.deepEqual(
    getVisibleCaseState({
      flujoVersion: 'ORIGEN_PREVIO',
      formularioOrigenEstado: 'BORRADOR',
      pclIniciado: true,
      pclCerrado: false,
    }),
    { etapa: 'DICTAMEN_PCL', estado: 'PENDIENTE' },
  );
  assert.deepEqual(
    getVisibleCaseState({
      flujoVersion: 'ORIGEN_PREVIO',
      formularioOrigenEstado: 'BORRADOR',
      pclIniciado: true,
      pclCerrado: true,
    }),
    { etapa: 'FORMULARIO_ORIGEN', estado: 'BORRADOR' },
  );
});

test('valida campos condicionales de accidente y soportes explícitos', () => {
  const issues = validateFormularioOrigen({
    fechaDictamenOrigen: '2026-07-23',
    descripcion: '',
    fechaOcurrencia: null,
    horaOcurrencia: null,
    jornadaEvento: null,
    concepto: '',
    fundamentosDerecho: '',
    tipoEvento: 'ACCIDENTE',
    origenEvento: null,
    historialLaboral: [],
    soportes: [],
    diagnosticos: [],
  });

  assert.ok(issues.some((issue) => issue.field === 'fechaOcurrencia'));
  assert.ok(issues.some((issue) => issue.field === 'soportes.REPORTE_ACCIDENTE_TRABAJO'));
  assert.equal(calculateSectionProgress(issues).completed, 0);
});

test('acepta un formulario completo y diferencia N.A. de no aportado', () => {
  const fixedTypes = [
    'REPORTE_ACCIDENTE_TRABAJO',
    'DESCRIPCION_EVENTO',
    'EPICRISIS_RESUMEN_HISTORIA',
    'CERTIFICADO_DEFUNCION',
    'ANALISIS_PUESTO_TRABAJO',
    'EXAMENES_PREOCUPACIONALES',
    'INVESTIGACION_ACCIDENTE',
  ] as const;
  const issues = validateFormularioOrigen({
    fechaDictamenOrigen: '2026-07-23',
    descripcion: 'Descripción clínica suficiente.',
    fechaOcurrencia: null,
    horaOcurrencia: null,
    jornadaEvento: null,
    concepto: 'Concepto médico.',
    fundamentosDerecho: 'Fundamentos aplicables.',
    tipoEvento: 'ENFERMEDAD',
    origenEvento: 'COMUN',
    historialLaboral: [
      {
        institucionNombreSnapshot: 'Institución histórica',
        cargoNombreSnapshot: 'Docente',
        riesgosLaborales: 'Riesgos biomecánicos',
        jornadaLaboral: '8 horas',
        tiempoExposicionAnios: 4.5,
      },
    ],
    soportes: fixedTypes.map((tipo, index) => ({
      tipo,
      estado: index === 0 ? 'NO_APLICA' : 'NO_APORTADO',
      fechaDocumento: null,
      seTuvoEnCuenta: null,
      nombreOtro: null,
    })),
    diagnosticos: [{ cie10Codigo: 'M54.5', esPrincipal: true }],
  });

  assert.deepEqual(issues, []);
  assert.deepEqual(calculateSectionProgress(issues), {
    completed: 5,
    total: 5,
    incomplete: [],
  });
});

test('rechaza fechas inexistentes, horas inválidas y filas duplicadas', () => {
  assert.equal(isValidIsoDate('2026-02-30'), false);
  assert.equal(
    informacionFundamentosOrigenSchema.safeParse({
      fechaOcurrencia: '2026-02-30',
      horaOcurrencia: '25:61',
      jornadaEvento: 'NORMAL',
      soportes: [
        {
          tipo: 'DESCRIPCION_EVENTO',
          estado: 'NO_APORTADO',
          fechaDocumento: null,
          seTuvoEnCuenta: null,
          nombreOtro: null,
        },
        {
          tipo: 'DESCRIPCION_EVENTO',
          estado: 'NO_APORTADO',
          fechaDocumento: null,
          seTuvoEnCuenta: null,
          nombreOtro: null,
        },
      ],
      expectedVersion: 1,
    }).success,
    false,
  );
  assert.equal(
    diagnosticosOrigenSchema.safeParse({
      diagnosticos: [
        {
          cie10Codigo: 'M54.5',
          tipo: 'CONFIRMADO_NUEVO',
          esPrincipal: true,
        },
        {
          cie10Codigo: 'm54.5',
          tipo: 'IMPRESION_DIAGNOSTICA',
          esPrincipal: false,
        },
      ],
      tratamiento: null,
      expectedVersion: 1,
    }).success,
    false,
  );
});

test('calcula reapertura sin ofrecer PCL mientras Origen está abierto', () => {
  assert.deepEqual(
    getReopeningTargets({
      flujoVersion: 'ORIGEN_PREVIO',
      originState: 'REABIERTO',
      pclClosed: true,
      canReopenOrigin: true,
      canReopenPcl: true,
    }),
    [],
  );
  assert.deepEqual(
    getReopeningTargets({
      flujoVersion: 'ORIGEN_PREVIO',
      originState: 'FINALIZADO',
      pclClosed: true,
      canReopenOrigin: true,
      canReopenPcl: true,
    }),
    ['ORIGEN', 'PCL'],
  );
});

test('resuelve alcance por asignación o permiso transversal, no por nombre de rol', () => {
  assert.equal(
    hasCaseScope({ empleadoId: 7, permissions: ['formulario_origen.read'] }, 7),
    true,
  );
  assert.equal(
    hasCaseScope(
      { empleadoId: 8, permissions: ['module.admisiones.access'] },
      7,
    ),
    true,
  );
  assert.equal(
    hasCaseScope({ empleadoId: 8, permissions: ['formulario_origen.read'] }, 7),
    false,
  );
});
