import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

export type FormularioOrigenSnapshot = {
  formatoVersion?: string;
  numeroVersion?: number;
  documento?: { fechaDictamenOrigen?: string | null; numeroDictamenOrigen?: string | null };
  docente?: {
    documento?: string;
    tipoDocumento?: string;
    nombreCompleto?: string;
    edad?: number | null;
    secretaria?: string | null;
    institucion?: string | null;
  };
  descripcion?: string | null;
  informacion?: {
    fechaOcurrencia?: string | null;
    horaOcurrencia?: string | null;
    diaSemana?: string | null;
    jornadaEvento?: string | null;
  };
  medico?: {
    nombreCompleto?: string | null;
  } | null;
  emision?: {
    finalizadoEn?: string | null;
  };
  historialLaboral?: Array<{
    institucionNombreSnapshot?: string;
    cargoNombreSnapshot?: string;
    riesgosLaborales?: string;
    jornadaLaboral?: string;
    tiempoExposicionAnios?: number;
  }>;
  soportes?: Array<{
    tipo?: string;
    estado?: 'APORTADO' | 'NO_APORTADO' | 'NO_APLICA';
    fechaDocumento?: string | null;
    seTuvoEnCuenta?: string | null;
    nombreOtro?: string | null;
  }>;
  diagnosticos?: Array<{
    cie10Codigo?: string;
    cie10Nombre?: string;
    tipo?: string;
    esPrincipal?: boolean;
  }>;
  sustentacion?: {
    concepto?: string | null;
    fundamentosDerecho?: string | null;
    tipoEvento?: string | null;
    origenEvento?: string | null;
  };
};

const styles = StyleSheet.create({
  page: { paddingTop: 32, paddingBottom: 38, paddingHorizontal: 34, color: '#0F172A', fontFamily: 'Helvetica', fontSize: 8.5, lineHeight: 1.45 },
  header: { borderBottomWidth: 1.5, borderBottomColor: '#0369A1', paddingBottom: 10 },
  title: { fontSize: 14, fontWeight: 700, color: '#0C4A6E' },
  subtitle: { marginTop: 3, fontSize: 8, color: '#475569' },
  metadata: { marginTop: 10, flexDirection: 'row', gap: 12 },
  metaItem: { flexGrow: 1 },
  label: { fontSize: 7, color: '#64748B', textTransform: 'uppercase' },
  value: { marginTop: 2, fontSize: 9, fontWeight: 700 },
  section: { marginTop: 12 },
  sectionTitle: { backgroundColor: '#E0F2FE', color: '#0C4A6E', paddingVertical: 4, paddingHorizontal: 6, fontSize: 9, fontWeight: 700 },
  sectionBody: { padding: 6, borderWidth: 0.7, borderColor: '#CBD5E1' },
  row: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#E2E8F0' },
  cell: { flexGrow: 1, flexBasis: 0, padding: 4 },
  cellStrong: { fontWeight: 700 },
  footer: { position: 'absolute', bottom: 18, left: 34, right: 34, flexDirection: 'row', justifyContent: 'space-between', color: '#64748B', fontSize: 7 },
});

const value = (input: unknown) => String(input ?? '').trim() || '—';

const supportState = (support: NonNullable<FormularioOrigenSnapshot['soportes']>[number]) => {
  if (support.estado === 'NO_APLICA') return 'N.A.';
  if (support.estado === 'NO_APORTADO') return 'No aportado';
  return `Aportado${support.fechaDocumento ? ` · ${support.fechaDocumento}` : ''}`;
};

