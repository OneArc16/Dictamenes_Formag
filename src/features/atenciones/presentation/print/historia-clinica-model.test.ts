import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { AtencionDetalle } from '@/features/atenciones/application/atencion-detail';
import { DEFAULT_ANTECEDENTES_FAMILIARES } from '@/features/atenciones/domain/antecedentes-familiares';
import { DEFAULT_ANTECEDENTES_PERSONALES } from '@/features/atenciones/domain/antecedentes-personales';
import { EXAMEN_CATALOG } from '@/features/atenciones/domain/examen-fisico';
import { REVISION_CATALOG } from '@/features/atenciones/domain/revision-sistemas';

import { buildHistoriaClinica, type HistoriaClinicaExtras } from './historia-clinica-model';

const doc = <T,>(datos: T) => ({ datos, version: 0, actualizadoEn: null, actualizadoPor: null });

function detalle(overrides: Partial<AtencionDetalle> = {}): AtencionDetalle {
  return {
    id: 46563,
    estado: 'ATENDIDA',
    inicioProgramado: '2026-10-30T12:03:00.000Z',
    finProgramado: '2026-10-30T12:23:00.000Z',
    activadaAt: null,
    sedeNombre: 'Santa Marta',
    especialidadNombre: 'Medicina general',
    modalidadNombre: 'Presencial',
    medicoNombre: 'Ana Pérez',
    docente: {
      nombreCompleto: 'Erner Escorcia Chacón',
      tipoDocumento: 'CC',
      documento: '77177751',
      edad: 53,
      telefono: '3172627821',
      eps: 'Coosalud',
      cargo: 'Docente de aula',
      secretaria: null,
      institucion: null,
    },
    anteriores: [],
    form: {
      motivoConsulta: 'Control de presión',
      enfermedadActual: 'Paciente asintomático',
      analisis: '',
      plan: 'Perfil lipídico',
      tratamiento: '',
    },
    antecedentesPersonales: doc(DEFAULT_ANTECEDENTES_PERSONALES),
    antecedentesFamiliares: doc(DEFAULT_ANTECEDENTES_FAMILIARES),
    antecedentesGinecobstetricos: null,
    revisionSistemas: { datos: REVISION_CATALOG.defaults, origen: 'propia', heredadaDe: null },
    examenFisico: { datos: EXAMEN_CATALOG.defaults, origen: 'propia', heredadaDe: null },
    diagnosticos: [],
    remisiones: [],
    remisionesHistorial: [],
    remisionAtajos: [],
    evoluciones: [],
    evolucionesHistorial: [],
    incapacidades: [],
    incapacidadesHistorial: [],
    incapacidadDiasAcumulados: 0,
    mujer: false,
    signosVitales: { values: {}, tomadoEn: null, tomadoPor: null },
    signosHistorial: [],
    antecedentesDeEstaAtencion: true,
    canAttend: false,
    canEdit: false,
    ...overrides,
  } as AtencionDetalle;
}

const extras: HistoriaClinicaExtras = {
  institucion: {
    nombre: 'Servicios Integrales de Salud del Magdalena',
    nit: '900 018 045 - 5',
    codigoHabilitacion: '470010062801',
    direccion: 'Cra 19 # 26B-53',
    telefono: '3205184998',
    ciudad: 'Santa Marta',
  },
  paciente: {
    fechaNacimiento: '1973-10-10',
    sexo: 'H',
    estadoCivil: 'SOLTERO(A)',
    direccion: 'Kra 21C #4C-18',
    etnia: null,
    zonaResidencia: 'U',
  },
  profesional: {
    nombre: 'Ana Pérez Gómez',
    tipoDocumento: 'CC',
    documento: '1004425222',
    registroMedico: '142759',
    firmaSrc: null,
  },
  atendidaEn: '2026-10-30T12:20:00.000Z',
  generadoEn: '2026-11-02T15:00:00.000Z',
};

