import React from 'react';
import { Bar, FlowCell, Tbl } from '../components/Tpl';
import { TPL } from '../components/Tpl';

type Props = {
  dictamen: {
    antecedentesClinicos?: unknown;
  };
};

/**
 * Barra + caja de texto. Se devuelven como hermanos (sin contenedor) para que
 * `minPresenceAhead` de la barra funcione: si no cabe con las primeras líneas
 * del texto, la barra pasa a la página siguiente en vez de quedar sola.
 */
export function AntecedentesClinicosBlock({ dictamen }: Props) {
  const texto = String(dictamen?.antecedentesClinicos ?? '—');

  return (
    <>
      <Tbl minPresence={40}>
        <Bar bg={TPL.salmon}>3. Antecedentes Clínicos (Epicrisis y Estado Actual)</Bar>
      </Tbl>
      <FlowCell>{texto}</FlowCell>
    </>
  );
}
