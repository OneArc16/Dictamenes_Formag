'use client';

import { inputClassName } from '@/features/formulario-origen/presentation/FormField';
import {
  FAMILIAR_GROUPS,
  FAMILIAR_TEXT_MAX,
  type AntecedentesFamiliares,
  type FamiliarKey,
} from '@/features/atenciones/domain/antecedentes-familiares';
import { refiere } from '@/features/atenciones/domain/antecedentes-personales';

import { Card, Field, selectDefault } from './antecedentes-ui';

export function AntecedentesFamiliaresForm({
  antecedentes,
  readOnly,
  onlyRefiere,
  onChange,
}: {
  antecedentes: AntecedentesFamiliares;
  readOnly: boolean;
  onlyRefiere: boolean;
  onChange: (updater: (current: AntecedentesFamiliares) => AntecedentesFamiliares) => void;
}) {
  const setItem = (key: FamiliarKey, value: string) =>
    onChange((current) => ({ ...current, items: { ...current.items, [key]: value } }));

  return (
    <>
      {FAMILIAR_GROUPS.map((group) => {
        const items = group.items.filter((item) => !onlyRefiere || refiere(antecedentes.items[item.key]));
        if (items.length === 0) return null;
        const count = group.items.filter((item) => refiere(antecedentes.items[item.key])).length;

        return (
          <Card key={group.id} title={group.title} count={count}>
            {items.map((item) => {
              const id = `antecedente-familiar-${item.key}`;
              const value = antecedentes.items[item.key];
              const className = `${inputClassName} ${refiere(value) ? 'font-medium' : 'text-slate-500'}`;
              const multiline = 'multiline' in item && item.multiline;
              return (
                <Field key={item.key} id={id} label={item.label} wide={multiline}>
                  {multiline ? (
                    <textarea
                      id={id}
                      value={value}
                      readOnly={readOnly}
                      rows={2}
                      maxLength={FAMILIAR_TEXT_MAX}
                      onFocus={selectDefault}
                      onChange={(event) => setItem(item.key, event.target.value)}
                      className={`${className} resize-y`}
                    />
                  ) : (
                    <input
                      id={id}
                      value={value}
                      readOnly={readOnly}
                      maxLength={FAMILIAR_TEXT_MAX}
                      onFocus={selectDefault}
                      onChange={(event) => setItem(item.key, event.target.value)}
                      className={className}
                    />
                  )}
                </Field>
              );
            })}
          </Card>
        );
      })}

      {!onlyRefiere || antecedentes.fechaAntecedente ? (
        <Card title="Fecha" count={0}>
          <Field id="antecedente-familiar-fecha" label="Fecha antecedente">
            <input
              id="antecedente-familiar-fecha"
              type="date"
              value={antecedentes.fechaAntecedente ?? ''}
              readOnly={readOnly}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) =>
                onChange((current) => ({ ...current, fechaAntecedente: event.target.value || null }))
              }
              className={inputClassName}
            />
          </Field>
        </Card>
      ) : null}
    </>
  );
}
