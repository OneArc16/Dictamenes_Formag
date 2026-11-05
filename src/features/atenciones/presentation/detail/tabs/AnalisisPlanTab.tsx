import { FormField, inputClassName } from '@/features/formulario-origen/presentation/FormField';
import type { AtencionForm } from '@/features/atenciones/domain/atencion-form';

import { FIELD_LOCATION } from '../atencion-tabs';

const CAMPOS: Array<{
  field: 'analisis' | 'plan' | 'tratamiento';
  label: string;
  rows: number;
  required?: boolean;
  placeholder: string;
}> = [
  { field: 'analisis', label: 'Análisis', rows: 5, placeholder: 'Análisis clínico de la atención' },
  { field: 'plan', label: 'Plan', rows: 2, placeholder: 'Plan a seguir' },
  { field: 'tratamiento', label: 'Tratamiento', rows: 5, required: true, placeholder: 'Ej.: control de enfermería' },
];

export function AnalisisPlanTab({
  form,
  readOnly,
  onChange,
}: {
  form: AtencionForm;
  readOnly: boolean;
  onChange: (field: keyof AtencionForm, value: string) => void;
}) {
  return (
    <div className="space-y-6">
      {CAMPOS.map(({ field, label, rows, required, placeholder }) => {
        const id = FIELD_LOCATION[field].inputId;
        return (
          <FormField key={field} id={id} label={label} required={required}>
            <textarea
              id={id}
              value={form[field]}
              readOnly={readOnly}
              rows={rows}
              aria-required={required || undefined}
              placeholder={readOnly ? undefined : placeholder}
              onChange={(event) => onChange(field, event.target.value)}
              className={`${inputClassName} resize-y`}
            />
          </FormField>
        );
      })}
    </div>
  );
}
