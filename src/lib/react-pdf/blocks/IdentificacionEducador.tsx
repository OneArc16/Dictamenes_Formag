import React from 'react';
import { Text, View } from '@react-pdf/renderer';
import { edadPaciente, fechaBogota, fechaDb } from '@/lib/edad';

import { Bar, T, Td, Tr, TPL } from '../components/Tpl';

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

/** Date de una columna solo-fecha o texto YYYY-MM-DD → YYYY-MM-DD. */
function soloFecha(value?: string | Date | null) {
  if (!value) return null;
  if (value instanceof Date) return fechaDb(value);
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null;
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
    <T align="left">
      <Text style={{ fontWeight: 700 }}>{label} </Text>
      <Text style={{ fontWeight: 700 }}>{uppercaseValue ? v.toUpperCase() : v}</Text>
    </T>
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
  // La edad a la fecha del dictamen; la guardada solo si no hay fecha de nacimiento.
  const fechaReferencia = soloFecha(dictamen?.fechaDictamen ?? dictamen?.fecha ?? null) ?? fechaBogota();
  const edadCalc = edadPaciente(
    { fechaNacimiento: soloFecha(fechaNac), edad: u?.edad != null ? Number(u.edad) : null },
    fechaReferencia,
  );

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

  const B = TPL.blue;
  const L = TPL.light;

  return (
    <View wrap={false}>
      <Bar bg={TPL.salmon}>2. Identificación del educador</Bar>

      <Tr bg={B}>
        <Td w={303.1} bg={B}><FieldInline label="Nombre (s):" value={nombres} /></Td>
        <Td w={249.3} bg={B}><FieldInline label="Apellidos (s):" value={apellidos} /></Td>
      </Tr>

      <Tr>
        <Td w={303.1} bg={B}><T b align="left">Documento de Identidad:</T></Td>
        <Td w={249.3} bg={L}><T b>{String(documento)}</T></Td>
      </Tr>

      <Tr>
        <Td w={147} bg={B}><FieldInline label="Género:" value={genero} /></Td>
        <Td w={239.8} bg={L}><FieldInline label="Nivel de escolaridad:" value={escolaridad} /></Td>
        <Td w={165.2} bg={L}><FieldInline label="Estado civil:" value={estadoCivil} /></Td>
      </Tr>

      <Tr>
        <Td w={303.1} bg={B}>
          <FieldInline label="Fecha de nacimiento:" value={formatDateDMY(fechaNac)} uppercaseValue={false} />
        </Td>
        <Td w={83.6} bg={L}><T b align="right">Edad:</T></Td>
        <Td w={165.2} bg={L}>
          <T b align="left">{edadCalc == null ? '—' : `${edadCalc} años`}</T>
        </Td>
      </Tr>

      <Tr>
        <Td w={303.1} bg={B}><T b align="left">Dirección del calificado:</T></Td>
        <Td w={249.3} bg={L}><T b align="left">{String(direccion).toUpperCase()}</T></Td>
      </Tr>

      <Tr bg={B}>
        <Td w={80} bg={B}><FieldInline label="Zona:" value={zona} /></Td>
        <Td w={223.1} bg={B}><FieldInline label="Municipio:" value={municipio} /></Td>
        <Td w={249.3} bg={B}><FieldInline label="Departamento:" value={departamento} /></Td>
      </Tr>

      <Tr minH={22}>
        <Td w={253.6} bg={B} valign="bottom"><FieldInline label="Cargo:" value={cargo} /></Td>
        <Td w={133.2} bg={L} valign="top"><FieldInline label="Grado de escalafón:" value={escalafon} /></Td>
        <Td w={165.5} bg={L} valign="top"><FieldInline label="Forma de vinculación" value={formaVinculacion} /></Td>
      </Tr>
    </View>
  );
}
