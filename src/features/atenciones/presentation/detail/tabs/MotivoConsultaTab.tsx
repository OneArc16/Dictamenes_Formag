import { FormField, inputClassName } from '@/features/formulario-origen/presentation/FormField';
import type { AtencionForm } from '@/features/atenciones/domain/atencion-form';

export function MotivoConsultaTab({
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
      <FormField id="atencion-motivo-consulta" label="Motivo de consulta">
        <textarea
          id="atencion-motivo-consulta"
          value={form.motivoConsulta}
          readOnly={readOnly}
          rows={4}
          placeholder={readOnly ? undefined : 'Ej.: control de enfermería'}
          onChange={(event) => onChange('motivoConsulta', event.target.value)}
          className={`${inputClassName} min-h-28 resize-y`}
        />
      </FormField>

      <FormField id="atencion-enfermedad-actual" label="Enfermedad actual" required>
        <textarea
          id="atencion-enfermedad-actual"
          value={form.enfermedadActual}
          readOnly={readOnly}
          rows={8}
          aria-required="true"
          placeholder={readOnly ? undefined : 'Describe la enfermedad actual del paciente'}
          onChange={(event) => onChange('enfermedadActual', event.target.value)}
          className={`${inputClassName} min-h-48 resize-y`}
        />
      </FormField>
    </div>
  );
}
