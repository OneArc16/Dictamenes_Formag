'use client';

import { Activity, ArrowRight } from 'lucide-react';
import type { ComponentProps } from 'react';

import {
  alertaSigno,
  calcularImc,
  formatSigno,
  indiceCinturaCadera,
  type SignoKey,
  type SignosValues,
} from '@/features/atenciones/domain/signos-vitales';

import { HallazgosTab } from './HallazgosTab';

const RESUMEN: Array<{ label: string; value: (values: SignosValues) => string; alertas?: SignoKey[] }> = [
  {
    label: 'PA',
    value: (v) => `${formatSigno(v.presionSistolica)}/${formatSigno(v.presionDiastolica)}`,
    alertas: ['presionSistolica', 'presionDiastolica'],
  },
  { label: 'FC', value: (v) => formatSigno(v.frecuenciaCardiaca), alertas: ['frecuenciaCardiaca'] },
  { label: 'FR', value: (v) => formatSigno(v.frecuenciaRespiratoria), alertas: ['frecuenciaRespiratoria'] },
  { label: 'T°', value: (v) => formatSigno(v.temperatura), alertas: ['temperatura'] },
  { label: 'SpO₂', value: (v) => formatSigno(v.saturacion), alertas: ['saturacion'] },
  { label: 'Peso', value: (v) => formatSigno(v.pesoKg) },
  { label: 'Talla', value: (v) => formatSigno(v.tallaCm) },
  { label: 'IMC', value: (v) => formatSigno(calcularImc(v.pesoKg, v.tallaCm)) },
  { label: 'P. cefálico', value: (v) => formatSigno(v.perimetroCefalico) },
  { label: 'Cintura', value: (v) => formatSigno(v.perimetroCintura) },
  { label: 'Cadera', value: (v) => formatSigno(v.perimetroCadera) },
  { label: 'ICC', value: (v) => formatSigno(indiceCinturaCadera(v.perimetroCintura, v.perimetroCadera)) },
];

/** Examen físico: resumen de los signos vitales (se editan en su pestaña) y hallazgos por región. */
export function ExamenFisicoTab({
  signos,
  onEditSignos,
  ...hallazgos
}: { signos: SignosValues; onEditSignos: () => void } & ComponentProps<typeof HallazgosTab>) {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <Activity className="h-4 w-4 text-sky-700" aria-hidden="true" />
            Signos vitales
          </h3>
          <button
            type="button"
            onClick={onEditSignos}
            className="inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-sky-800 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
          >
            Editar en Signos vitales
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
        <dl className="mt-2 grid grid-cols-3 gap-x-4 gap-y-2 sm:grid-cols-6">
          {RESUMEN.map((item) => {
            const alerta = item.alertas?.map((key) => alertaSigno(key, signos)).find(Boolean);
            return (
              <div key={item.label}>
                <dt className="text-[11px] text-slate-500">{item.label}</dt>
                <dd
                  className={`text-sm font-semibold tabular-nums ${alerta ? 'text-amber-800' : 'text-slate-900'}`}
                  title={alerta ?? undefined}
                >
                  {item.value(signos)}
                </dd>
              </div>
            );
          })}
        </dl>
      </section>

      <HallazgosTab {...hallazgos} />
    </div>
  );
}
