import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import type { ReactNode } from 'react';

export type FormularioOrigenSnapshot = {
  formatoVersion?: string;
  numeroVersion?: number;
  documento?: {
    fechaRecepcionSolicitud?: string | null;
    fechaDictamenOrigen?: string | null;
    numeroDictamenOrigen?: string | null;
  };
  entidad?: {
    nombreContratista?: string | null;
    departamento?: string | null;
    direccion?: string | null;
    telefono?: string | null;
    municipio?: string | null;
  };
  docente?: {
    documento?: string;
    tipoDocumento?: string;
    primerApellido?: string | null;
    segundoApellido?: string | null;
    primerNombre?: string | null;
    segundoNombre?: string | null;
    nombreCompleto?: string;
    fechaNacimiento?: string | null;
    edad?: number | null;
    sexo?: string | null;
    tipoUsuario?: string | null;
    categoria?: string | null;
    fechaVinculacion?: string | null;
    estadoCivil?: string | null;
    escolaridad?: string | null;
    zonaResidencia?: string | null;
    municipio?: string | null;
    cargo?: string | null;
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
  junta?: Array<{
    tipoDocumento?: string | null;
    numeroDocumento?: string | null;
    nombreCompleto?: string | null;
    especialidad?: string | null;
    registroMedico?: string | null;
    licencia?: string | null;
    firmaSrc?: string | null;
  }>;
};

type CellProps = {
  children?: ReactNode;
  width: string;
  minHeight?: number;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  blue?: boolean;
  fontSize?: number;
  padding?: number;
};

const BLUE = '#B8CFE7';
const BORDER = '#111827';

const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 50,
    paddingHorizontal: 50,
    color: '#111827',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 7.5,
  },
  pageOne: {
    paddingBottom: 30,
  },
  table: {
    width: '100%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: BORDER,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
  },
  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 3,
    paddingVertical: 2,
    justifyContent: 'center',
  },
  centered: { alignItems: 'center', textAlign: 'center' },
  right: { alignItems: 'flex-end', textAlign: 'right' },
  bold: { fontWeight: 700 },
  blue: { backgroundColor: BLUE },
  sectionTitle: {
    minHeight: 14,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  sectionTitleText: {
    fontSize: 8,
    fontWeight: 700,
    textAlign: 'center',
  },
  logoCell: {
    width: '33%',
    minHeight: 38,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 112, height: 40, objectFit: 'contain' },
  mainTitleCell: {
    width: '67%',
    minHeight: 38,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  mainTitle: {
    minHeight: 24,
    backgroundColor: '#8FB7DE',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  mainTitleText: {
    fontSize: 7.8,
    fontWeight: 700,
    lineHeight: 1.25,
    textAlign: 'center',
  },
  subTitle: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BLUE,
  },
  subTitleText: { fontSize: 8, fontWeight: 700 },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  checkBox: {
    width: 12,
    height: 12,
    borderWidth: 0.8,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontSize: 7, fontWeight: 700 },
  largeDescriptionCell: {
    width: '36%',
    height: 187,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  largeDescriptionValue: {
    width: '64%',
    height: 187,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  descriptionText: { fontSize: 8, lineHeight: 1.4, textAlign: 'center' },
  supportName: { fontSize: 7.4, lineHeight: 1.2, textAlign: 'center' },
  diagnosisNumber: { backgroundColor: BLUE, fontWeight: 700 },
  longText: { fontSize: 7.6, lineHeight: 1.35, textAlign: 'center' },
  classificationLabel: { fontSize: 7.6, fontWeight: 700, textAlign: 'center' },
  signaturesHeader: {
    minHeight: 48,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 3,
  },
  signatureInfo: {
    fontSize: 7.2,
    lineHeight: 1.35,
    textAlign: 'center',
  },
  signatureImage: {
    width: '92%',
    height: 45,
    objectFit: 'contain',
  },
});

const show = (input: unknown, fallback = '') =>
  String(input ?? '').trim() || fallback;

const upper = (input: unknown) => show(input).toLocaleUpperCase('es-CO');

function zoneDisplay(input: unknown) {
  const value = upper(input);
  if (['U', 'URBANA', 'URBANO'].includes(value)) return 'URBANA';
  if (['R', 'RURAL'].includes(value)) return 'RURAL';
  return value;
}

function dateDisplay(input: unknown) {
  const raw = show(input);
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : raw;
}

function monthDiff(from: unknown, to: unknown) {
  const start = new Date(show(from));
  const end = new Date(show(to));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';
  return String(
    Math.max(
      0,
      (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
        end.getUTCMonth() -
        start.getUTCMonth(),
    ),
  );
}

function legacyNameParts(fullName: unknown) {
  const parts = show(fullName).split(/\s+/).filter(Boolean);
  if (parts.length < 3) {
    return {
      primerNombre: parts[0] ?? '',
      segundoNombre: parts.slice(1).join(' '),
      primerApellido: '',
      segundoApellido: '',
    };
  }
  return {
    primerNombre: parts[0],
    segundoNombre: parts.slice(1, -2).join(' '),
    primerApellido: parts.at(-2) ?? '',
    segundoApellido: parts.at(-1) ?? '',
  };
}

function Cell({
  children,
  width,
  minHeight = 13,
  align = 'left',
  bold = false,
  blue = false,
  fontSize,
  padding = 3,
}: CellProps) {
  return (
    <View
      style={[
        styles.cell,
        { width, minHeight, paddingHorizontal: padding },
        ...(align === 'center' ? [styles.centered] : []),
        ...(align === 'right' ? [styles.right] : []),
        ...(bold ? [styles.bold] : []),
        ...(blue ? [styles.blue] : []),
      ]}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text style={fontSize ? { fontSize } : undefined}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{children}</Text>
    </View>
  );
}

function Check({ selected }: { selected: boolean }) {
  return (
    <View style={styles.checkBox}>
      <Text style={styles.checkText}>{selected ? 'X' : ''}</Text>
    </View>
  );
}

function Choice({
  label,
  selected,
}: {
  label: string;
  selected: boolean;
}) {
  return (
    <View style={styles.choice}>
      <Text>{label}</Text>
      <Check selected={selected} />
    </View>
  );
}

const SUPPORT_LABELS: Record<string, string> = {
  REPORTE_ACCIDENTE_TRABAJO: 'REPORTE DE ACCIDENTE DE TRABAJO',
  DESCRIPCION_EVENTO: 'DESCRIPCIÓN DEL EVENTO OCURRIDO',
  EPICRISIS_RESUMEN_HISTORIA: 'EPICRISIS O RESUMEN DE HISTORIA CLÍNICA',
  CERTIFICADO_DEFUNCION: 'CERTIFICADO DE DEFUNCIÓN',
  ANALISIS_PUESTO_TRABAJO: 'ANÁLISIS DE PUESTO DE TRABAJO',
  EXAMENES_PREOCUPACIONALES: 'EXÁMENES PREOCUPACIONALES',
  INVESTIGACION_ACCIDENTE: 'INVESTIGACIÓN DEL ACCIDENTE REALIZADA',
  OTRO: 'OTROS',
};

const FIXED_SUPPORTS = [
  'REPORTE_ACCIDENTE_TRABAJO',
  'DESCRIPCION_EVENTO',
  'EPICRISIS_RESUMEN_HISTORIA',
  'CERTIFICADO_DEFUNCION',
  'ANALISIS_PUESTO_TRABAJO',
  'EXAMENES_PREOCUPACIONALES',
  'INVESTIGACION_ACCIDENTE',
] as const;

function supportRows(data: FormularioOrigenSnapshot) {
  const supports = data.soportes ?? [];
  const fixed = FIXED_SUPPORTS.map((type) => {
    const support = supports.find((item) => item.tipo === type);
    return {
      ...support,
      tipo: type,
      label: SUPPORT_LABELS[type],
    };
  });
  const others = supports
    .filter((item) => item.tipo === 'OTRO')
    .map((item) => ({
      ...item,
      label: upper(item.nombreOtro) || SUPPORT_LABELS.OTRO,
    }));
  return [...fixed, ...others];
}

function SupportRow({
  support,
}: {
  support: ReturnType<typeof supportRows>[number];
}) {
  const notApplicable = support.estado === 'NO_APLICA';
  const notProvided = support.estado === 'NO_APORTADO';
  const date = dateDisplay(support.fechaDocumento);
  const detail = notApplicable
    ? 'N.A.'
    : notProvided
      ? 'NO APORTADO'
      : show(support.seTuvoEnCuenta);
  const minHeight =
    support.tipo === 'EPICRISIS_RESUMEN_HISTORIA' ||
    support.tipo === 'INVESTIGACION_ACCIDENTE'
      ? 58
      : 14;

  return (
    <View style={styles.row} wrap={false}>
      <Cell width="33%" minHeight={minHeight} align="center">
        <Text style={styles.supportName}>{support.label}</Text>
      </Cell>
      <Cell width="15%" minHeight={minHeight} align="center" bold={notApplicable}>
        {notApplicable ? 'N.A.' : date}
      </Cell>
      <Cell width="52%" minHeight={minHeight} align="center">
        <Text style={styles.longText}>{detail}</Text>
      </Cell>
    </View>
  );
}

function DiagnosisRows({ data }: { data: FormularioOrigenSnapshot }) {
  const diagnoses = data.diagnosticos ?? [];
  return (
    <>
      {[0, 1, 2, 3].map((row) => (
        <View key={row} style={styles.row} wrap={false}>
          {[0, 1].map((column) => {
            const index = row * 2 + column;
            const diagnosis = diagnoses[index];
            return (
              <View key={column} style={[styles.row, { width: '50%' }]}>
                <Cell
                  width="10%"
                  minHeight={row === 0 ? 32 : 14}
                  align="center"
                  bold
                  blue
                >
                  {`${index + 1}.`}
                </Cell>
                <Cell width="58%" minHeight={row === 0 ? 32 : 14} align="center">
                  <Text style={styles.longText}>{upper(diagnosis?.cie10Nombre)}</Text>
                </Cell>
                <Cell width="16%" minHeight={row === 0 ? 32 : 14} align="center">
                  CIE10
                </Cell>
                <Cell width="16%" minHeight={row === 0 ? 32 : 14} align="center">
                  {show(diagnosis?.cie10Codigo)}
                </Cell>
              </View>
            );
          })}
        </View>
      ))}
    </>
  );
}

function SignatureRow({
  member,
}: {
  member: NonNullable<FormularioOrigenSnapshot['junta']>[number];
}) {
  const documentLabel = member.numeroDocumento
    ? `${upper(member.tipoDocumento) || 'CC'}: ${member.numeroDocumento}`
    : '';
  const professionalIds = [
    documentLabel,
    member.registroMedico ? `RM: ${member.registroMedico}` : '',
    member.licencia ? `LIC. ${member.licencia}` : '',
  ]
    .filter(Boolean)
    .join(' - ');
  const credentials = [upper(member.especialidad), professionalIds]
    .filter(Boolean)
    .join('\n');

  return (
    <View style={styles.row} wrap={false}>
      <Cell width="24%" minHeight={50}>NOMBRE</Cell>
      <Cell width="28%" minHeight={50} align="center">
        <Text style={styles.signatureInfo}>
          {upper(member.nombreCompleto)}
          {credentials ? `\n${credentials}` : ''}
        </Text>
      </Cell>
      <Cell width="8%" minHeight={50} align="center">FIRMA</Cell>
      <Cell width="40%" minHeight={50} align="center">
        {member.firmaSrc ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={member.firmaSrc} style={styles.signatureImage} />
        ) : null}
      </Cell>
    </View>
  );
}

function PageOne({
  data,
  logoSrc,
}: {
  data: FormularioOrigenSnapshot;
  logoSrc?: string | null;
}) {
  const teacher = data.docente ?? {};
  const idType = upper(teacher.tipoDocumento);
  const sex = upper(teacher.sexo);
  const civil = upper(teacher.estadoCivil);
  const school = upper(teacher.escolaridad);
  const category = upper(teacher.categoria || teacher.tipoUsuario);
  const history = data.historialLaboral ?? [];
  const legacyName = legacyNameParts(teacher.nombreCompleto);
  const teacherName = {
    primerApellido: teacher.primerApellido || legacyName.primerApellido,
    segundoApellido: teacher.segundoApellido || legacyName.segundoApellido,
    primerNombre: teacher.primerNombre || legacyName.primerNombre,
    segundoNombre: teacher.segundoNombre || legacyName.segundoNombre,
  };
  const noAccident = data.sustentacion?.tipoEvento === 'ENFERMEDAD';
  const entity = {
    nombreContratista: data.entidad?.nombreContratista || 'IPS SISM',
    departamento: data.entidad?.departamento || 'Magdalena',
    direccion: data.entidad?.direccion || 'CRA 19 N 26B - 53 LOS NARANJOS',
    telefono: data.entidad?.telefono || '3205184998',
    municipio: data.entidad?.municipio || 'Santa Marta',
  };

  return (
    <Page size="LETTER" style={[styles.page, styles.pageOne]} wrap={false}>
      <View style={styles.table}>
        <View style={styles.row} wrap={false}>
          <View style={styles.logoCell}>
            {logoSrc ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={logoSrc} style={styles.logo} />
            ) : (
              <Text>SISM</Text>
            )}
          </View>
          <View style={styles.mainTitleCell}>
            <View style={styles.mainTitle}>
              <Text style={styles.mainTitleText}>
                FORMULARIO DE DICTAMEN PARA LA DETERMINACIÓN DEL ORIGEN DEL ACCIDENTE O{'\n'}
                LA ENFERMEDAD
              </Text>
            </View>
            <View style={styles.subTitle}>
              <Text style={styles.subTitleText}>1. INFORMACIÓN GENERAL DEL DICTAMEN</Text>
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <Cell width="33%" minHeight={13} align="center" blue>DICTAMEN NÚMERO</Cell>
          <Cell width="67%" minHeight={13} align="center">
            {show(data.documento?.numeroDictamenOrigen)}
          </Cell>
        </View>
        <View style={styles.row}>
          <Cell width="33%" minHeight={13} align="center" blue>FECHA DE RECEPCIÓN SOLICITUD</Cell>
          <Cell width="67%" minHeight={13} align="center">
            {dateDisplay(
              data.documento?.fechaRecepcionSolicitud ||
                data.documento?.fechaDictamenOrigen,
            )}
          </Cell>
        </View>
        <View style={styles.row}>
          <Cell width="33%" minHeight={13} align="center" blue>FECHA DEL DICTAMEN</Cell>
          <Cell width="67%" minHeight={13} align="center">
            {dateDisplay(data.documento?.fechaDictamenOrigen)}
          </Cell>
        </View>

        <SectionTitle>2. INFORMACIÓN GENERAL DE LA ENTIDAD CALIFICADORA</SectionTitle>
        <View style={styles.row}>
          <Cell width="33%" align="center">NOMBRE CONTRATISTA</Cell>
          <Cell width="35%" align="center">{entity.nombreContratista}</Cell>
          <Cell width="14%" align="center">DEPARTAMENTO</Cell>
          <Cell width="18%" align="center">{entity.departamento}</Cell>
        </View>
        <View style={styles.row}>
          <Cell width="33%" align="center">DIRECCIÓN</Cell>
          <Cell width="35%" align="center">{entity.direccion}</Cell>
          <Cell width="14%" align="center">TELÉFONO</Cell>
          <Cell width="18%" align="center">{entity.telefono}</Cell>
        </View>
        <View style={styles.row}>
          <Cell width="33%" align="center">ZONIFICACIÓN DEL CALIFICADO</Cell>
          <Cell width="35%" align="center">{zoneDisplay(teacher.zonaResidencia)}</Cell>
          <Cell width="14%" align="center">MUNICIPIO</Cell>
          <Cell width="18%" align="center">{teacher.municipio || entity.municipio}</Cell>
        </View>

        <SectionTitle>3. DATOS PERSONALES DEL CALIFICADO</SectionTitle>
        <View style={styles.row}>
          <Cell width="24%" blue>PRIMER APELLIDO</Cell>
          <Cell width="28%" blue>SEGUNDO APELLIDO</Cell>
          <Cell width="25%" blue>PRIMER NOMBRE</Cell>
          <Cell width="23%" blue>SEGUNDO NOMBRE</Cell>
        </View>
        <View style={styles.row}>
          <Cell width="24%" align="center">{upper(teacherName.primerApellido)}</Cell>
          <Cell width="28%" align="center">{upper(teacherName.segundoApellido)}</Cell>
          <Cell width="25%" align="center">{upper(teacherName.primerNombre)}</Cell>
          <Cell width="23%" align="center">{upper(teacherName.segundoNombre)}</Cell>
        </View>
        <View style={styles.row}>
          <Cell width="24%" blue>FECHA DE NACIMIENTO (D,M,A)</Cell>
          <Cell width="28%" blue align="center">TIPO DE IDENTIFICACIÓN</Cell>
          <Cell width="25%" blue>NÚMERO</Cell>
          <Cell width="18%" blue align="center">AFILIACIÓN</Cell>
          <Cell width="5%" blue align="center">EDAD</Cell>
        </View>
        <View style={styles.row}>
          <Cell width="24%" align="center">{dateDisplay(teacher.fechaNacimiento)}</Cell>
          <Cell width="28%" align="center">
            <View style={styles.choiceRow}>
              <Choice label="CC" selected={idType === 'CC'} />
              <Choice label="CE" selected={idType === 'CE'} />
              <Choice label="TI" selected={idType === 'TI'} />
            </View>
          </Cell>
          <Cell width="25%" align="center">{show(teacher.documento)}</Cell>
          <Cell width="18%" align="center">
            <View style={styles.choiceRow}>
              <Choice
                label="COT"
                selected={category.includes('CONTR') || category === 'CO'}
              />
              <Choice
                label="BEN"
                selected={category.includes('BEN') || category === 'BE'}
              />
            </View>
          </Cell>
          <Cell width="5%" align="center">{show(teacher.edad)}</Cell>
        </View>
        <View style={styles.row}>
          <Cell width="24%" blue>FECHA DE VINCULACIÓN</Cell>
          <Cell width="12%" blue align="center">GÉNERO</Cell>
          <Cell width="32%" blue align="center">ESTADO CIVIL</Cell>
          <Cell width="32%" blue align="center">ESCOLARIDAD</Cell>
        </View>
        <View style={styles.row}>
          <Cell width="24%" minHeight={28} align="center">
            {dateDisplay(teacher.fechaVinculacion) || 'N.A.'}
          </Cell>
          <Cell width="12%" minHeight={28} align="center">
            <View style={styles.choiceRow}>
              <Choice label="M" selected={sex === 'M' || sex === 'H'} />
              <Choice label="F" selected={sex === 'F'} />
            </View>
          </Cell>
          <Cell width="32%" minHeight={28} align="center">
            <View style={[styles.choiceRow, { flexWrap: 'wrap' }]}>
              {['SOLTERO', 'CASADO', 'SEPARADO', 'VIUDO', 'UNIÓN LIBRE'].map((item) => (
                <Choice
                  key={item}
                  label={item === 'UNIÓN LIBRE' ? 'U.L.' : item}
                  selected={civil.includes(item.replace('Ú', 'U')) || civil.includes(item)}
                />
              ))}
            </View>
          </Cell>
          <Cell width="32%" minHeight={28} align="center">
            <View style={[styles.choiceRow, { flexWrap: 'wrap' }]}>
              {['SECUNDARIA', 'TÉCNICO', 'UNIV', 'ESPEC', 'OTRO'].map((item) => (
                <Choice
                  key={item}
                  label={item}
                  selected={
                    school.includes(item) ||
                    (item === 'UNIV' && school.includes('PROFESIONAL')) ||
                    (item === 'ESPEC' && school.includes('ESPECIAL'))
                  }
                />
              ))}
            </View>
          </Cell>
        </View>

        <SectionTitle>4. ANTECEDENTES LABORALES DEL CALIFICADO</SectionTitle>
        <SectionTitle>4.1. DESCRIPCIÓN DEL CARGO ACTUAL</SectionTitle>
        <View style={styles.row}>
          <Cell width="36%" blue>ACTIVIDAD ECONÓMICA DE LA EMPRESA</Cell>
          <Cell width="21%" align="center">EDUCACIÓN FORMAL</Cell>
          <Cell width="27%" blue>DENOMINACIÓN CARGO ACTUAL</Cell>
          <Cell width="16%" align="center" fontSize={6.2}>
            {upper(teacher.cargo || history[0]?.cargoNombreSnapshot)}
          </Cell>
        </View>
        <View style={styles.row}>
          <Cell width="36%" blue>ANTIGÜEDAD EN LA EMPRESA (EN MESES)</Cell>
          <Cell width="21%" align="center">
            {monthDiff(teacher.fechaVinculacion, data.documento?.fechaDictamenOrigen)}
          </Cell>
          <Cell width="27%" blue align="center">ANTIGÜEDAD EN EL CARGO</Cell>
          <Cell width="16%" />
        </View>
        <View style={styles.row}>
          <Cell width="36%" blue>ACTIVIDADES EXTRALABORALES</Cell>
          <Cell width="21%" align="center">
            <View style={styles.choiceRow}>
              <Choice label="SI" selected={false} />
              <Choice label="NO" selected={false} />
            </View>
          </Cell>
          <Cell width="43%" />
        </View>
        <View style={styles.row}>
          <View style={styles.largeDescriptionCell}>
            <Text>DESCRIPCIÓN DE LAS TAREAS DEL CARGO</Text>
          </View>
          <View style={styles.largeDescriptionValue}>
            <Text style={styles.descriptionText}>{show(data.descripcion)}</Text>
          </View>
        </View>

        <SectionTitle>4.2. HISTORIA OCUPACIONAL</SectionTitle>
        <View style={styles.row}>
          <Cell width="5%" minHeight={22} align="center" bold fontSize={6.5}>ITEM</Cell>
          <Cell width="28%" minHeight={22} align="center" bold fontSize={6.5}>ENTIDAD (EMPRESA)</Cell>
          <Cell width="19%" minHeight={22} align="center" bold fontSize={6.5}>CARGO/OFICIO</Cell>
          <Cell width="20%" minHeight={22} align="center" bold fontSize={6.5}>RIESGOS</Cell>
          <Cell width="13%" minHeight={22} align="center" bold fontSize={6.5}>JORNADA LABORAL</Cell>
          <Cell width="15%" minHeight={22} align="center" bold fontSize={6.2}>
            <Text style={{ fontSize: 5.2, lineHeight: 1.1 }}>
              TIEMPO DE EXPOSICIÓN{'\n'}EN AÑOS
            </Text>
          </Cell>
        </View>
        {(history.length ? history : [{}]).slice(0, 1).map((item, index) => (
          <View key={index} style={styles.row}>
            <Cell width="5%" minHeight={35} align="center" bold>{index + 1}</Cell>
            <Cell width="28%" minHeight={35} align="center">{upper(item.institucionNombreSnapshot)}</Cell>
            <Cell width="19%" minHeight={35} align="center">{upper(item.cargoNombreSnapshot)}</Cell>
            <Cell width="20%" minHeight={35} align="center">{upper(item.riesgosLaborales)}</Cell>
            <Cell width="13%" minHeight={35} align="center">{upper(item.jornadaLaboral)}</Cell>
            <Cell width="15%" minHeight={35} align="center">{show(item.tiempoExposicionAnios)}</Cell>
          </View>
        ))}
        <View style={styles.row}>
          <Cell width="100%" minHeight={14} />
        </View>

        <SectionTitle>5. INFORMACIÓN SOBRE EL ACCIDENTE</SectionTitle>
        <View style={styles.row}>
          <Cell width="30%" align="center">FECHA DE OCURRENCIA</Cell>
          <Cell width="22%" align="center">HORA (0 - 24 H)</Cell>
          <Cell width="25%" align="center">DÍA DE LA SEMANA</Cell>
          <Cell width="23%" align="center">JORNADA</Cell>
        </View>
        <View style={styles.row}>
          <Cell width="30%" align="center" bold>
            {noAccident ? 'N.A.' : dateDisplay(data.informacion?.fechaOcurrencia)}
          </Cell>
          <Cell width="22%" align="center">
            {noAccident ? 'N.A.' : show(data.informacion?.horaOcurrencia)}
          </Cell>
          <Cell width="25%" align="center">
            {noAccident ? 'N.A.' : upper(data.informacion?.diaSemana)}
          </Cell>
          <Cell width="23%" align="center">
            <View style={styles.choiceRow}>
              <Choice
                label="Extra"
                selected={!noAccident && data.informacion?.jornadaEvento === 'EXTRA'}
              />
              <Choice
                label="Normal"
                selected={!noAccident && data.informacion?.jornadaEvento === 'NORMAL'}
              />
            </View>
          </Cell>
        </View>

        <View wrap={false}>
          <SectionTitle>6. FUNDAMENTOS DE LA CALIFICACIÓN</SectionTitle>
          <SectionTitle>6.1 RELACIÓN DE DOCUMENTOS</SectionTitle>
          <View style={styles.row}>
            <Cell width="33%" align="center" bold fontSize={6.5}>DOCUMENTO</Cell>
            <Cell width="15%" align="center" bold fontSize={6.5}>FECHA</Cell>
            <Cell width="52%" align="center" bold fontSize={6.5}>SE TUVO EN CUENTA</Cell>
          </View>
        </View>
      </View>
    </Page>
  );
}

function PageTwo({ data }: { data: FormularioOrigenSnapshot }) {
  const signatures = data.junta ?? [];

  return (
    <>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.table}>
          {supportRows(data).map((support, index) => (
            <SupportRow key={`${support.tipo}-${index}`} support={support} />
          ))}
          <View style={styles.row}><Cell width="100%" minHeight={14} /></View>

          <SectionTitle>6.2 DIAGNÓSTICOS MOTIVO DE LA CALIFICACIÓN DEL EVENTO</SectionTitle>
          <DiagnosisRows data={data} />

          <SectionTitle>7. SUSTENTACIÓN</SectionTitle>
          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitleText}>CONCEPTO</Text>
          </View>
          <View style={styles.row}>
            <Cell width="100%" minHeight={56} align="center" padding={7}>
              <Text style={styles.longText}>{show(data.sustentacion?.concepto)}</Text>
            </Cell>
          </View>
          <View style={[styles.sectionTitle, { minHeight: 33 }]}>
            <Text style={styles.sectionTitleText}>7.1. FUNDAMENTOS DE DERECHO</Text>
          </View>
          <View style={styles.row}>
            <Cell width="100%" minHeight={55} align="center" padding={7}>
              <Text style={styles.longText}>
                {show(data.sustentacion?.fundamentosDerecho)}
              </Text>
            </Cell>
          </View>
          <SectionTitle>7.2 CALIFICACIÓN DEL ORIGEN</SectionTitle>
          <View style={styles.row}>
            <Cell width="24%" align="center" blue bold>EVENTO</Cell>
            <Cell width="31%" align="center" bold>
              {data.sustentacion?.tipoEvento === 'ACCIDENTE'
                ? 'ACCIDENTE DE TRABAJO'
                : 'ENFERMEDAD'}
            </Cell>
            <Cell width="20%" align="center" blue bold>ORIGEN</Cell>
            <Cell width="25%" align="center" bold>
              {data.sustentacion?.origenEvento === 'LABORAL'
                ? data.sustentacion?.tipoEvento === 'ACCIDENTE'
                  ? 'ACCIDENTE LABORAL'
                  : 'ENFERMEDAD LABORAL'
                : 'ORIGEN COMÚN'}
            </Cell>
          </View>
          <View style={styles.row}><Cell width="100%" minHeight={14} /></View>

          <View style={styles.signaturesHeader}>
            <Text style={styles.sectionTitleText}>8. RESPONSABLE (S) DE LA CALIFICACIÓN</Text>
          </View>
          {signatures.slice(0, 2).map((member, index) => (
            <SignatureRow key={index} member={member} />
          ))}
        </View>
      </Page>

      {signatures.length > 2 ? (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.table}>
            {signatures.slice(2).map((member, index) => (
              <SignatureRow key={index} member={member} />
            ))}
          </View>
        </Page>
      ) : null}
    </>
  );
}

export function FormularioOrigenPdf({
  data,
  logoSrc,
}: {
  data: FormularioOrigenSnapshot;
  logoSrc?: string | null;
}) {
  return (
    <Document
      title={`Formulario de Origen ${show(data.documento?.numeroDictamenOrigen)}`}
      author="SISM"
    >
      <PageOne data={data} logoSrc={logoSrc} />
      <PageTwo data={data} />
    </Document>
  );
}
