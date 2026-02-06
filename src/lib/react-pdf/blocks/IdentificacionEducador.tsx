import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfTheme } from '../theme';

type Props = {
  dictamen: any;
};

function formatDateDMY(value?: string | Date | null) {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getUTCFullYear());
  return `${dd}-${mm}-${yyyy}`;
}

function calcAge(birth?: string | Date | null, ref?: string | Date | null) {
  if (!birth) return null;
  const b = typeof birth === 'string' ? new Date(birth) : birth;
  if (Number.isNaN(b.getTime())) return null;

  const r0 = ref ? (typeof ref === 'string' ? new Date(ref) : ref) : new Date();
  const r = Number.isNaN(r0.getTime()) ? new Date() : r0;

  let age = r.getFullYear() - b.getFullYear();
  const m = r.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && r.getDate() < b.getDate())) age--;
  return age;
}

// Colores plantilla (Office)
const COLOR = {
  title: '#F8CBAD', // melocotón
  blue: '#9DC3E6', // azul plantilla
  blueLight: '#D9E1F2', // azul claro plantilla
};

// ✅ líneas internas más notorias
const INNER_BORDER_W = 1;
const INNER_BORDER_C = '#000000';

const styles = StyleSheet.create({
  titleRow: {
    backgroundColor: COLOR.title,
    alignItems: 'center',
    justifyContent: 'center',
    height: 18,
    borderBottomWidth: INNER_BORDER_W,
    borderBottomColor: INNER_BORDER_C,
  },
  titleText: { fontSize: 8.4, fontWeight: 700, textTransform: 'uppercase' },

  row: {
    flexDirection: 'row',
    borderBottomWidth: INNER_BORDER_W,
    borderBottomColor: INNER_BORDER_C,
  },
  rowLast: { borderBottomWidth: 0 },

  cell: {
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRightWidth: INNER_BORDER_W,
    borderRightColor: INNER_BORDER_C,
  },
  cellLast: { borderRightWidth: 0 },

  // textos
  text: { fontSize: 7.7, lineHeight: 1.1 },
  label: { fontWeight: 700, textTransform: 'uppercase' },
  value: { fontWeight: 700 },

  // alturas aproximadas del Word
  h1: { height: 18 },
  h2: { height: 16 },
  h3: { height: 18 },
  h4: { height: 18 },
  h5: { height: 18 },
});

function Cell({
  flex,
  bg,
  last,
  children,
  style,
}: {
  flex: number;
  bg: string;
  last?: boolean;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[styles.cell, { flex, backgroundColor: bg }, last ? styles.cellLast : null, style]}>
      {children}
    </View>
  );
}

function FieldInline({
  label,
  value,
  uppercaseValue = true,
}: {
  label: string;
  value: any;
  uppercaseValue?: boolean;
}) {
  const v = value == null || value === '' ? '—' : String(value);
  return (
    <Text style={styles.text}>
      <Text style={styles.label}>{label} </Text>
      <Text style={styles.value}>{uppercaseValue ? v.toUpperCase() : v}</Text>
    </Text>
  );
}

// ✅ mapeos “bonitos” para códigos del schema
function sexoLabel(sexo?: string | null) {
  const s = (sexo ?? '').toUpperCase();
  if (s === 'H') return 'MASCULINO';
  if (s === 'M') return 'FEMENINO';
  return sexo ?? '—';
}

function zonaLabel(z?: string | null) {
  const s = (z ?? '').toUpperCase();
  if (s === 'U') return 'URBANA';
  if (s === 'R') return 'RURAL';
  return z ?? '—';
}

