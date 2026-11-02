import assert from 'node:assert/strict';
import { test } from 'node:test';

import { renderToBuffer } from '@react-pdf/renderer';
import { PDFDocument } from 'pdf-lib';

import { HistoriaClinicaPdf } from './HistoriaClinicaPdf';
import type { HistoriaClinicaDocumento } from './historia-clinica-model';

const hc: HistoriaClinicaDocumento = {
  institucion: { nombre: 'Prestador', nit: '900 000 000 - 1', codigoHabilitacion: '470010000001', direccion: 'Calle 1', telefono: '300', ciudad: 'Santa Marta' },
  atencion: { numero: '7', fecha: '30/10/2026', hora: '07:03', cierre: '30/10/2026 07:20', sede: 'Centro', especialidad: 'Medicina general', modalidad: 'Presencial' },
  paciente: { nombre: 'Paciente Prueba', documento: 'CC 1', edad: '53 años', fechaNacimiento: '10/10/1973', sexo: 'Masculino', estadoCivil: 'Soltero(a)', direccion: 'Calle 2', zona: 'Urbana', telefono: '300', eps: 'EPS', ocupacion: 'Docente', etnia: '' },
  motivoConsulta: 'Control',
  enfermedadActual: 'Texto largo. '.repeat(400),
  antecedentes: { personales: [{ titulo: 'Patológicos', items: [{ label: 'Hipertensión', valor: 'SI' }] }], negados: ['Diabetes'], familiares: [], ginecobstetricos: [] },
  signos: [{ label: 'Presión arterial', valor: '130/80 mmHg' }],
  revisionSistemas: [{ label: 'Cabeza', valor: 'Cefalea', alterado: true }],
  examenFisico: [],
  diagnosticos: [{ orden: 'Principal', codigo: 'I10X', nombre: 'HIPERTENSION ESENCIAL', tipo: 'Confirmado repetido' }],
  analisis: 'Estable',
  plan: 'Control',
  tratamiento: '',
  remisiones: [],
  incapacidades: [],
  evoluciones: [],
  profesional: { nombre: 'Ana Pérez', tipoDocumento: 'CC', documento: 'CC 2', registroMedico: '123', firmaSrc: null, especialidad: 'Medicina general' },
  generadoEn: '02/11/2026 10:00',
};

test('genera un PDF tamaño carta que pasa a varias hojas cuando el contenido es largo', async () => {
  const buffer = await renderToBuffer(<HistoriaClinicaPdf hc={hc} logoSrc={null} />);
  const pdf = await PDFDocument.load(buffer);
  assert.ok(pdf.getPageCount() > 1);
  const { width, height } = pdf.getPage(0).getSize();
  assert.deepEqual([Math.round(width), Math.round(height)], [612, 792]);
});