export function FormularioOrigenPdf({ data }: { data: FormularioOrigenSnapshot }) {
  const accidentNotApplicable = data.sustentacion?.tipoEvento === 'ENFERMEDAD';
  const occurrenceValue = (field: unknown) =>
    accidentNotApplicable ? 'N.A.' : value(field);

  return (
    <Document title={`Formulario de Origen ${value(data.documento?.numeroDictamenOrigen)}`} author="Dictamy">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Formulario de Determinación de Origen</Text>
          <Text style={styles.subtitle}>
            Documento finalizado · Formato {value(data.formatoVersion)} · Versión {value(data.numeroVersion)}
          </Text>
          <View style={styles.metadata}>
            <View style={styles.metaItem}><Text style={styles.label}>Número</Text><Text style={styles.value}>{value(data.documento?.numeroDictamenOrigen)}</Text></View>
            <View style={styles.metaItem}><Text style={styles.label}>Fecha</Text><Text style={styles.value}>{value(data.documento?.fechaDictamenOrigen)}</Text></View>
            <View style={styles.metaItem}><Text style={styles.label}>Docente</Text><Text style={styles.value}>{value(data.docente?.nombreCompleto)}</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identificación del docente</Text>
          <View style={styles.sectionBody}>
            <Text>{value(data.docente?.tipoDocumento)} {value(data.docente?.documento)} · Edad: {value(data.docente?.edad)}</Text>
            <Text>Secretaría: {value(data.docente?.secretaria)}</Text>
            <Text>Institución: {value(data.docente?.institucion)}</Text>
          </View>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Descripción</Text><Text style={styles.sectionBody}>{value(data.descripcion)}</Text></View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial laboral</Text>
          <View style={styles.sectionBody}>
            {(data.historialLaboral ?? []).map((item, index) => (
              <View key={index} style={styles.row} wrap={false}>
                <Text style={styles.cell}><Text style={styles.cellStrong}>{value(item.institucionNombreSnapshot)}</Text>{'\n'}{value(item.cargoNombreSnapshot)}</Text>
                <Text style={styles.cell}>Riesgos: {value(item.riesgosLaborales)}{'\n'}Jornada: {value(item.jornadaLaboral)}</Text>
                <Text style={styles.cell}>Exposición: {value(item.tiempoExposicionAnios)} años</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información y Fundamentos</Text>
          <View style={styles.sectionBody}>
            <Text>
              Ocurrencia: {occurrenceValue(data.informacion?.fechaOcurrencia)}
              {' · '}Día: {occurrenceValue(data.informacion?.diaSemana)}
              {' · '}Hora: {occurrenceValue(data.informacion?.horaOcurrencia)}
              {' · '}Jornada: {occurrenceValue(data.informacion?.jornadaEvento)}
            </Text>
            {(data.soportes ?? []).map((support, index) => (
              <View key={index} style={styles.row} wrap={false}>
                <Text style={styles.cell}>{value(support.nombreOtro || support.tipo)}</Text>
                <Text style={styles.cell}>{supportState(support)}</Text>
                <Text style={styles.cell}>{value(support.seTuvoEnCuenta)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnósticos</Text>
          <View style={styles.sectionBody}>
            {(data.diagnosticos ?? []).map((diagnosis, index) => (
              <Text key={index}>{diagnosis.esPrincipal ? 'Principal · ' : ''}{value(diagnosis.cie10Codigo)} — {value(diagnosis.cie10Nombre)} · {value(diagnosis.tipo)}</Text>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Responsable y emisión</Text>
          <View style={styles.sectionBody}>
            <Text>Médico responsable: {value(data.medico?.nombreCompleto)}</Text>
            <Text>Fecha de emisión: {value(data.emision?.finalizadoEn)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sustentación</Text>
          <View style={styles.sectionBody}>
            <Text>Concepto: {value(data.sustentacion?.concepto)}</Text>
            <Text>Fundamentos de Derecho: {value(data.sustentacion?.fundamentosDerecho)}</Text>
            <Text>Tipo de evento: {value(data.sustentacion?.tipoEvento)} · Origen: {value(data.sustentacion?.origenEvento)}</Text>
          </View>
        </View>
        <View style={styles.footer} fixed>
          <Text>Dictamy · Documento generado desde snapshot inmutable</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
