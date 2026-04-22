/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

type DictamenLike = {
  id?: number | string | null;
  numeroDictamen?: string | null;
  fechaDictamen?: string | Date | null;
  fechaNotificacionPcl?: string | Date | null;
  procedimientoPcl?: unknown;
  totalTitulo1?: unknown;
  totalCap1?: unknown;
  totalCap2?: unknown;
  totalTitulo3?: unknown;
  totalPcl?: unknown;
  pclTotal?: unknown;
  tituloI?: unknown;
  tituloII?: unknown;
  tituloIII?: unknown;
  usuario?: unknown;
  notificacionPcl?: unknown;
};

type Props = {
  dictamen: DictamenLike;
  logoSrc?: string | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function readString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

function readNumber(value: unknown): number | null {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function getFullName(persona: Record<string, unknown>) {
  return [
    readString(persona.primerNombre),
    readString(persona.segundoNombre),
    readString(persona.primerApellido),
    readString(persona.segundoApellido),
  ]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toBogotaDateParts(value?: string | Date | null) {
  const date = value ? (typeof value === 'string' ? new Date(value) : value) : new Date();
  if (Number.isNaN(date.getTime())) return null;

  const formatter = new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: 'America/Bogota',
  });

  const parts = formatter.formatToParts(date);
  const day = Number(parts.find((part) => part.type === 'day')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const year = Number(parts.find((part) => part.type === 'year')?.value);

  if (!day || !month || !year) return null;
  return { day, month, year };
}

function formatLongDate(value?: string | Date | null) {
  const parts = toBogotaDateParts(value);
  if (!parts) return '—';

  return `${parts.day} ${MONTHS[parts.month - 1]} ${parts.year}`;
}

function titleCase(value: string) {
  return value
    .toLocaleLowerCase('es-CO')
    .replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase('es-CO'));
}

function normalizePlain(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function formatLugar(sede: Record<string, unknown>) {
  const municipio = readString(sede.municipio) ?? 'Santa Marta';
  const normalized = normalizePlain(municipio);

  if (normalized.includes('SANTA MARTA')) return 'Santa Marta D.T.C.H';
  return titleCase(municipio);
}

function formatPercent(value: number | null) {
  if (value == null) return '—';
  const capped = Math.min(value, 100);
  return Number.isInteger(capped) ? `${capped}%` : `${capped.toFixed(1)}%`;
}

function resolvePclTotal(dictamen: DictamenLike) {
  const tituloI = asRecord(dictamen.tituloI);
  const tituloII = asRecord(dictamen.tituloII);
  const tituloIII = asRecord(dictamen.tituloIII);
  const capitulo1 = asRecord(tituloII.capitulo1);
  const capitulo2 = asRecord(tituloII.capitulo2);

  const explicit = readNumber(dictamen.totalPcl ?? dictamen.pclTotal);
  if (explicit != null) return explicit;

  const procedimiento = String(dictamen.procedimientoPcl ?? 'A').toUpperCase() === 'B' ? 'B' : 'A';
  const values = [
    readNumber(dictamen.totalTitulo1 ?? tituloI.valorTotal),
    readNumber(dictamen.totalCap1 ?? capitulo1.valorTotal),
    readNumber(dictamen.totalCap2 ?? capitulo2.valorTotal),
  ];

  if (procedimiento === 'A') {
    values.push(readNumber(dictamen.totalTitulo3 ?? tituloIII.valorTotal));
  }

  let total = 0;
  let hasAny = false;
  for (const value of values) {
    if (value == null) continue;
    total += value;
    hasAny = true;
  }

  return hasAny ? total : null;
}

export function NotificacionPclPage({ dictamen, logoSrc }: Props) {
  const usuario = asRecord(dictamen.usuario);
  const notificacion = asRecord(dictamen.notificacionPcl);
  const sede = asRecord(notificacion.sede);
  const notificador = asRecord(notificacion.notificador);

  const docenteNombre = getFullName(usuario) || '—';
  const docenteDireccion = readString(usuario.direccion) ?? '—';
  const docenteTelefono = readString(usuario.telefono) ?? '—';
  const docenteDocumento = readString(usuario.identificacion ?? usuario.numeroDocumento ?? usuario.documento) ?? '—';

  const notificadorNombre = readString(notificador.nombreCompleto) ?? 'Sin notificador asignado';
  const notificadorDocumento = readString(notificador.numeroIdentidad) ?? '—';
  const firmaSrc = readString(notificador.firmaSrc);

  const numeroDictamen = readString(dictamen.numeroDictamen) ?? readString(dictamen.id) ?? '—';
  const pclTotal = formatPercent(resolvePclTotal(dictamen));
  const lugar = formatLugar(sede);
  const fecha = formatLongDate(dictamen.fechaNotificacionPcl ?? dictamen.fechaDictamen ?? null);

  const footerAddress = readString(sede.direccion) ?? 'Carrera. 19 N° 26B - 53 Barrio Los Naranjos';
  const footerPhone = readString(sede.telefono) ?? '(5) 439 4152 - 439 4153 - 3145358604';

  return (
    <Page size="LETTER" style={styles.page} wrap={false}>
      <View style={styles.content}>
        <View style={styles.logoWrap}>
          {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : null}
        </View>

        <Text style={styles.dateLine}>{lugar}, {fecha}</Text>

        <View style={styles.recipientBlock}>
          <Text style={styles.normalBold}>Señor(a):</Text>
          <View style={styles.recipientData}>
            <Text style={styles.recipientName}>
              <Text style={styles.normalBold}>Nombre: </Text>{docenteNombre}
            </Text>
            <Text style={styles.normalBold}>Dirección: <Text style={styles.normal}>{docenteDireccion}</Text></Text>
            <Text style={styles.normalBold}>Teléfono: <Text style={styles.normal}>{docenteTelefono}</Text></Text>
          </View>
        </View>

        <Text style={styles.subject}>
          <Text style={styles.normalBold}>Asunto: </Text>Notificación de dictamen de calificación de invalidez.
        </Text>

        <Text style={styles.greeting}>Respetado(a) Señor(a):</Text>

        <Text style={styles.paragraph}>
          Por medio de la presente, le informamos que hemos realizado la valoración del porcentaje de la Pérdida de
          Capacidad Laboral (PCL) de acuerdo con lo establecido en el Código Sustantivo del Trabajo (Artículos 202,
          208, 280), la Ley 912 de 2003, el artículo 81 del Manual Único de Calificación de Invalidez, y el Decreto
          1655 de 2015, según corresponda. El dictamen emitido es el N° {numeroDictamen}, determinándose una Pérdida
          de Capacidad Laboral del {pclTotal}.
        </Text>

        <Text style={styles.paragraph}>
          En caso de que no esté de acuerdo con el presente dictamen, le recordamos que puede presentar su
          inconformidad dentro de los 10 días siguientes, conforme lo establece el Decreto Ley 019 de 2012, Artículo
          142. En este caso, la entidad deberá remitir el caso ante las Juntas Regionales de Calificación de Invalidez.
        </Text>

        <Text style={styles.paragraph}>
          El trámite ante la Junta Regional de Calificación de Invalidez se llevará a cabo solo después de realizarse
          la calificación correspondiente por parte de los profesionales o entidades calificadoras competentes o las
          designadas por el Fondo Nacional de Prestaciones Sociales del Magisterio.
        </Text>

        <Text style={styles.paragraph}>
          Además, le notificamos que, en virtud de los requisitos establecidos en el Decreto 1655 de 2015, sección 8,
          Artículo 2.4.4.3.1, Parágrafo 2, a los educadores a quienes se les haya reconocido pensión de invalidez, se
          les realizará una valoración médica cada tres (3) años con el fin de determinar si se aumentará, disminuirá,
          mantendrá o extinguirá la pensión.
        </Text>

        <View style={styles.table}>
          <View style={styles.tableRowTop}>
            <View style={styles.tableCell}>
              {firmaSrc ? <Image src={firmaSrc} style={styles.signature} /> : <View style={styles.signaturePlaceholder} />}
              <Text style={styles.tableText}>
                <Text style={styles.normalBold}>Notificador: </Text>{notificadorNombre}
              </Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellLast]}>
              <View style={styles.signaturePlaceholder} />
              <Text style={styles.tableText}>
                <Text style={styles.normalBold}>Notificado: </Text>{docenteNombre}
              </Text>
            </View>
          </View>
          <View style={styles.tableRowBottom}>
            <View style={styles.tableCell}>
              <Text style={styles.tableText}><Text style={styles.normalBold}>CC: </Text>{notificadorDocumento}</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellLast]}>
              <Text style={styles.tableText}><Text style={styles.normalBold}>CC: </Text>{docenteDocumento}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.finalParagraph}>
          Le recordamos que, una vez admitida y notificada esta información, debe presentarse ante su Secretaría de
          Educación dentro de las 24 horas siguientes para iniciar el trámite de la Pensión de Invalidez, conforme a lo
          dispuesto en el Decreto 1655 de 2015.
        </Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{footerAddress}</Text>
          <Text style={styles.footerText}>Tels. {footerPhone} Santa Marta D.T.C.H.</Text>
          <Text style={styles.footerEmail}>serviciosintegrales_saludmagdale@yahoo.com</Text>
        </View>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingHorizontal: 64,
    paddingBottom: 26,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#1f2933',
  },
  content: {
    flexGrow: 1,
  },
  logoWrap: {
    width: 212,
    height: 62,
    justifyContent: 'center',
  },
  logo: {
    width: 210,
    height: 60,
    objectFit: 'contain',
  },
  dateLine: {
    marginTop: 4,
    fontSize: 11,
  },
  recipientBlock: {
    marginTop: 24,
  },
  recipientData: {
    marginTop: 17,
  },
  recipientName: {
    fontSize: 11.8,
    fontWeight: 700,
    lineHeight: 1.12,
  },
  subject: {
    marginTop: 15,
    fontSize: 11,
  },
  greeting: {
    marginTop: 16,
    fontSize: 11,
    fontWeight: 700,
  },
  paragraph: {
    marginTop: 12,
    fontSize: 10.9,
    lineHeight: 1.16,
    textAlign: 'justify',
  },
  finalParagraph: {
    marginTop: 10,
    fontSize: 10.9,
    lineHeight: 1.16,
    textAlign: 'justify',
  },
  normal: {
    fontWeight: 400,
  },
  normalBold: {
    fontWeight: 700,
  },
  table: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#000000',
  },
  tableRowTop: {
    flexDirection: 'row',
    minHeight: 46,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  tableRowBottom: {
    flexDirection: 'row',
    minHeight: 18,
  },
  tableCell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 3,
    justifyContent: 'flex-end',
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  tableText: {
    fontSize: 10.2,
    lineHeight: 1.1,
  },
  signature: {
    width: 104,
    height: 22,
    objectFit: 'contain',
    marginBottom: 2,
  },
  signaturePlaceholder: {
    height: 22,
    marginBottom: 2,
  },
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9.8,
    color: '#1F4E78',
    fontWeight: 700,
    textAlign: 'center',
    lineHeight: 1.2,
  },
  footerEmail: {
    marginTop: 2,
    fontSize: 9.9,
    color: '#1F4E78',
    fontWeight: 700,
    textAlign: 'center',
  },
});