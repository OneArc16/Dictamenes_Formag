import { FormField, inputClassName, SectionActions } from '../FormField';
import type { ValidationIssue } from '../types';

export function DescripcionTab({
  value,
  readOnly,
  saving,
  issues,
  onChange,
  onSave,
  onContinue,
}: {
  value: string;
  readOnly: boolean;
  saving: boolean;
  issues: ValidationIssue[];
  onChange: (value: string) => void;
  onSave: () => Promise<boolean | void> | boolean | void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-6">
      <FormField
        id="origin-description"
        label="Descripción"
        required
        helper="El borrador se guarda en el servidor después de una pausa al escribir."
        error={issues.find((issue) => issue.field === 'descripcion')?.message}
      >
        <textarea
          id="origin-description"
          value={value}
          readOnly={readOnly}
          rows={14}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClassName} min-h-[clamp(20rem,48dvh,36rem)] resize-y`}
          aria-describedby="origin-description-count"
        />
        <p id="origin-description-count" className="mt-1 text-right text-xs text-slate-500">
          {value.length.toLocaleString('es-CO')} caracteres
        </p>
      </FormField>
      <SectionActions
        saving={saving}
        readOnly={readOnly}
        onSave={onSave}
        onContinue={onContinue}
      />
    </div>
  );
}
