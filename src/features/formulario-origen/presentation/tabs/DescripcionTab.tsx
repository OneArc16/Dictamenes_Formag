import { FormField, inputClassName, SectionActions } from '../FormField';
import type { ValidationIssue } from '../types';

export function DescripcionTab({
  value,
  actividadExtralaboral,
  readOnly,
  saving,
  issues,
  onDescriptionChange,
  onExtraActivityChange,
  onSave,
  onContinue,
}: {
  value: string;
  actividadExtralaboral: string;
  readOnly: boolean;
  saving: boolean;
  issues: ValidationIssue[];
  onDescriptionChange: (value: string) => void;
  onExtraActivityChange: (value: string) => void;
  onSave: () => Promise<boolean | void> | boolean | void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <FormField
          id="origin-extra-activity"
          label="Actividad extralaboral"
        >
          <input
            id="origin-extra-activity"
            type="text"
            value={actividadExtralaboral}
            readOnly={readOnly}
            maxLength={1000}
            placeholder="Ej.: deporte, manualidades o actividad comercial"
            onChange={(event) => onExtraActivityChange(event.target.value)}
            className={inputClassName}
          />
        </FormField>
      </div>
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
          onChange={(event) => onDescriptionChange(event.target.value)}
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
