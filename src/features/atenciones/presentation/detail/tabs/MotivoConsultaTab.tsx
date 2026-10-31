import { FormField, inputClassName } from '@/features/formulario-origen/presentation/FormField';
import { ATENCION_TEXT_MAX, type AtencionForm } from '@/features/atenciones/domain/atencion-form';

export function CharacterCount({ id, value }: { id: string; value: string }) {
  return (
    <p id={id} className="mt-1 text-right text-xs text-slate-500">
      {value.length.toLocaleString('es-CO')} / {ATENCION_TEXT_MAX.toLocaleString('es-CO')}
    </p>
  );
}

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
          maxLength={ATENCION_TEXT_MAX}
          placeholder={readOnly ? undefined : 'Ej.: control de enfermería'}
          onChange={(event) => onChange('motivoConsulta', event.target.value)}
          aria-describedby="atencion-motivo-consulta-count"
          className={`${inputClassName} min-h-28 resize-y`}
        />
        <CharacterCount id="atencion-motivo-consulta-count" value={form.motivoConsulta} />
      </FormField>

      <FormField id="atencion-enfermedad-actual" label="Enfermedad actual" required>
        <textarea
          id="atencion-enfermedad-actual"
          value={form.enfermedadActual}
          readOnly={readOnly}
          rows={8}
          maxLength={ATENCION_TEXT_MAX}
          aria-required="true"
          placeholder={readOnly ? undefined : 'Describe la enfermedad actual del paciente'}
          onChange={(event) => onChange('enfermedadActual', event.target.value)}
          aria-describedby="atencion-enfermedad-actual-count"
          className={`${inputClassName} min-h-48 resize-y`}
        />
        <CharacterCount id="atencion-enfermedad-actual-count" value={form.enfermedadActual} />
      </FormField>
    </div>
  );
}
