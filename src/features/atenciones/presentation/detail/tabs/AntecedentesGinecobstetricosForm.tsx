'use client';

import { inputClassName } from '@/features/formulario-origen/presentation/FormField';
import {
  FORMULA_FIELDS,
  GINECO_GROUPS,
  fechaProbableParto,
  type AntecedentesGinecobstetricos,
  type GinecoDateKey,
  type GinecoNumberKey,
  type GinecoTextKey,
} from '@/features/atenciones/domain/antecedentes-ginecobstetricos';
import { LONG_TEXT_MAX, TEXT_MAX, refiere } from '@/features/atenciones/domain/antecedentes-personales';

import { Card, Field, selectDefault } from './antecedentes-ui';

type Gineco = AntecedentesGinecobstetricos;

function countValue(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 2);
  return digits ? Number(digits) : null;
}

export function AntecedentesGinecobstetricosForm({
  antecedentes,
  readOnly,
  onlyRefiere,
  onChange,
}: {
  antecedentes: Gineco;
  readOnly: boolean;
  onlyRefiere: boolean;
  onChange: (updater: (current: Gineco) => Gineco) => void;
}) {
  const setTexto = (key: GinecoTextKey, value: string) =>
    onChange((current) => ({ ...current, textos: { ...current.textos, [key]: value } }));
  const setNumero = (key: GinecoNumberKey, value: number | null) =>
    onChange((current) => ({ ...current, numeros: { ...current.numeros, [key]: value } }));
  const setFecha = (key: GinecoDateKey, value: string | null) =>
    onChange((current) => {
      const fechas = { ...current.fechas, [key]: value };
      // Al registrar la FUM se sugiere la FPP si aún no se ha diligenciado.
      if (key === 'fum' && value && !current.fechas.fpp) fechas.fpp = fechaProbableParto(value);
      return { ...current, fechas };
    });

  const hasFormula = FORMULA_FIELDS.some((field) => antecedentes.numeros[field.key] != null);
  const visible = (field: (typeof GINECO_GROUPS)[number]['fields'][number]) => {
    if (!onlyRefiere) return true;
    if (field.kind === 'text') return refiere(antecedentes.textos[field.key]);
    if (field.kind === 'date') return Boolean(antecedentes.fechas[field.key]);
    if (field.kind === 'number') return Boolean(antecedentes.numeros[field.key]);
    return Boolean(antecedentes.observaciones);
  };

  return (
    <>
      {!onlyRefiere || hasFormula ? (
        <section className="rounded-xl border border-slate-200 bg-white">
          <header className="border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">Fórmula obstétrica</h3>
          </header>
          <div className="grid grid-cols-4 gap-3 p-4 sm:grid-cols-7">
            {FORMULA_FIELDS.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={`gineco-${field.key}`}
                  className="block text-center text-xs font-semibold text-slate-700"
                  title={field.title}
                >
                  {field.label}
                  <span className="block text-[10px] font-normal text-slate-500">{field.title}</span>
                </label>
                <input
                  id={`gineco-${field.key}`}
                  inputMode="numeric"
                  value={antecedentes.numeros[field.key] ?? ''}
                  readOnly={readOnly}
                  onChange={(event) => setNumero(field.key, countValue(event.target.value))}
                  className={`${inputClassName} mt-1 text-center tabular-nums`}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {GINECO_GROUPS.map((group) => {
        const fields = group.fields.filter(visible);
        if (fields.length === 0) return null;
        const count = group.fields.filter(
          (field) => field.kind === 'text' && refiere(antecedentes.textos[field.key]),
        ).length;

        return (
          <Card key={group.id} title={group.title} count={count}>
            {fields.map((field) => {
              const id = `gineco-${field.key}`;
              if (field.kind === 'date') {
                return (
                  <Field key={field.key} id={id} label={field.label}>
                    <input
                      id={id}
                      type="date"
                      value={antecedentes.fechas[field.key] ?? ''}
                      readOnly={readOnly}
                      onChange={(event) => setFecha(field.key, event.target.value || null)}
                      className={inputClassName}
                    />
                  </Field>
                );
              }
              if (field.kind === 'number') {
                return (
                  <Field key={field.key} id={id} label={field.label}>
                    <input
                      id={id}
                      inputMode="numeric"
                      value={antecedentes.numeros[field.key] ?? ''}
                      readOnly={readOnly}
                      onChange={(event) => setNumero(field.key, countValue(event.target.value))}
                      className={`${inputClassName} tabular-nums`}
                    />
                  </Field>
                );
              }
              if (field.kind === 'textarea') {
                return (
                  <Field key={field.key} id={id} label={field.label} wide>
                    <textarea
                      id={id}
                      value={antecedentes.observaciones}
                      readOnly={readOnly}
                      rows={3}
                      maxLength={LONG_TEXT_MAX}
                      onChange={(event) => onChange((current) => ({ ...current, observaciones: event.target.value }))}
                      className={`${inputClassName} resize-y`}
                    />
                  </Field>
                );
              }
              const value = antecedentes.textos[field.key];
              return (
                <Field key={field.key} id={id} label={field.label}>
                  <input
                    id={id}
                    value={value}
                    readOnly={readOnly}
                    maxLength={TEXT_MAX}
                    onFocus={selectDefault}
                    onChange={(event) => setTexto(field.key, event.target.value)}
                    className={`${inputClassName} ${refiere(value) ? 'font-medium' : 'text-slate-500'}`}
                  />
                </Field>
              );
            })}
          </Card>
        );
      })}
    </>
  );
}
