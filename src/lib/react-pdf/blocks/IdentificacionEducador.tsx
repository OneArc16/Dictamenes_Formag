import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

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

// âœ… evita [object Object]
function asText(v: any): string {
  if (v == null || v === '') return '—';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object') {
    const pick = v.nombre ?? v.name ?? v.label ?? v.valor ?? v.codigo ?? null;
    return pick != null ? String(pick) : '—';
  }
  return String(v);
}

// Colores plantilla (Office)
const COLOR = {
  title: '#FCE4D6', // melocotÃ³n
  blue: '#9BC2E6', // azul plantilla
  blueLight: '#DAE9F7', // azul claro plantilla
};

// âœ… lÃ­neas internas mÃ¡s notorias
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

// âœ… mapeos â€œbonitosâ€ para cÃ³digos del schema
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
  // âœ… Dictamen -> usuario (Usuario)
  const u = dictamen?.usuario ?? {};

  const nombres = [u?.primerNombre, u?.segundoNombre].filter(Boolean).join(' ') || '—';
  const apellidos = [u?.primerApellido, u?.segundoApellido].filter(Boolean).join(' ') || '—';

  const documento = u?.identificacion ?? '—';

  const genero = sexoLabel(u?.sexo ?? u?.genero ?? null);

  // âœ… escolaridad (ya llega como string desde tu route, pero tolerante)
  const escolaridad = asText(u?.escolaridad);

  const estadoCivil = asText(u?.estadoCivil);

  const fechaNac = u?.fechaNacimiento ?? null;
  const edadCalc =
    u?.edad != null ? u.edad : calcAge(fechaNac, dictamen?.fechaDictamen ?? dictamen?.fecha ?? null);

  const direccion = asText(u?.direccion);
  const zona = zonaLabel(u?.zonaResidencia ?? null);

  const municipio = u?.municipio?.nombre ?? '—';
  const departamento = u?.departamento?.nombre ?? '—';

  // âœ… CARGO: primero el nombre del CargoDocente, luego fallback
  // (tu route ya manda usuario.cargo y cargoDocenteNombre, pero dejamos todo tolerante)
  const cargo =
    asText(u?.cargoDocenteNombre) !== '—'
      ? asText(u?.cargoDocenteNombre)
      : asText(u?.cargoDocente?.nombre) !== '—'
      ? asText(u?.cargoDocente?.nombre)
      : asText(u?.cargo) !== '—'
      ? asText(u?.cargo)
      : asText(u?.codigoOcupacion);

  const nivelEscalafonRaw = asText(u?.nivelEscalafon);
  const gradoEscalafon = asText(u?.gradoEscalafon);
  const emptyText = asText(null);
  const nivelEscalafonKey = nivelEscalafonRaw.trim().toUpperCase();
  const nivelEscalafonNormalizado =
    nivelEscalafonRaw === emptyText ||
    nivelEscalafonKey === '?' ||
    nivelEscalafonKey === '0' ||
    nivelEscalafonKey === 'NO APLICA' ||
    nivelEscalafonKey === 'NO APLICA (0)'
      ? ''
      : nivelEscalafonRaw;
  const escalafon =
    gradoEscalafon === emptyText || gradoEscalafon === '?'
      ? emptyText
      : gradoEscalafon + nivelEscalafonNormalizado;
  const formaVinculacion = asText(u?.formaVinculacion);

  return (
    <View>
      {/* TÃ­tulo */}
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

      {/* Row 2: Documento */}
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

      {/* Row 3: GÃ©nero / Escolaridad / Estado civil */}
      <View style={[styles.row, styles.h3]}>
        <Cell flex={1.05} bg={COLOR.blue}>
          <FieldInline label="GÉNERO:" value={genero} />
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
          <FieldInline
            label="Fecha de nacimiento:"
            value={formatDateDMY(fechaNac)}
            uppercaseValue={false}
          />
        </Cell>
        <Cell flex={1.2} bg={COLOR.blueLight} last>
          <FieldInline
            label="Edad:"
            value={edadCalc == null ? '—' : `${edadCalc} años`}
            uppercaseValue={false}
          />
        </Cell>
      </View>

      {/* Row 5: DirecciÃ³n */}
      <View style={[styles.row, styles.h5]}>
        <Cell flex={1.6} bg={COLOR.blue}>
          <Text style={styles.text}>
            <Text style={styles.label}>DIRECCIÓN DEL CALIFICADO:</Text>
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

      {/* Row 7: Cargo / Grado / VinculaciÃ³n */}
      <View style={[styles.row, styles.h4, styles.rowLast]}>
        <Cell flex={1.35} bg={COLOR.blue}>
          <FieldInline label="Cargo:" value={cargo} />
        </Cell>
        <Cell flex={1.25} bg={COLOR.blue}>
          <FieldInline label="GRADO DE ESCALAFÓN:" value={escalafon} />
        </Cell>
        <Cell flex={1.5} bg={COLOR.blueLight} last>
          <FieldInline label="FORMA DE VINCULACIÓN:" value={formaVinculacion} />
        </Cell>
      </View>
    </View>
  );
}

