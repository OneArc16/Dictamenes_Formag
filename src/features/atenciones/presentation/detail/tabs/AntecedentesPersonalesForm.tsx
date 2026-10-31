'use client';

import { inputClassName } from '@/features/formulario-origen/presentation/FormField';
import {
  ANTECEDENTE_GROUPS,
  DETAIL_MAX,
  LONG_TEXT_MAX,
  TEXT_MAX,
  countRefiere,
  esFumador,
  indicePaquetesAnio,
  refiere,
  type AntecedentesPersonales,
  type DetailKey,
  type ItemKey,
} from '@/features/atenciones/domain/antecedentes-personales';

import { Card, Field, selectDefault } from './antecedentes-ui';

type Habitos = AntecedentesPersonales['habitos'];
type TextField = 'otrasMedicaciones' | 'otrasEnfermedades' | 'otrosAntecedentes';

// Texto libre que complementa algunos grupos.
const GROUP_EXTRA: Partial<Record<(typeof ANTECEDENTE_GROUPS)[number]['id'], { field: TextField; label: string }>> = {
  patologicos: { field: 'otrasEnfermedades', label: 'Otras enfermedades' },
  farmacologicos: { field: 'otrasMedicaciones', label: 'Otras medicaciones' },
};

function countHabitosRefiere(habitos: Habitos) {
  return [refiere(habitos.tabaco), habitos.exfumador === 'SI', refiere(habitos.alcohol), refiere(habitos.spa)].filter(
    Boolean,
  ).length;
}

/** Antecedentes referidos, incluidos los hábitos (para "Ver solo lo que refiere"). */
export function countPersonalesRefiere(antecedentes: AntecedentesPersonales) {
  return countRefiere(antecedentes) + countHabitosRefiere(antecedentes.habitos);
}

