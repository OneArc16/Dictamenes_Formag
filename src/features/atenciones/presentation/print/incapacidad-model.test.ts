import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { AtencionDetalle } from '@/features/atenciones/application/atencion-detail';
import type { Incapacidad } from '@/features/atenciones/domain/incapacidades';

import type { DocumentoClinicoExtras } from './documento-clinico-model';
import { buildIncapacidades } from './incapacidad-model';

function incapacidad(overrides: Partial<Incapacidad> = {}): Incapacidad {
  return {
    id: 5,
    citaId: 46612,
    numeroInterno: '2026-0001',
    categoria: 'ENFERMEDAD_GENERAL',
    prorroga: false,
    diagnosticos: [{ codigo: 'M542', nombre: 'CERVICALGIA' }],
    fechaInicio: '2026-10-30',
    fechaFin: '2026-11-03',
    dias: 5,
    observaciones: '  Reposo relativo  ',
    fecha: '2026-10-30T14:53:00.000Z',
    medicoNombre: 'Irene Gómez',
    ...overrides,
  };
}

function detalle(incapacidades: Incapacidad[]): AtencionDetalle {
  return {
    id: 46612,
    inicioProgramado: '2026-10-30T14:53:00.000Z',
    sedeNombre: 'Santa Marta',
    especialidadNombre: 'Medicina general',
    modalidadNombre: 'Presencial',
    docente: {
      nombreCompleto: 'Nairis Correa López',
      tipoDocumento: 'CC',
      documento: '39059952',
      edad: 47,
      telefono: '3012753993',
      eps: 'Coosalud',
      cargo: null,
      secretaria: null,
      institucion: null,
    },
    incapacidades,
  } as unknown as AtencionDetalle;
}

const extras: DocumentoClinicoExtras = {
  institucion: { nombre: 'Prestador', nit: '900', codigoHabilitacion: null, direccion: null, telefono: null, ciudad: null },
  paciente: { fechaNacimiento: '1979-10-29', sexo: 'M', estadoCivil: null, direccion: null, etnia: null, zonaResidencia: null },
  profesional: { nombre: 'Irene Gómez', tipoDocumento: 'CC', documento: '1129567108', registroMedico: '471464', licencia: null, firmaSrc: null },
  atendidaEn: null,
  generadoEn: '2026-11-02T15:00:00.000Z',
};

test('cada incapacidad lleva número, fechas, días, prórroga, categoría, observaciones y diagnósticos en orden', () => {
  const doc = buildIncapacidades(detalle([incapacidad()]), extras);
  assert.deepEqual(doc.incapacidades, [
    {
      numero: '2026-0001',
      fecha: '30/10/2026 09:53',
      inicio: '30/10/2026',
      fin: '03/11/2026',
      dias: '5 días',
      prorroga: 'No',
      categoria: 'Enfermedad general',
      observaciones: 'Reposo relativo',
      diagnosticos: [{ orden: 'Principal', codigo: 'M542', nombre: 'CERVICALGIA' }],
    },
  ]);
});

test('un día en singular y la prórroga marcada', () => {
  const [item] = buildIncapacidades(detalle([incapacidad({ dias: 1, prorroga: true })]), extras).incapacidades;
  assert.equal(item.dias, '1 día');
  assert.equal(item.prorroga, 'Sí');
});
