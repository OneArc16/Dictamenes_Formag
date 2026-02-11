import React from 'react';
import { View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = { dictamen: any };

const BW = 1.2;
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

export default function FirmasJuntaBlock({ dictamen }: Props) {
  const junta = Array.isArray(dictamen?.junta) ? dictamen.junta : [];

  // si no hay junta, igual dejamos el bloque (para mantener formato)
  const cols = 3;
  const rows = chunk(junta, cols);

  return (
    <View style={styles.box} wrap={false} minPresenceAhead={220}>
      {/* Header */}
      <View style={styles.header} wrap={false}>
        <Text style={styles.headerText}>FIRMAS JUNTA MÉDICA</Text>
      </View>

      {/* Body */}
      <View style={styles.body} wrap={false}>
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
                const it = r[j];
                return (
                  <View key={j} style={styles.card}>
                    <View style={styles.signArea}>
                      {it?.firmaSrc ? (
                        <Image src={it.firmaSrc} style={styles.signImg} />
                      ) : null}
                    </View>

                    <View style={styles.line} />

                    <Text style={styles.name}>{it?.nombreCompleto ?? ''}</Text>

                    <Text style={styles.meta}>
                      {(it?.registroMedico ? `RM: ${it.registroMedico}` : '')}
                      {(it?.registroMedico && it?.licencia ? '  ' : '')}
                      {(it?.licencia ? `Lic: ${it.licencia}` : '')}
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