export function AntecedentesPersonalesForm({
  antecedentes,
  readOnly,
  onlyRefiere,
  onChange,
}: {
  antecedentes: AntecedentesPersonales;
  readOnly: boolean;
  onlyRefiere: boolean;
  onChange: (updater: (current: AntecedentesPersonales) => AntecedentesPersonales) => void;
}) {
  const { habitos } = antecedentes;
  const ipa = indicePaquetesAnio(habitos.cigarrillosDia, habitos.aniosFumando);
  const habitosRefiere = countHabitosRefiere(habitos);

  const setItem = (key: ItemKey, value: string) =>
    onChange((current) => ({
      ...current,
      items: { ...current.items, [key]: value },
    }));
  const setDetail = (key: DetailKey, value: string) =>
    onChange((current) => ({
      ...current,
      detalles: { ...current.detalles, [key]: value },
    }));
  const setHabito = <K extends keyof Habitos>(key: K, value: Habitos[K]) =>
    onChange((current) => ({
      ...current,
      habitos: { ...current.habitos, [key]: value },
    }));
  const setText = (field: TextField, value: string) => onChange((current) => ({ ...current, [field]: value }));
  const numberValue = (raw: string, max: number) => {
    const digits = raw.replace(/\D/g, '');
    return digits ? Math.min(Number(digits), max) : null;
  };
  const textInput = (id: string, value: string, onValue: (value: string) => void, max = TEXT_MAX) => (
    <input
      id={id}
      value={value}
      readOnly={readOnly}
      maxLength={max}
      onFocus={selectDefault}
      onChange={(event) => onValue(event.target.value)}
      className={`${inputClassName} ${refiere(value) ? 'font-medium' : 'text-slate-500'}`}
    />
  );

  return (
    <>
      {ANTECEDENTE_GROUPS.map((group) => {
        const extra = GROUP_EXTRA[group.id];
        const extraValue = extra ? antecedentes[extra.field] : '';
        const items = group.items.filter((item) => !onlyRefiere || refiere(antecedentes.items[item.key]));
        if (onlyRefiere && items.length === 0 && !extraValue) return null;
        const count = group.items.filter((item) => refiere(antecedentes.items[item.key])).length;

        return (
          <Card key={group.id} title={group.title} count={count}>
            {items.map((item) => {
              const value = antecedentes.items[item.key];
              const id = `antecedente-${item.key}`;
              if (!('detail' in item)) {
                return (
                  <Field key={item.key} id={id} label={item.label}>
                    {textInput(id, value, (next) => setItem(item.key, next))}
                  </Field>
                );
              }
              // El detalle aparece cuando el antecedente se refiere (o si ya tiene texto).
              const detalle = antecedentes.detalles[item.key];
              const showDetail = refiere(value) || Boolean(detalle);
              return (
                <div key={item.key} className={showDetail ? 'grid gap-3 sm:col-span-2 sm:grid-cols-2' : undefined}>
                  <Field id={id} label={item.label}>
                    {textInput(id, value, (next) => setItem(item.key, next))}
                  </Field>
                  {showDetail ? (
                    <Field
                      id={`${id}-detalle`}
                      label={item.key === 'alergias' ? 'Alergias descripción' : `${item.label} detalle`}
                    >
                      <textarea
                        id={`${id}-detalle`}
                        value={detalle}
                        readOnly={readOnly}
                        rows={2}
                        maxLength={DETAIL_MAX}
                        onChange={(event) => setDetail(item.key, event.target.value)}
                        className={`${inputClassName} min-h-11 resize-y`}
                      />
                    </Field>
                  ) : null}
                </div>
              );
            })}
            {extra && (!onlyRefiere || extraValue) ? (
              <Field id={`antecedente-${extra.field}`} label={extra.label} wide>
                <textarea
                  id={`antecedente-${extra.field}`}
                  value={extraValue}
                  readOnly={readOnly}
                  rows={2}
                  maxLength={LONG_TEXT_MAX}
                  onChange={(event) => setText(extra.field, event.target.value)}
                  className={`${inputClassName} resize-y`}
                />
              </Field>
            ) : null}
          </Card>
        );
      })}

      {!onlyRefiere || habitosRefiere > 0 ? (
        <Card title="Hábitos" count={habitosRefiere}>
          <Field id="habito-tabaco" label="Tabaco">
            {textInput('habito-tabaco', habitos.tabaco, (next) => setHabito('tabaco', next))}
          </Field>
          <Field id="habito-exfumador" label="Exfumador">
            <select
              id="habito-exfumador"
              value={habitos.exfumador ?? ''}
              disabled={readOnly}
              onChange={(event) => setHabito('exfumador', (event.target.value || null) as Habitos['exfumador'])}
              className={inputClassName}
            >
              <option value="">Por favor seleccione</option>
              <option value="SI">Sí</option>
              <option value="NO">No</option>
            </select>
          </Field>
          {esFumador(habitos) ? (
            <div className="grid grid-cols-3 gap-3 sm:col-span-2">
              <Field id="habito-anios-fumando" label="Años fumando">
                <input
                  id="habito-anios-fumando"
                  inputMode="numeric"
                  value={habitos.aniosFumando ?? ''}
                  readOnly={readOnly}
                  onChange={(event) => setHabito('aniosFumando', numberValue(event.target.value, 100))}
                  className={inputClassName}
                />
              </Field>
              <Field id="habito-cigarrillos" label="Cigarrillos x día">
                <input
                  id="habito-cigarrillos"
                  inputMode="numeric"
                  value={habitos.cigarrillosDia ?? ''}
                  readOnly={readOnly}
                  onChange={(event) => setHabito('cigarrillosDia', numberValue(event.target.value, 200))}
                  className={inputClassName}
                />
              </Field>
              <div>
                <span id="habito-ipa" className="text-xs font-semibold text-slate-700">
                  Paquetes por año
                </span>
                <output
                  aria-labelledby="habito-ipa"
                  className="mt-1 flex min-h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold tabular-nums text-slate-900"
                >
                  {ipa ?? '—'}
                </output>
              </div>
            </div>
          ) : null}
          <Field id="habito-alcohol" label="Alcohol">
            {textInput('habito-alcohol', habitos.alcohol, (next) => setHabito('alcohol', next))}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field id="habito-cantidad-alcohol" label="Cantidad alcohol">
              {textInput('habito-cantidad-alcohol', habitos.cantidadAlcohol, (next) =>
                setHabito('cantidadAlcohol', next),
              )}
            </Field>
            <Field id="habito-frecuencia-alcohol" label="Frecuencia alcohol">
              {textInput('habito-frecuencia-alcohol', habitos.frecuenciaAlcohol, (next) =>
                setHabito('frecuenciaAlcohol', next),
              )}
            </Field>
          </div>
          <Field id="habito-spa" label="SPA">
            {textInput('habito-spa', habitos.spa, (next) => setHabito('spa', next))}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field id="habito-spa-cuales" label="SPA cuáles">
              {textInput('habito-spa-cuales', habitos.spaCuales, (next) => setHabito('spaCuales', next))}
            </Field>
            <Field id="habito-spa-frecuencia" label="SPA frecuencia">
              {textInput('habito-spa-frecuencia', habitos.spaFrecuencia, (next) => setHabito('spaFrecuencia', next))}
            </Field>
          </div>
        </Card>
      ) : null}

      {!onlyRefiere || antecedentes.otrosAntecedentes || antecedentes.fechaAntecedente ? (
        <Card title="Otros" count={0}>
          <Field id="antecedente-otros" label="Otros antecedentes" wide>
            <textarea
              id="antecedente-otros"
              value={antecedentes.otrosAntecedentes}
              readOnly={readOnly}
              rows={3}
              maxLength={LONG_TEXT_MAX}
              onChange={(event) => setText('otrosAntecedentes', event.target.value)}
              className={`${inputClassName} resize-y`}
            />
          </Field>
          <Field id="antecedente-fecha" label="Fecha antecedente">
            <input
              id="antecedente-fecha"
              type="date"
              value={antecedentes.fechaAntecedente ?? ''}
              readOnly={readOnly}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  fechaAntecedente: event.target.value || null,
                }))
              }
              className={inputClassName}
            />
          </Field>
        </Card>
      ) : null}
    </>
  );
}
