import { atencionPendientes, type AtencionForm } from '@/features/atenciones/domain/atencion-form';
import { signosPendientes, type SignosValues } from '@/features/atenciones/domain/signos-vitales';

export const ATENCION_TABS = [
  { id: 'motivo-consulta', label: 'Motivo de consulta' },
  { id: 'antecedentes', label: 'Antecedentes' },
  { id: 'signos-vitales', label: 'Signos vitales' },
  { id: 'revision-sistemas', label: 'Revisión por sistemas' },
  { id: 'examen-fisico', label: 'Examen físico' },
  { id: 'diagnosticos', label: 'Diagnósticos' },
] as const;

export type AtencionTabId = (typeof ATENCION_TABS)[number]['id'];

/** Algo obligatorio sin diligenciar: dónde está y qué control enfocar para completarlo. */
export type Pendiente = { key: string; label: string; tab: AtencionTabId; inputId: string };

const FIELD_INPUT_ID: Record<keyof AtencionForm, string> = {
  motivoConsulta: 'atencion-motivo-consulta',
  enfermedadActual: 'atencion-enfermedad-actual',
};

export function signoInputId(key: string) {
  return `signo-${key}`;
}

/** Todo lo que falta para poder finalizar la atención, en el orden de las pestañas. */
export function atencionPendientesUi(form: AtencionForm, signos: SignosValues, tieneDiagnostico: boolean): Pendiente[] {
  return [
    ...atencionPendientes(form).map((item) => ({
      key: item.field,
      label: item.label,
      tab: 'motivo-consulta' as const,
      inputId: FIELD_INPUT_ID[item.field],
    })),
    ...signosPendientes(signos).map((field) => ({
      key: field.key,
      label: field.label,
      tab: 'signos-vitales' as const,
      inputId: signoInputId(field.key),
    })),
    ...(tieneDiagnostico
      ? []
      : [
          {
            key: 'diagnostico-principal',
            label: 'Diagnóstico principal',
            tab: 'diagnosticos' as const,
            inputId: 'diagnostico-0',
          },
        ]),
  ];
}
