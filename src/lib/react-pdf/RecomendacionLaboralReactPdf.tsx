/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Document, Image, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';

import { PageFrame } from '@/lib/react-pdf/components/PageFrame';
import { pdfTheme } from '@/lib/react-pdf/theme';

type FirmaPdf = {
  nombre: string;
  especialidad: string | null;
  registroMedico: string | null;
  licencia: string | null;
  firmaSrc: string | null;
};

type RecomendacionLaboralPdfData = {
  numeroReferencia: string | null;
  fechaAtencion: string;
  docente: {
    nombreCompleto: string;
    documento: string;
    genero: string | null;
    estadoCivil: string | null;
    empresa: string | null;
    cargo: string | null;
    secretaria: string | null;
    institucion: string | null;
    direccion: string | null;
    telefono: string | null;
    edad: string | null;
    talla: string | null;
    peso: string | null;
    imc: string | null;
  };
  examenesRealizados: string;
  motivo: string;
  recomendaciones: string;
  firmas: FirmaPdf[];
};

type Props = {
  recomendacion: RecomendacionLaboralPdfData;
  logoSrc?: string | null;
};

const SERVICE_NAME = 'Servicios Integrales de Salud del Magdalena';
const SERVICE_LINES = [
  'NIT: 900 018 045 - 5',
  'Lic. SST Res. 045/2023 SSSM',
  'Direccion: Cra 19 # 28B-53 - Barrio Los Naranjos',
  'Telefonos: 4304153, 4394152',
  'serviciosintegrales_saludmagdale@yahoo.com',
];

