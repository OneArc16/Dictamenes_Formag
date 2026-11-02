import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { AtencionDetalle } from '@/features/atenciones/application/atencion-detail';
import type { Remision } from '@/features/atenciones/domain/remisiones';

import type { DocumentoClinicoExtras } from './documento-clinico-model';
import { buildRemisiones } from './remision-model';

function remision(overrides: Partial<Remision> = {}): Remision {
  return {
    id: 10,
    citaId: 46564,
    cups: { codigo: '890262', nombre: 'CONSULTA DE PRIMERA VEZ POR MEDICINA DEL TRABAJO' },
    diagnosticos: [
      { codigo: 'M751', nombre: 'SINDROME DEL MANGUITO ROTATORIO' },
      { codigo: 'G560', nombre: 'SINDROME DEL TUNEL CARPIANO' },
    ],
    motivo: '  Valoración por dolor crónico  ',
    tipoDictamen: null,
    dictamenId: null,
    fecha: '2026-10-30T12:20:00.000Z',
    medicoNombre: 'William Gutiérrez',
    ...overrides,
  };
}

function detalle(remisiones: Remision[]): AtencionDetalle {
  return {
    id: 46564,
    inicioProgramado: '2026-10-30T12:15:00.000Z',
    sedeNombre: 'Santa Marta',
    especialidadNombre: 'Medicina laboral',
    modalidadNombre: 'Presencial',
    docente: {
      nombreCompleto: 'Astrid Ortiz Guerrero',
      tipoDocumento: 'CC',
      documento: '57426174',
      edad: 60,
      telefono: '3015816776',
      eps: 'Fiduprevisora',
      cargo: null,
      secretaria: null,
      institucion: null,
    },
    remisiones,
  } as unknown as AtencionDetalle;
}

const extras: DocumentoClinicoExtras = {
  institucion: { nombre: 'Prestador', nit: '900', codigoHabilitacion: null, direccion: null, telefono: null, ciudad: null },
  paciente: { fechaNacimiento: '1966-01-14', sexo: 'M', estadoCivil: null, direccion: null, etnia: null, zonaResidencia: null },
  profesional: { nombre: 'William Gutiérrez', tipoDocumento: 'CC', documento: '1082837615', registroMedico: '060-070926', licencia: null, firmaSrc: null },
  atendidaEn: null,
  generadoEn: '2026-11-02T15:00:00.000Z',
};

test('cada remisión lleva su número, fecha, servicio CUPS, motivo y diagnósticos en orden', () => {
  const doc = buildRemisiones(detalle([remision()]), extras);
  assert.equal(doc.paciente.sexo, 'Femenino');
  assert.deepEqual(doc.remisiones, [
    {
      numero: '10',
      fecha: '30/10/2026 07:20',
      cupsCodigo: '890262',
      cupsNombre: 'CONSULTA DE PRIMERA VEZ POR MEDICINA DEL TRABAJO',
      motivo: 'Valoración por dolor crónico',
      diagnosticos: [
        { orden: 'Principal', codigo: 'M751', nombre: 'SINDROME DEL MANGUITO ROTATORIO' },
        { orden: 'Relacionado 1', codigo: 'G560', nombre: 'SINDROME DEL TUNEL CARPIANO' },
      ],
    },
  ]);
});

test('la junta médica no imprime el tipo de calificación', () => {
  const doc = buildRemisiones(detalle([remision({ tipoDictamen: 'RECALIFICACION' })]), extras);
  assert.ok(!('junta' in doc.remisiones[0]));
  assert.ok(!JSON.stringify(doc).includes('Recalificación'));
});

test('con remisionId imprime solo esa remisión; sin él, todas', () => {
  const todas = detalle([remision({ id: 10 }), remision({ id: 11 })]);
  assert.deepEqual(buildRemisiones(todas, extras, 11).remisiones.map((item) => item.numero), ['11']);
  assert.equal(buildRemisiones(todas, extras).remisiones.length, 2);
  assert.equal(buildRemisiones(todas, extras, 99).remisiones.length, 0);
});
