import React from 'react';
import { Image, View } from '@react-pdf/renderer';
import { BW, Bar, T, Tbl, Td, Tr, TPL } from '../components/Tpl';

type JuntaMember = {
  nombreCompleto?: string | null;
  tratamiento?: string | null;
  firmaSrc?: string | null;
  especialidad?: string | null;
  registroMedico?: string | null;
  licencia?: string | null;
};

type DictamenLike = {
  junta?: unknown;
};

type Props = { dictamen: DictamenLike };

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

const COLS = 3;

function Signer({ it }: { it?: JuntaMember }) {
  const meta = [
    it?.registroMedico ? `RM: ${it.registroMedico}` : '',
    it?.licencia ? `Lic: ${it.licencia}` : '',
  ]
    .filter(Boolean)
    .join('  ');

  return (
    <Td w={1} bg={TPL.white} px={8} py={6} valign="top" style={{ borderLeftWidth: 0 }}>
      <View style={{ height: 48, justifyContent: 'center', alignItems: 'center' }}>
        {it?.firmaSrc ? <Image src={it.firmaSrc} style={{ width: '90%', height: 46, objectFit: 'contain' }} /> : null}
      </View>
      <View style={{ marginTop: 2, borderBottomWidth: 1, borderBottomColor: TPL.ink }} />
      <View style={{ marginTop: 3 }}>
        <T b size={7.5}>{formatNombreConTratamiento(it)}</T>
        {it?.especialidad ? <T b size={7.2}>{it.especialidad}</T> : null}
        {meta ? <T size={7}>{meta}</T> : null}
      </View>
    </Td>
  );
}

export default function FirmasJuntaBlock({ dictamen }: Props) {
  const juntaRaw = Array.isArray(dictamen?.junta) ? dictamen.junta : [];
  const junta = juntaRaw as JuntaMember[];
  // Sin integrantes se imprimen 3 espacios en blanco.
  const members: Array<JuntaMember | undefined> = junta.length ? junta : [undefined, undefined, undefined];
  const rows = chunk(members, COLS);

  // La sección completa (título + todas las firmas) es una sola pieza: si no cabe en lo que queda
  // de la hoja pasa entera a la siguiente, y ninguna firma queda separada de su nombre.
  return (
    <Tbl>
      <View wrap={false}>
        <Bar bg={TPL.blue} size={8}>FIRMAS JUNTA MÉDICA</Bar>
        {rows.map((row, idx) => (
          <Tr key={idx} minH={90} style={{ borderLeftWidth: BW }}>
            {Array.from({ length: COLS }).map((_, j) => (
              <Signer key={j} it={row[j]} />
            ))}
          </Tr>
        ))}
      </View>
    </Tbl>
  );
}