export function IdentificacionEducadorBlock({ dictamen }: Props) {
  // ✅ en tu schema Dictamen -> usuario (Usuario)
  const u = dictamen?.usuario ?? {};

  // ✅ Usuario: primerNombre/segundoNombre/primerApellido/segundoApellido
  const nombres = [u?.primerNombre, u?.segundoNombre].filter(Boolean).join(' ') || '—';
  const apellidos = [u?.primerApellido, u?.segundoApellido].filter(Boolean).join(' ') || '—';

  // ✅ Usuario: identificacion / tipoIdentificacion (si quieres mostrar solo el número, deja identificacion)
  const documento = u?.identificacion ?? '—';

  // ✅ Usuario: sexo / escolaridad / estadoCivil
  const genero = sexoLabel(u?.sexo ?? u?.genero ?? null);
  const escolaridad = u?.escolaridad ?? '—';
  const estadoCivil = u?.estadoCivil ?? '—';

  // ✅ Usuario: fechaNacimiento / edad
  const fechaNac = u?.fechaNacimiento ?? null;
  const edadCalc =
    u?.edad != null ? u.edad : calcAge(fechaNac, dictamen?.fechaDictamen ?? dictamen?.fecha ?? null);

  // ✅ Usuario: direccion / zonaResidencia
  const direccion = u?.direccion ?? '—';
  const zona = zonaLabel(u?.zonaResidencia ?? null);

  // ✅ Relaciones: municipio / departamento (Usuario.municipio / Usuario.departamento)
  const municipio = u?.municipio?.nombre ?? '—';
  const departamento = u?.departamento?.nombre ?? '—';

  // ✅ Usuario: NO existe "cargo" en tu schema. Si no tienes campo, lo dejamos con fallback.
  // Si quieres, puedes usar codigoOcupacion (Char(4)) como “cargo”.
  const cargo = u?.codigoOcupacion ?? '—';

  // ✅ Usuario: gradoEscalafon / formaVinculacion (existen)
  const gradoEscalafon = u?.gradoEscalafon ?? '—';
  const formaVinculacion = u?.formaVinculacion ?? '—';

  return (
    <View>
      {/* Título */}
      <View style={styles.titleRow}>
        <Text style={styles.titleText}>2. IDENTIFICACIÓN DEL EDUCADOR</Text>
      </View>

      {/* Row 1: Nombres / Apellidos (azul) */}
      <View style={[styles.row, styles.h1]}>
        <Cell flex={1} bg={COLOR.blue}>
          <FieldInline label="Nombre(s):" value={nombres} />
        </Cell>
        <Cell flex={1} bg={COLOR.blue} last>
          <FieldInline label="Apellidos(s):" value={apellidos} />
        </Cell>
      </View>

      {/* Row 2: Documento (label azul / valor azul claro) */}
      <View style={[styles.row, styles.h2]}>
        <Cell flex={2.4} bg={COLOR.blue}>
          <Text style={styles.text}>
            <Text style={styles.label}>Documento de Identidad:</Text>
          </Text>
        </Cell>
        <Cell flex={1} bg={COLOR.blueLight} last>
          <Text style={[styles.text, { textAlign: 'center' }]}>
            <Text style={styles.value}>{String(documento)}</Text>
          </Text>
        </Cell>
      </View>

      {/* Row 3: Género / Escolaridad / Estado civil */}
      <View style={[styles.row, styles.h3]}>
        <Cell flex={1.05} bg={COLOR.blue}>
          <FieldInline label="Género:" value={genero} />
        </Cell>
        <Cell flex={1.6} bg={COLOR.blue}>
          <FieldInline label="Nivel de escolaridad:" value={escolaridad} />
        </Cell>
        <Cell flex={1.05} bg={COLOR.blueLight} last>
          <FieldInline label="Estado civil:" value={estadoCivil} />
        </Cell>
      </View>

      {/* Row 4: Fecha nac / Edad */}
      <View style={[styles.row, styles.h4]}>
        <Cell flex={2.5} bg={COLOR.blue}>
          <FieldInline label="Fecha de nacimiento:" value={formatDateDMY(fechaNac)} uppercaseValue={false} />
        </Cell>
        <Cell flex={1.2} bg={COLOR.blueLight} last>
          <FieldInline
            label="Edad:"
            value={edadCalc == null ? '—' : `${edadCalc} años`}
            uppercaseValue={false}
          />
        </Cell>
      </View>

      {/* Row 5: Dirección */}
      <View style={[styles.row, styles.h5]}>
        <Cell flex={1.6} bg={COLOR.blue}>
          <Text style={styles.text}>
            <Text style={styles.label}>Dirección del calificado:</Text>
          </Text>
        </Cell>
        <Cell flex={2.9} bg={COLOR.blueLight} last>
          <Text style={styles.text}>
            <Text style={styles.value}>{String(direccion).toUpperCase()}</Text>
          </Text>
        </Cell>
      </View>

      {/* Row 6: Zona / Municipio / Departamento */}
      <View style={[styles.row, styles.h4]}>
        <Cell flex={1.0} bg={COLOR.blue}>
          <FieldInline label="Zona:" value={zona} />
        </Cell>
        <Cell flex={1.9} bg={COLOR.blue}>
          <FieldInline label="Municipio:" value={municipio} />
        </Cell>
        <Cell flex={1.2} bg={COLOR.blueLight} last>
          <FieldInline label="Departamento:" value={departamento} />
        </Cell>
      </View>

      {/* Row 7: Cargo / Grado / Vinculación */}
      <View style={[styles.row, styles.h4, styles.rowLast]}>
        <Cell flex={1.35} bg={COLOR.blue}>
          <FieldInline label="Cargo:" value={cargo} />
        </Cell>
        <Cell flex={1.25} bg={COLOR.blue}>
          <FieldInline label="Grado de escalafón:" value={gradoEscalafon} />
        </Cell>
        <Cell flex={1.5} bg={COLOR.blueLight} last>
          <FieldInline label="Forma de vinculación:" value={formaVinculacion} />
        </Cell>
      </View>
    </View>
  );
}