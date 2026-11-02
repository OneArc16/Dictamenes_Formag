/* eslint-disable jsx-a11y/alt-text */
import '@/lib/react-pdf/hyphenation';

import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { ReactNode } from 'react';

import type { Dato, Hallazgo, HistoriaClinicaDocumento } from './historia-clinica-model';

const COLOR = {
  ink: '#1b2733',
  muted: '#5b6b7a',
  accent: '#0e5a6e',
  tint: '#e9f3f5',
  line: '#c9d6de',
  alert: '#9a3412',
};

const LEGAL_NOTICE =
  'Documento confidencial con reserva legal (Ley 23 de 1981, Resolución 1995 de 1999 y Ley 1581 de 2012). ' +
  'Solo puede ser conocido por terceros con autorización del paciente o en los casos previstos por la ley.';

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    color: COLOR.ink,
    paddingTop: 28,
    paddingBottom: 50,
    paddingHorizontal: 34,
    // El interlineado va en `body`: en la página oculta el pie fijo con posición absoluta (react-pdf).
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    marginBottom: 2,
    borderBottomWidth: 2,
    borderBottomColor: COLOR.accent,
  },
  logo: { width: 78, objectFit: 'contain' },
  institution: { flex: 1, paddingHorizontal: 12 },
  institutionName: { fontFamily: 'Helvetica-Bold', fontSize: 10, lineHeight: 1.2, marginBottom: 2, color: COLOR.accent, textTransform: 'uppercase' },
  institutionLine: { fontSize: 6.8, color: COLOR.muted },
  badge: { width: 140, borderWidth: 1, borderColor: COLOR.accent, borderRadius: 4 },
  badgeTitle: {
    backgroundColor: COLOR.accent,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    letterSpacing: 0.6,
    textAlign: 'center',
    paddingVertical: 3,
  },
  badgeBody: { paddingHorizontal: 6, paddingVertical: 3 },
  badgeLine: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 6.8 },
  // lineHeight se resuelve con el fontSize del mismo estilo: van juntos.
  body: { fontSize: 7.5, lineHeight: 1.3 },
  // El espacio entre secciones va arriba del título: con marginBottom, una sección que solo no
  // cabe por su margen salta completa a la hoja siguiente (react-pdf).
  section: { marginTop: 8 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    borderBottomWidth: 0.75,
    borderBottomColor: COLOR.line,
    paddingBottom: 2,
  },
  sectionNumber: {
    width: 15,
    marginRight: 5,
    paddingVertical: 1.2,
    backgroundColor: COLOR.accent,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 6.2,
    textAlign: 'center',
    lineHeight: 1,
    borderRadius: 2,
  },
  sectionTitle: { fontFamily: 'Helvetica-Bold', fontSize: 8, color: COLOR.accent, letterSpacing: 0.8, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 0.5, borderLeftWidth: 0.5, borderColor: COLOR.line },
  gridCell: { paddingHorizontal: 4, paddingVertical: 2, borderRightWidth: 0.5, borderBottomWidth: 0.5, borderColor: COLOR.line },
  label: { fontSize: 5.8, color: COLOR.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  value: { fontSize: 7.5 },
  subTitle: { fontFamily: 'Helvetica-Bold', fontSize: 7.2, marginTop: 3, marginBottom: 1 },
  paragraph: { textAlign: 'justify' },
  row: { flexDirection: 'row', paddingVertical: 1.8, borderBottomWidth: 0.5, borderBottomColor: COLOR.line },
  rowLabel: { width: '28%', fontFamily: 'Helvetica-Bold', paddingRight: 6 },
  rowValue: { flex: 1, textAlign: 'justify' },
  flag: { color: COLOR.alert, fontFamily: 'Helvetica-Bold' },
  muted: { color: COLOR.muted },
  tableHead: { flexDirection: 'row', backgroundColor: COLOR.tint, fontFamily: 'Helvetica-Bold', fontSize: 6.8 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: COLOR.line },
  tableCell: { paddingHorizontal: 4, paddingVertical: 2 },
  signature: { marginTop: 14, width: 220 },
  signatureImage: { height: 42, objectFit: 'contain', objectPosition: 'left' },
  signatureLine: { borderTopWidth: 0.75, borderTopColor: COLOR.ink, marginTop: 2, paddingTop: 3 },
  footer: {
    position: 'absolute',
    left: 34,
    right: 34,
    bottom: 18,
    borderTopWidth: 0.75,
    borderTopColor: COLOR.line,
    paddingTop: 3,
    fontSize: 5.8,
    color: COLOR.muted,
  },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
});