const styles = StyleSheet.create({
  pageWrap: {
    gap: 10,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingBottom: 6,
  },
  logoWrap: {
    width: 180,
    height: 56,
    justifyContent: 'center',
  },
  logo: {
    width: 170,
    height: 52,
    objectFit: 'contain',
  },
  providerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  providerTitle: {
    fontSize: 8.8,
    fontWeight: 700,
    color: '#224f94',
    textAlign: 'center',
  },
  providerLine: {
    fontSize: 7.4,
    color: '#224f94',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  titleRow: {
    flexDirection: 'row',
    borderWidth: pdfTheme.sizes.borderWidth,
    borderColor: pdfTheme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  titleMain: {
    flex: 1,
    backgroundColor: '#3f69b1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  titleMainText: {
    color: '#ffffff',
    fontSize: 10.4,
    fontWeight: 700,
    textAlign: 'center',
  },
  titleMeta: {
    width: 145,
    backgroundColor: '#dbe6f7',
    borderLeftWidth: pdfTheme.sizes.borderWidth,
    borderLeftColor: pdfTheme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  titleMetaLabel: {
    fontSize: 6.8,
    color: '#224f94',
    marginBottom: 1,
  },
  titleMetaValue: {
    fontSize: 7.2,
    fontWeight: 700,
    color: '#224f94',
    textTransform: 'uppercase',
    lineHeight: 1.15,
  },
  sectionTitle: {
    backgroundColor: '#c9d8ee',
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  sectionTitleText: {
    fontSize: 8.6,
    fontWeight: 700,
    color: '#224f94',
  },
  sectionTitleTextCentered: {
    textAlign: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 18,
    paddingHorizontal: 4,
  },
  infoColumn: {
    flex: 1,
    gap: 4,
  },
  infoColumnRight: {
    flex: 1,
    gap: 4,
    paddingLeft: 34,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  infoLabel: {
    width: 66,
    fontSize: 7.9,
    fontWeight: 700,
    color: '#224f94',
  },
  infoLabelRight: {
    width: 78,
    fontSize: 7.9,
    fontWeight: 700,
    color: '#224f94',
  },
  infoValue: {
    flex: 1,
    fontSize: 8,
    color: '#1a3f79',
    lineHeight: 1.2,
  },
  bodyText: {
    fontSize: 7.9,
    color: '#16386d',
    lineHeight: 1.22,
    textAlign: 'left',
    paddingHorizontal: 2,
  },
  compactText: {
    fontSize: 7.6,
    color: '#16386d',
    lineHeight: 1.2,
    textAlign: 'left',
    paddingHorizontal: 2,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 2,
    paddingTop: 2,
  },
  checkboxLabel: {
    fontSize: 8,
    color: '#16386d',
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkboxBox: {
    width: 12,
    height: 12,
    borderWidth: pdfTheme.sizes.borderWidth,
    borderColor: '#224f94',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMark: {
    fontSize: 8,
    color: '#224f94',
    fontWeight: 700,
    lineHeight: 1,
  },
  sveWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 2,
    paddingTop: 3,
  },
  signatureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    paddingTop: 4,
  },
  signatureCard: {
    width: '47%',
    alignItems: 'center',
    paddingTop: 4,
  },
  signatureImageWrap: {
    width: 140,
    height: 54,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  signatureImage: {
    maxWidth: 140,
    maxHeight: 50,
    objectFit: 'contain',
  },
  signatureLine: {
    width: 132,
    borderBottomWidth: pdfTheme.sizes.borderWidth,
    borderBottomColor: '#224f94',
    marginBottom: 6,
  },
  signatureName: {
    fontSize: 8.1,
    fontWeight: 700,
    color: '#224f94',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  signatureSpecialty: {
    fontSize: 7.1,
    color: '#224f94',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  signatureMeta: {
    fontSize: 7.1,
    color: '#224f94',
    textAlign: 'center',
    marginTop: 2,
  },
  sectionBlock: {
    gap: 4,
  },
  flowSpacer: {
    height: 4,
  },
});

function showValue(value: string | null | undefined, fallback = '—') {
  const normalized = String(value ?? '').trim();
  return normalized.length > 0 ? normalized : fallback;
}

function isListLine(line: string) {
  const trimmed = line.trim();
  return /^[-*•]/.test(trimmed) || /^\d+[.)-]\s*/.test(trimmed);
}

type FlowingTextItem =
  | { text: string; kind: 'paragraph' | 'list' }
  | { kind: 'spacer' };

function normalizeFlowingText(value: string | null | undefined, fallback = '—'): FlowingTextItem[] {
  const normalized = String(value ?? '').replace(/\r\n/g, '\n').trim();
  if (!normalized) return [{ text: fallback, kind: 'paragraph' as const }];

  const items: FlowingTextItem[] = [];

  for (const rawLine of normalized.split('\n')) {
    const text = rawLine.replace(/\s+/g, ' ').trim();

    if (!text) {
      if (items.length > 0 && items[items.length - 1]?.kind !== 'spacer') {
        items.push({ kind: 'spacer' });
      }
      continue;
    }

    items.push({
      text,
      kind: isListLine(text) ? 'list' : 'paragraph',
    });
  }

  while (items[items.length - 1]?.kind === 'spacer') {
    items.pop();
  }

  return items.length > 0 ? items : [{ text: fallback, kind: 'paragraph' as const }];
}

function SectionTitle({
  children,
  centered = false,
}: {
  children: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <View style={styles.sectionTitle}>
      <Text
        style={[
          styles.sectionTitleText,
          ...(centered ? [styles.sectionTitleTextCentered] : []),
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

function InfoItem({
  label,
  value,
  labelStyle,
}: {
  label: string;
  value: string | null | undefined;
  labelStyle?: Style;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, ...(labelStyle ? [labelStyle] : [])]}>{label}</Text>
      <Text style={styles.infoValue}>{showValue(value)}</Text>
    </View>
  );
}

function SignatureCard({ firma }: { firma: FirmaPdf }) {
  return (
    <View style={styles.signatureCard} wrap={false}>
      <View style={styles.signatureImageWrap}>
        {firma.firmaSrc ? (
          <Image src={firma.firmaSrc} style={styles.signatureImage} />
        ) : (
          <View style={styles.signatureLine} />
        )}
      </View>

      <Text style={styles.signatureName}>{showValue(firma.nombre, 'Sin firma registrada')}</Text>

      {firma.especialidad ? (
        <Text style={styles.signatureSpecialty}>{firma.especialidad}</Text>
      ) : null}

      <Text style={styles.signatureMeta}>
        Registro Medico: {showValue(firma.registroMedico)}
      </Text>

      {firma.licencia ? (
        <Text style={styles.signatureMeta}>Licencia: {firma.licencia}</Text>
      ) : null}
    </View>
  );
}

function FlowingText({
  value,
  style,
  fallback = '—',
}: {
  value: string | null | undefined;
  style: Style | Style[];
  fallback?: string;
}) {
  const items = normalizeFlowingText(value, fallback);

  return (
    <View style={styles.sectionBlock}>
      {items.map((item, index) =>
        item.kind === 'spacer' ? (
          <View key={[item.kind, index].join('-')} style={styles.flowSpacer} />
        ) : (
          <Text key={[item.kind, index].join('-')} style={style}>
            {item.text}
          </Text>
        ),
      )}
    </View>
  );
}

export function RecomendacionLaboralReactPdf({ recomendacion, logoSrc }: Props) {
  const firmas = recomendacion.firmas.length > 0 ? recomendacion.firmas : [];

  return (
    <Document>
      <PageFrame safeBottom={20} pageNumberBottom={14}>
        <View style={styles.pageWrap}>
          <View style={styles.topHeader}>
            <View style={styles.logoWrap}>
              {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : null}
            </View>

            <View style={styles.providerWrap}>
              <Text style={styles.providerTitle}>{SERVICE_NAME}</Text>
              {SERVICE_LINES.map((line) => (
                <Text key={line} style={styles.providerLine}>
                  {line}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.titleRow}>
            <View style={styles.titleMain}>
              <Text style={styles.titleMainText}>
                Dictamen Medico Del Comite De Medicina Laboral
              </Text>
            </View>
            <View style={styles.titleMeta}>
              <Text style={styles.titleMetaLabel}>Tipo de Certificacion:</Text>
              <Text style={styles.titleMetaValue}>Recomendacion Medico Laborales</Text>
            </View>
          </View>

          <SectionTitle centered>1. Informacion General del Docente</SectionTitle>

          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <InfoItem label="Paciente:" value={recomendacion.docente.nombreCompleto} />
              <InfoItem label="ID:" value={recomendacion.docente.documento} />
              <InfoItem label="Genero:" value={recomendacion.docente.genero} />
              <InfoItem label="Estado Civil:" value={recomendacion.docente.estadoCivil} />
              <InfoItem label="Empresa:" value={recomendacion.docente.empresa} />
              <InfoItem label="Cargo:" value={recomendacion.docente.cargo} />
              <InfoItem label="Institucion:" value={recomendacion.docente.institucion} />
            </View>

            <View style={[styles.infoColumn, styles.infoColumnRight]}>
              <InfoItem label="Fecha de Atencion:" value={recomendacion.fechaAtencion} labelStyle={styles.infoLabelRight} />
              <InfoItem label="Talla:" value={recomendacion.docente.talla} labelStyle={styles.infoLabelRight} />
              <InfoItem label="Peso:" value={recomendacion.docente.peso} labelStyle={styles.infoLabelRight} />
              <InfoItem label="IMC:" value={recomendacion.docente.imc} labelStyle={styles.infoLabelRight} />
              <InfoItem label="Edad:" value={recomendacion.docente.edad ? `${recomendacion.docente.edad} AÑOS` : recomendacion.docente.edad} labelStyle={styles.infoLabelRight} />
              <InfoItem label="Direccion:" value={recomendacion.docente.direccion} labelStyle={styles.infoLabelRight} />
              <InfoItem label="Telefono:" value={recomendacion.docente.telefono} labelStyle={styles.infoLabelRight} />
              <InfoItem label="Secretaria:" value={recomendacion.docente.secretaria} labelStyle={styles.infoLabelRight} />
            </View>
          </View>

          <SectionTitle>2. Examenes Realizados.</SectionTitle>
          <FlowingText value={recomendacion.examenesRealizados} style={styles.bodyText} fallback="Sin registro" />

          <SectionTitle>3. Motivo.</SectionTitle>
          <FlowingText value={recomendacion.motivo} style={styles.bodyText} fallback="Sin registro" />

          <SectionTitle>4. Recomendaciones, Observaciones y Restricciones.</SectionTitle>
          <FlowingText value={recomendacion.recomendaciones} style={styles.compactText} fallback="Sin registro" />

          <SectionTitle>5. Junta Medica de Profesionales:</SectionTitle>
          <View style={styles.signatureGrid}>
            {firmas.length > 0 ? (
              firmas.map((firma, index) => <SignatureCard key={`${firma.nombre}-${index}`} firma={firma} />)
            ) : (
              <Text style={styles.bodyText}>Sin firmas registradas.</Text>
            )}
          </View>
        </View>
      </PageFrame>
    </Document>
  );
}