test('identifica al paciente con etiquetas legibles y la fecha de la atención en hora de Colombia', () => {
  const hc = buildHistoriaClinica(detalle(), extras);
  assert.equal(hc.paciente.sexo, 'Masculino');
  assert.equal(hc.paciente.estadoCivil, 'Soltero(a)');
  assert.equal(hc.paciente.fechaNacimiento, '10/10/1973');
  assert.equal(hc.paciente.documento, 'CC 77177751');
  assert.equal(hc.atencion.fecha, '30/10/2026');
  assert.equal(hc.atencion.hora, '07:03');
  assert.equal(hc.atencion.cierre, '30/10/2026 07:20');
});

test('el primer diagnóstico es el principal y separa el código CIE-10 del nombre', () => {
  const hc = buildHistoriaClinica(
    detalle({
      diagnosticos: [
        { cie10Codigo: 'I10X', cie10Label: 'I10X - HIPERTENSION ESENCIAL (PRIMARIA)', tipo: 'CONFIRMADO_REPETIDO' },
        { cie10Codigo: 'E780', cie10Label: 'E780 - HIPERCOLESTEROLEMIA PURA', tipo: 'IMPRESION_DIAGNOSTICA' },
      ],
    }),
    extras,
  );
  assert.deepEqual(hc.diagnosticos, [
    { orden: 'Principal', codigo: 'I10X', nombre: 'HIPERTENSION ESENCIAL (PRIMARIA)', tipo: 'Confirmado repetido' },
    { orden: 'Relacionado 1', codigo: 'E780', nombre: 'HIPERCOLESTEROLEMIA PURA', tipo: 'Impresión diagnóstica' },
  ]);
});

test('lista los antecedentes que refiere con su detalle y resume los negados', () => {
  const personales = {
    ...DEFAULT_ANTECEDENTES_PERSONALES,
    items: { ...DEFAULT_ANTECEDENTES_PERSONALES.items, hipertension: 'SI' },
    detalles: { ...DEFAULT_ANTECEDENTES_PERSONALES.detalles, hipertension: 'Losartán 100 mg' },
  };
  const hc = buildHistoriaClinica(detalle({ antecedentesPersonales: doc(personales) }), extras);
  const patologicos = hc.antecedentes.personales.find((grupo) => grupo.titulo === 'Patológicos');
  assert.deepEqual(patologicos?.items, [{ label: 'Hipertensión', valor: 'SI — Losartán 100 mg' }]);
  assert.ok(hc.antecedentes.negados.includes('Diabetes'));
  assert.ok(!hc.antecedentes.negados.includes('Hipertensión'));
});

test('revisión y examen omiten los campos vacíos y marcan los hallazgos distintos del normal', () => {
  const [primero, segundo] = REVISION_CATALOG.visibles(false);
  const hc = buildHistoriaClinica(
    detalle({
      revisionSistemas: {
        datos: { ...REVISION_CATALOG.defaults, sistemas: { ...REVISION_CATALOG.defaults.sistemas, [primero.key]: 'Cefalea ocasional', [segundo.key]: '' } },
        origen: 'propia',
        heredadaDe: null,
      },
    }),
    extras,
  );
  assert.deepEqual(hc.revisionSistemas[0], { label: primero.label, valor: 'Cefalea ocasional', alterado: true });
  assert.ok(!hc.revisionSistemas.some((item) => item.label === segundo.label));
  // Tras omitir un campo vacío, los siguientes se comparan con su propio hallazgo normal.
  assert.ok(hc.revisionSistemas.slice(1).every((item) => !item.alterado || item.valor === ''));
});

test('signos vitales con unidad, presión arterial combinada e IMC calculado; omite los no tomados', () => {
  const hc = buildHistoriaClinica(
    detalle({
      signosVitales: {
        values: { presionSistolica: 130, presionDiastolica: 80, temperatura: 36.5, pesoKg: 69.5, tallaCm: 169 },
        tomadoEn: null,
        tomadoPor: null,
      } as AtencionDetalle['signosVitales'],
    }),
    extras,
  );
  const byLabel = Object.fromEntries(hc.signos.map((item) => [item.label, item.valor]));
  assert.equal(byLabel['Presión arterial'], '130/80 mmHg');
  assert.equal(byLabel['Temperatura'], '36,5 °C');
  assert.equal(byLabel['IMC'], '24,33 kg/m² · Normal');
  assert.ok(!('Frecuencia cardíaca' in byLabel));
});
