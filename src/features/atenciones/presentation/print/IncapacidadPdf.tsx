import { Document, View } from '@react-pdf/renderer';

import { ClinicalPage, DiagnosticosTable, Field, Firma, PacienteSection, Paragraph, Section, s } from './clinical-pdf-kit';
import type { IncapacidadesDocumento } from './incapacidad-model';

/** Una hoja por incapacidad, con el mismo encabezado, identificación y firma de la historia clínica. */
export function IncapacidadPdf({ doc, logoSrc }: { doc: IncapacidadesDocumento; logoSrc: string | null }) {
  const { institucion, atencion, paciente } = doc;
  return (
    <Document title={`Incapacidad ${paciente.documento} ${atencion.fecha}`} author={institucion.nombre} language="es">
      {doc.incapacidades.map((incapacidad) => (
        <ClinicalPage
          key={incapacidad.numero}
          titulo="INCAPACIDAD"
          datos={[
            ['Incapacidad N.º', incapacidad.numero],
            ['Atención N.º', atencion.numero],
            ['Fecha', incapacidad.fecha],
          ]}
          encabezado={doc}
          logoSrc={logoSrc}
        >
          <PacienteSection number={1} encabezado={doc} />

          <Section number={2} title="Diagnósticos (CIE-10)">
            <DiagnosticosTable items={incapacidad.diagnosticos} />
          </Section>

          <Section number={3} title="Detalle de la incapacidad">
            <View style={s.grid}>
              <Field label="Fecha de inicio" value={incapacidad.inicio} width="20%" />
              <Field label="Fecha de fin" value={incapacidad.fin} width="20%" />
              <Field label="Días" value={incapacidad.dias} width="15%" />
              <Field label="Prórroga" value={incapacidad.prorroga} width="15%" />
              <Field label="Categoría" value={incapacidad.categoria} width="30%" />
            </View>
            <Paragraph title="Observaciones" text={incapacidad.observaciones || 'Sin observaciones.'} />
          </Section>

          <Firma encabezado={doc} nota={`Incapacidad emitida el ${incapacidad.fecha}`} />
        </ClinicalPage>
      ))}
    </Document>
  );
}
