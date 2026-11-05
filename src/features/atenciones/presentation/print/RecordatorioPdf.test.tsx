import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { RecordatorioPdf, type RecordatorioDocumento } from './RecordatorioPdf';
import { formatHoraMeridiana } from './documento-clinico-model';

const doc: RecordatorioDocumento = {
  encabezado: {
    institucion: { nombre: 'Servicios Integrales de Salud del Magdalena', nit: '900 018 045 - 5', codigoHabilitacion: null, direccion: 'CR 19 N 26B - 53', telefono: '3205184998', ciudad: 'Santa Marta' },
    generadoEn: '03/11/2026 08:00',
  },
  codigo: '62267',
  paciente: { nombre: 'EUFEMIA CECILIA LANDERO LAZCANO', documento: 'CC 39047821' },
  cita: { fecha: '03/11/2026', hora: '07:30', sede: 'Sede Norte', especialidad: 'Medicina laboral', medico: 'WILLIAM GUTIERREZ', modalidad: 'Presencial' },
};

describe('RecordatorioPdf', () => {
  it('formats the appointment time with its meridiem', () => {
    const formatted = formatHoraMeridiana('2026-11-20T16:30:00.000Z')
      .replace(/\s/g, ' ');

    assert.match(formatted, /11:30.*a\.\s*m\./i);
  });

  it('renders a one-page PDF', async () => {
    const bytes = await renderToBuffer(React.createElement(RecordatorioPdf, { doc, logoSrc: null }) as never);
    assert.equal(bytes.subarray(0, 4).toString(), '%PDF');
    assert.equal((bytes.toString('latin1').match(/\/Type \/Page\b/g) ?? []).length, 1);
  });
});
