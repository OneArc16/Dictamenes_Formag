import { Document, View } from '@react-pdf/renderer';

import type { EncabezadoClinico } from './documento-clinico-model';
import { ClinicalPage, Field, Paragraph, Section, s } from './clinical-pdf-kit';

export type RecordatorioDocumento = {
  encabezado: Pick<EncabezadoClinico, 'institucion' | 'generadoEn'>;
  codigo: string;
  paciente: { nombre: string; documento: string };
  cita: { fecha: string; hora: string; sede: string; especialidad: string; medico: string; modalidad: string };
};

/** Recordatorio de una cita asignada, con el mismo encabezado y pie de los demás documentos clínicos. */
export function RecordatorioPdf({ doc, logoSrc }: { doc: RecordatorioDocumento; logoSrc: string | null }) {
  const { encabezado, paciente, cita } = doc;
  return (
    <Document title={`Recordatorio de cita ${paciente.documento}`} author={encabezado.institucion.nombre} language="es">
      <ClinicalPage
        titulo="RECORDATORIO DE CITA"
        datos={[
          ['Cita N.º', doc.codigo],
          ['Fecha', cita.fecha],
          ['Hora', cita.hora],
        ]}
        encabezado={encabezado}
        logoSrc={logoSrc}
      >
        <Section number={1} title="Paciente">
          <View style={s.grid}>
            <Field label="Nombre completo" value={paciente.nombre} width="65%" />
            <Field label="Documento" value={paciente.documento} width="35%" />
          </View>
        </Section>

        <Section number={2} title="Datos de la cita">
          <View style={s.grid}>
            <Field label="Fecha de la cita" value={cita.fecha} width="25%" />
            <Field label="Hora de la cita" value={cita.hora} width="25%" />
            <Field label="Modalidad" value={cita.modalidad} width="50%" />
            <Field label="Profesional" value={cita.medico} width="50%" />
            <Field label="Especialidad" value={cita.especialidad} width="50%" />
            <Field label="Sede" value={cita.sede} width="100%" />
          </View>
        </Section>

        <Section number={3} title="Observación">
          <Paragraph text="Se recomienda estar 15 minutos antes de la hora asignada de su cita para poder confirmar la asistencia. Conserve este recordatorio." />
        </Section>
      </ClinicalPage>
    </Document>
  );
}