function Section({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <View style={s.section}>
      {/* El título no queda solo al final de una hoja: viaja con el inicio de su contenido. */}
      <View style={s.sectionHead} wrap={false} minPresenceAhead={60}>
        <Text style={s.sectionNumber}>{String(number).padStart(2, '0')}</Text>
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Field({ label, value, width }: { label: string; value: string; width: string }) {
  return (
    <View style={[s.gridCell, { width }]}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value || '—'}</Text>
    </View>
  );
}

function Rows({ items }: { items: Array<Dato | Hallazgo> }) {
  return (
    <View>
      {items.map((item) => (
        <View key={item.label} style={s.row} wrap={false}>
          <Text style={s.rowLabel}>{item.label}</Text>
          <Text style={s.rowValue}>
            {/* Helvetica estándar no trae símbolos fuera de WinAnsi: el marcador es "»". */}
            {'alterado' in item && item.alterado ? <Text style={s.flag}>» </Text> : null}
            {item.valor}
          </Text>
        </View>
      ))}
    </View>
  );
}

function AlteradosNota({ items }: { items: Hallazgo[] }) {
  if (!items.some((item) => item.alterado)) return null;
  return (
    <Text style={[s.muted, { fontSize: 7, marginTop: 2 }]}>
      <Text style={s.flag}>» </Text>Hallazgo distinto del normal.
    </Text>
  );
}

function Paragraph({ title, text }: { title?: string; text: string }) {
  return (
    <View>
      {title ? <Text style={s.subTitle}>{title}</Text> : null}
      <Text style={s.paragraph}>{text}</Text>
    </View>
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
      <Page size="LETTER" style={s.page} wrap>
        <View fixed style={s.body}>
          <View style={s.header}>
            {logoSrc ? <Image src={logoSrc} style={s.logo} /> : null}
            <View style={s.institution}>
              <Text style={s.institutionName}>{institucion.nombre}</Text>
              <Text style={s.institutionLine}>
                NIT {institucion.nit}
                {institucion.codigoHabilitacion ? `  ·  Cód. habilitación REPS ${institucion.codigoHabilitacion}` : ''}
              </Text>
              <Text style={s.institutionLine}>
                {[institucion.direccion, institucion.ciudad, institucion.telefono ? `Tel. ${institucion.telefono}` : '']
                  .filter(Boolean)
                  .join('  ·  ')}
              </Text>
            </View>
            <View style={s.badge}>
              <Text style={s.badgeTitle}>HISTORIA CLÍNICA</Text>
              <View style={s.badgeBody}>
                <View style={s.badgeLine}>
                  <Text style={s.muted}>Atención N.º</Text>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>{atencion.numero}</Text>
                </View>
                <View style={s.badgeLine}>
                  <Text style={s.muted}>Fecha</Text>
                  <Text>
                    {atencion.fecha} {atencion.hora}
                  </Text>
                </View>
                <View style={s.badgeLine}>
                  <Text style={s.muted}>Modalidad</Text>
                  <Text>{atencion.modalidad}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={s.body}>
        <Section number={next()} title="Identificación del paciente">
          <View style={s.grid}>
            <Field label="Nombre completo" value={paciente.nombre} width="50%" />
            <Field label="Documento" value={paciente.documento} width="25%" />
            <Field label="Fecha de nacimiento" value={paciente.fechaNacimiento} width="25%" />
            {/* Datos cortos juntos; la EPS lleva una celda ancha para no estirar la fila con varias líneas. */}
            <Field label="Edad" value={paciente.edad} width="12%" />
            <Field label="Sexo" value={paciente.sexo} width="13%" />
            <Field label="Estado civil" value={paciente.estadoCivil} width="15%" />
            <Field label="Pertenencia étnica" value={paciente.etnia} width="18%" />
            <Field label="Zona" value={paciente.zona} width="12%" />
            <Field label="Teléfono" value={paciente.telefono} width="30%" />
            <Field label="Dirección" value={paciente.direccion} width="40%" />
            <Field label="EPS / Aseguradora" value={paciente.eps} width="60%" />
            <Field label="Ocupación" value={paciente.ocupacion} width="50%" />
            <Field label="Sede" value={atencion.sede} width="25%" />
            <Field label="Especialidad" value={atencion.especialidad} width="25%" />
          </View>
        </Section>

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
          {hc.diagnosticos.length > 0 ? (
            <View>
              <View style={s.tableHead} wrap={false}>
                <Text style={[s.tableCell, { width: '16%' }]}>Orden</Text>
                <Text style={[s.tableCell, { width: '10%' }]}>Código</Text>
                <Text style={[s.tableCell, { width: '52%' }]}>Descripción</Text>
                <Text style={[s.tableCell, { width: '22%' }]}>Tipo</Text>
              </View>
              {hc.diagnosticos.map((item) => (
                <View key={item.orden} style={s.tableRow} wrap={false}>
                  <Text style={[s.tableCell, { width: '16%', fontFamily: 'Helvetica-Bold' }]}>{item.orden}</Text>
                  <Text style={[s.tableCell, { width: '10%' }]}>{item.codigo}</Text>
                  <Text style={[s.tableCell, { width: '52%' }]}>{item.nombre}</Text>
                  <Text style={[s.tableCell, { width: '22%' }]}>{item.tipo}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={s.muted}>Sin diagnósticos registrados.</Text>
          )}
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

        <View style={s.signature} wrap={false}>
          {hc.profesional.firmaSrc ? <Image src={hc.profesional.firmaSrc} style={s.signatureImage} /> : <View style={{ height: 42 }} />}
          <View style={s.signatureLine}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>{hc.profesional.nombre}</Text>
            {hc.profesional.documento ? <Text>{hc.profesional.documento}</Text> : null}
            <Text>
              {hc.profesional.especialidad}
              {hc.profesional.registroMedico ? `  ·  Registro médico ${hc.profesional.registroMedico}` : ''}
            </Text>
            {atencion.cierre ? <Text style={s.muted}>Atención finalizada el {atencion.cierre}</Text> : null}
          </View>
        </View>
        </View>

        <View style={s.footer} fixed>
          <Text>{LEGAL_NOTICE}</Text>
          <View style={s.footerRow}>
            <Text>Impreso el {hc.generadoEn}</Text>
            <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
          </View>
        </View>
      </Page>
    </Document>
  );
}
