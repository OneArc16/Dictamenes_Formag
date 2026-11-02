import { Document, Text, View } from '@react-pdf/renderer';

import {
  ClinicalPage,
  DiagnosticosTable,
  Field,
  Firma,
  PacienteSection,
  Paragraph,
  Rows,
  Section,
  s,
} from './clinical-pdf-kit';
import type { Hallazgo } from './documento-clinico-model';
import type { HistoriaClinicaDocumento } from './historia-clinica-model';

function AlteradosNota({ items }: { items: Hallazgo[] }) {
  if (!items.some((item) => item.alterado)) return null;
  return (
    <Text style={[s.muted, { fontSize: 7, marginTop: 2 }]}>
      <Text style={s.flag}>» </Text>Hallazgo distinto del normal.
    </Text>
  );
}

export function HistoriaClinicaPdf({ hc, logoSrc }: { hc: HistoriaClinicaDocumento; logoSrc: string | null }) {
  const { institucion, atencion, paciente, antecedentes } = hc;
  const tieneAntecedentes =
    antecedentes.personales.length > 0 ||
    antecedentes.negados.length > 0 ||
    antecedentes.familiares.length > 0 ||
    antecedentes.ginecobstetricos.length > 0;
  const tienePlan = Boolean(hc.analisis || hc.plan || hc.tratamiento);
  const tieneOrdenes = hc.remisiones.length > 0 || hc.incapacidades.length > 0;

  // Solo se numeran las secciones con contenido, en el orden de la consulta.
  let n = 0;
  const next = () => ++n;

  return (
    <Document title={`Historia clínica ${paciente.documento} ${atencion.fecha}`} author={institucion.nombre} language="es">
      <ClinicalPage
        titulo="HISTORIA CLÍNICA"
        datos={[
          ['Atención N.º', atencion.numero],
          ['Fecha', `${atencion.fecha} ${atencion.hora}`],
          ['Modalidad', atencion.modalidad],
        ]}
        encabezado={hc}
        logoSrc={logoSrc}
      >
        <PacienteSection number={next()} encabezado={hc} />

        <Section number={next()} title="Anamnesis">
          <Paragraph title="Motivo de consulta" text={hc.motivoConsulta || 'No registrado.'} />
          <Paragraph title="Enfermedad actual" text={hc.enfermedadActual || 'No registrada.'} />
        </Section>

        {tieneAntecedentes ? (
          <Section number={next()} title="Antecedentes">
            {antecedentes.personales.map((grupo) => (
              <View key={grupo.titulo}>
                <Text style={s.subTitle}>{grupo.titulo}</Text>
                <Rows items={grupo.items} />
              </View>
            ))}
            {antecedentes.familiares.length > 0 ? (
              <View>
                <Text style={s.subTitle}>Familiares</Text>
                <Rows items={antecedentes.familiares} />
              </View>
            ) : null}
            {antecedentes.ginecobstetricos.length > 0 ? (
              <View>
                <Text style={s.subTitle}>Ginecobstétricos</Text>
                <Rows items={antecedentes.ginecobstetricos} />
              </View>
            ) : null}
            {antecedentes.negados.length > 0 ? (
              <Text style={[s.paragraph, s.muted, { marginTop: 4 }]}>
                <Text style={{ fontFamily: 'Helvetica-Bold' }}>No refiere: </Text>
                {antecedentes.negados.join(', ')}.
              </Text>
            ) : null}
          </Section>
        ) : null}

        {hc.revisionSistemas.length > 0 ? (
          <Section number={next()} title="Revisión por sistemas">
            <Rows items={hc.revisionSistemas} />
            <AlteradosNota items={hc.revisionSistemas} />
          </Section>
        ) : null}

        {hc.signos.length > 0 || hc.examenFisico.length > 0 ? (
          <Section number={next()} title="Examen físico">
            {hc.signos.length > 0 ? (
              <View style={[s.grid, { marginBottom: 6 }]} wrap={false}>
                {hc.signos.map((item) => (
                  <Field key={item.label} label={item.label} value={item.valor} width="25%" />
                ))}
              </View>
            ) : null}
            <Rows items={hc.examenFisico} />
            <AlteradosNota items={hc.examenFisico} />
          </Section>
        ) : null}

        <Section number={next()} title="Diagnósticos (CIE-10)">
          <DiagnosticosTable items={hc.diagnosticos} />
        </Section>

        {tienePlan ? (
          <Section number={next()} title="Análisis y plan de manejo">
            {hc.analisis ? <Paragraph title="Análisis" text={hc.analisis} /> : null}
            {hc.plan ? <Paragraph title="Plan" text={hc.plan} /> : null}
            {hc.tratamiento ? <Paragraph title="Tratamiento" text={hc.tratamiento} /> : null}
          </Section>
        ) : null}

        {tieneOrdenes ? (
          <Section number={next()} title="Órdenes emitidas">
            {hc.remisiones.length > 0 ? (
              <View>
                <Text style={s.subTitle}>Remisiones</Text>
                {hc.remisiones.map((item, index) => (
                  <View key={index} style={[s.row, { flexDirection: 'column' }]} wrap={false}>
                    <Text style={{ fontFamily: 'Helvetica-Bold' }}>{item.servicio}</Text>
                    <Text style={s.muted}>Motivo: {item.motivo || 'no registrado.'}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {hc.incapacidades.length > 0 ? (
              <View>
                <Text style={s.subTitle}>Incapacidades</Text>
                <Rows items={hc.incapacidades.map((item) => ({ label: `N.º ${item.numero}`, valor: item.detalle }))} />
              </View>
            ) : null}
          </Section>
        ) : null}

        {hc.evoluciones.length > 0 ? (
          <Section number={next()} title="Evoluciones">
            {hc.evoluciones.map((item, index) => (
              <View key={index} style={s.row} wrap={false}>
                <Text style={s.rowLabel}>
                  {item.fecha}
                  {item.medico ? `\n${item.medico}` : ''}
                </Text>
                <Text style={s.rowValue}>{item.texto}</Text>
              </View>
            ))}
          </Section>
        ) : null}

        <Firma encabezado={hc} nota={atencion.cierre ? `Atención finalizada el ${atencion.cierre}` : undefined} />
      </ClinicalPage>
    </Document>
  );
}
