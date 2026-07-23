import { AlertTriangle } from 'lucide-react';

import { FormField, inputClassName, SectionActions } from '../FormField';
import type { ValidationIssue } from '../types';

export function SustentacionTab({
  concepto,
  fundamentosDerecho,
  tipoEvento,
  origenEvento,
  readOnly,
  saving,
  issues,
  hasAccidentData,
  onChange,
  onSave,
}: {
  concepto: string;
  fundamentosDerecho: string;
  tipoEvento: 'ENFERMEDAD' | 'ACCIDENTE' | null;
  origenEvento: 'LABORAL' | 'COMUN' | null;
  readOnly: boolean;
  saving: boolean;
  issues: ValidationIssue[];
  hasAccidentData: boolean;
  onChange: (patch: {
    concepto?: string;
    fundamentosDerecho?: string;
    tipoEvento?: 'ENFERMEDAD' | 'ACCIDENTE' | null;
    origenEvento?: 'LABORAL' | 'COMUN' | null;
  }) => void;
  onSave: () => Promise<boolean | void> | boolean | void;
}) {
  const issue = (field: string) => issues.find((item) => item.field === field)?.message;

  return (
    <div className="space-y-6">
      <FormField
        id="origin-concept"
        label="Concepto"
        required
        error={issue('concepto')}
      >
        <textarea
          id="origin-concept"
          value={concepto}
          readOnly={readOnly}
          rows={7}
          onChange={(event) => onChange({ concepto: event.target.value })}
          className={`${inputClassName} resize-y`}
        />
      </FormField>
      <FormField
        id="origin-legal-foundation"
        label="Fundamentos de Derecho"
        required
        error={issue('fundamentosDerecho')}
      >
        <textarea
          id="origin-legal-foundation"
          value={fundamentosDerecho}
          readOnly={readOnly}
          rows={7}
          onChange={(event) => onChange({ fundamentosDerecho: event.target.value })}
          className={`${inputClassName} resize-y`}
        />
      </FormField>
      <div className="grid gap-5 md:grid-cols-2">
        <fieldset>
          <legend className="text-sm font-medium text-slate-800">
            Tipo de evento <span className="text-rose-700">*</span>
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(['ENFERMEDAD', 'ACCIDENTE'] as const).map((option) => (
              <label
                key={option}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm hover:bg-slate-50"
              >
                <input
                  type="radio"
                  name="origin-event-type"
                  checked={tipoEvento === option}
                  disabled={readOnly}
                  onChange={() => {
                    if (
                      option === 'ENFERMEDAD' &&
                      tipoEvento === 'ACCIDENTE' &&
                      hasAccidentData &&
                      !window.confirm(
                        'Los datos de ocurrencia dejarán de ser obligatorios, pero se conservarán hasta que los limpies. ¿Deseas cambiar el tipo?',
                      )
                    ) {
                      return;
                    }
                    onChange({ tipoEvento: option });
                  }}
                  className="h-4 w-4 accent-sky-700"
                />
                {option === 'ENFERMEDAD' ? 'Enfermedad' : 'Accidente'}
              </label>
            ))}
          </div>
          {issue('tipoEvento') ? (
            <p className="mt-1.5 text-xs font-medium text-rose-700" role="alert">
              {issue('tipoEvento')}
            </p>
          ) : null}
        </fieldset>
        <fieldset>
          <legend className="text-sm font-medium text-slate-800">
            Origen <span className="text-rose-700">*</span>
          </legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(['LABORAL', 'COMUN'] as const).map((option) => (
              <label
                key={option}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm hover:bg-slate-50"
              >
                <input
                  type="radio"
                  name="origin-event-origin"
                  checked={origenEvento === option}
                  disabled={readOnly}
                  onChange={() => onChange({ origenEvento: option })}
                  className="h-4 w-4 accent-sky-700"
                />
                {option === 'LABORAL' ? 'Laboral' : 'Común'}
              </label>
            ))}
          </div>
          {issue('origenEvento') ? (
            <p className="mt-1.5 text-xs font-medium text-rose-700" role="alert">
              {issue('origenEvento')}
            </p>
          ) : null}
        </fieldset>
      </div>
      {tipoEvento === 'ACCIDENTE' ? (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          Verifica fecha, hora y jornada en Información y Fundamentos antes de finalizar.
        </div>
      ) : null}
      <SectionActions
        saving={saving}
        readOnly={readOnly}
        onSave={onSave}
      />
    </div>
  );
}
