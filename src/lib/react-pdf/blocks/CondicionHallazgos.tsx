import React from 'react';
import { Text } from '@react-pdf/renderer';
import { FlowCell, TPL } from '../components/Tpl';

function safeText(v: unknown) {
  const s = String(v ?? '').replace(/\r/g, '').trim();
  return s ? s : '—';
}

export function CondicionSaludBlock({ condicion }: { condicion: string }) {
  return (
    <FlowCell bg={TPL.white}>
      <Text style={{ fontWeight: 700 }}>Condición de salud (signos y síntomas): </Text>
      {safeText(condicion)}
    </FlowCell>
  );
}

export function HallazgosClinicosBlock({ hallazgos }: { hallazgos: string }) {
  return (
    <FlowCell bg={TPL.pale}>
      <Text style={{ fontWeight: 700 }}>
        Prueba o exámenes paraclínicos (descripción de hallazgos positivos):{' '}
      </Text>
      {safeText(hallazgos)}
    </FlowCell>
  );
}
