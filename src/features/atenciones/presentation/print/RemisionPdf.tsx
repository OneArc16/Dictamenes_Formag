import { Document, View } from '@react-pdf/renderer';

import { ClinicalPage, DiagnosticosTable, Field, Firma, PacienteSection, Paragraph, Section, s } from './clinical-pdf-kit';
import type { RemisionesDocumento } from './remision-model';

/** Una hoja por remisión, con el mismo encabezado, identificación y firma de la historia clínica. */
export function RemisionPdf({ doc, logoSrc }: { doc: RemisionesDocumento; logoSrc: string | null }) {
  const { institucion, atencion, paciente } = doc;
  return (
    <Document title={`Remisión ${paciente.documento} ${atencion.fecha}`} author={institucion.nombre} language="es">
      {doc.remisiones.map((remision) => (
        <ClinicalPage
          key={remision.numero}
          titulo="REMISIÓN"
          datos={[
            ['Remisión N.º', remision.numero],
            ['Atención N.º', atencion.numero],
            ['Fecha', remision.fecha],
          ]}
          encabezado={doc}
          logoSrc={logoSrc}
        >
          <PacienteSection number={1} encabezado={doc} />

          <Section number={2} title="Diagnósticos (CIE-10)">
            <DiagnosticosTable items={remision.diagnosticos} />
          </Section>

          <Section number={3} title="Servicio solicitado">
            <View style={s.grid}>
              <Field label="Código CUPS" value={remision.cupsCodigo} width="20%" />
              <Field label="Procedimiento / servicio" value={remision.cupsNombre} width="80%" />
            </View>
            <Paragraph title="Motivo de la remisión" text={remision.motivo || 'No registrado.'} />
          </Section>

          <Firma encabezado={doc} nota={`Remisión emitida el ${remision.fecha}`} />
        </ClinicalPage>
      ))}
    </Document>
  );
}
