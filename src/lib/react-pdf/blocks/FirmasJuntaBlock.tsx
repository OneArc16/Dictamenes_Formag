import React from 'react';
import { View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type JuntaMember = {
  nombreCompleto?: string | null;
  tratamiento?: string | null;
  firmaSrc?: string | null;
  registroMedico?: string | null;
  licencia?: string | null;
};

type DictamenLike = {
  junta?: unknown;
};

type Props = { dictamen: DictamenLike };

const BW = Number(pdfTheme?.sizes?.borderWidth ?? 0.85);
const BC = pdfTheme.colors.border;

const COLOR = {
  blue: '#9BC2E6',
  light: '#E0EDF8',
  white: '#FFFFFF',
};

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function formatNombreConTratamiento(it: JuntaMember | null | undefined) {
  const nombre = String(it?.nombreCompleto ?? '').trim();
  if (!nombre) return '';

  if (/^(dr\.?|dra\.?)\s/i.test(nombre)) return nombre;

  const t = String(it?.tratamiento ?? '').trim().toUpperCase();
  const pref = t === 'DRA' ? 'Dra.' : t === 'DR' ? 'Dr.' : '';

  return pref ? `${pref} ${nombre}` : nombre;
}

export default function FirmasJuntaBlock({ dictamen }: Props) {
  const juntaRaw = Array.isArray(dictamen?.junta) ? dictamen.junta : [];
  const junta = juntaRaw as JuntaMember[];
  const cols = 3;
  const rows = chunk(junta, cols);

  return (
    <View style={styles.box} minPresenceAhead={32}>
      <View style={styles.header} wrap={false}>
        <Text style={styles.headerText}>FIRMAS JUNTA MÉDICA</Text>
      </View>

      <View style={styles.body}>
        {rows.length === 0 ? (
          <View style={styles.row} wrap={false}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.card}>
                <View style={styles.signArea} />
                <View style={styles.line} />
                <Text style={styles.name} />
                <Text style={styles.meta} />
              </View>
            ))}
          </View>
        ) : (
          rows.map((r, idx) => (
            <View key={idx} style={styles.row} wrap={false}>
              {Array.from({ length: cols }).map((_, j) => {
                const it: JuntaMember | undefined = r[j];
                return (
                  <View key={j} style={styles.card}>
                    <View style={styles.signArea}>
                      {it?.firmaSrc ? <Image src={it.firmaSrc} style={styles.signImg} /> : null}
                    </View>

                    <View style={styles.line} />

                    <Text style={styles.name}>{formatNombreConTratamiento(it)}</Text>

                    <Text style={styles.meta}>
                      {it?.registroMedico ? `RM: ${it.registroMedico}` : ''}
                      {it?.registroMedico && it?.licencia ? '  ' : ''}
                      {it?.licencia ? `Lic: ${it.licencia}` : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '100%',
    borderWidth: BW,
    borderColor: BC,
  },
  header: {
    backgroundColor: COLOR.blue,
    borderBottomWidth: BW,
    borderBottomColor: BC,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: { fontSize: 8, fontWeight: 700 },

  body: {
    backgroundColor: COLOR.white,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },

  row: { flexDirection: 'row', width: '100%' },

  card: {
    width: '33.3333%',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },

  signArea: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR.white,
  },

  signImg: {
    width: '90%',
    height: 46,
    objectFit: 'contain',
  },

  line: {
    marginTop: 2,
    borderBottomWidth: 1,
    borderBottomColor: BC,
  },

  name: {
    marginTop: 3,
    fontSize: 7.5,
    fontWeight: 700,
    textAlign: 'center',
  },

  meta: {
    marginTop: 2,
    fontSize: 7,
    textAlign: 'center',
  },
});



