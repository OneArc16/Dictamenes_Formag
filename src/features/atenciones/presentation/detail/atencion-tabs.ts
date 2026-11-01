import { atencionPendientes, type AtencionForm } from '@/features/atenciones/domain/atencion-form';
import { signosPendientes, type SignosValues } from '@/features/atenciones/domain/signos-vitales';

export const ATENCION_TABS = [
  // short: lo que se ve en la pestaña para que todas quepan; label: el nombre completo.
  { id: 'motivo-consulta', short: 'Motivo', label: 'Motivo de consulta' },
  { id: 'antecedentes', short: 'Antecedentes', label: 'Antecedentes' },
  { id: 'signos-vitales', short: 'Signos', label: 'Signos vitales' },
  { id: 'revision-sistemas', short: 'Revisión', label: 'Revisión por sistemas' },
  { id: 'examen-fisico', short: 'Examen', label: 'Examen físico' },
  { id: 'diagnosticos', short: 'Diagnósticos', label: 'Diagnósticos' },
  { id: 'analisis-plan', short: 'Análisis y plan', label: 'Análisis y plan' },
  { id: 'remisiones', short: 'Remisiones', label: 'Remisiones' },
  { id: 'evoluciones', short: 'Evoluciones', label: 'Evoluciones' },
  { id: 'incapacidades', short: 'Incapacidades', label: 'Incapacidades' },
] as const;

export type AtencionTabId = (typeof ATENCION_TABS)[number]['id'];

/** Algo obligatorio sin diligenciar: dónde está y qué control enfocar para completarlo. */
export type Pendiente = { key: string; label: string; tab: AtencionTabId; inputId: string };

/** Pestaña y control de cada campo de texto de la atención. */
export const FIELD_LOCATION: Record<keyof AtencionForm, { tab: AtencionTabId; inputId: string }> = {
  motivoConsulta: { tab: 'motivo-consulta', inputId: 'atencion-motivo-consulta' },
  enfermedadActual: { tab: 'motivo-consulta', inputId: 'atencion-enfermedad-actual' },
  analisis: { tab: 'analisis-plan', inputId: 'atencion-analisis' },
  plan: { tab: 'analisis-plan', inputId: 'atencion-plan' },
  tratamiento: { tab: 'analisis-plan', inputId: 'atencion-tratamiento' },
};

const TAB_ORDER = ATENCION_TABS.map((tab) => tab.id) as AtencionTabId[];

export function signoInputId(key: string) {
  return `signo-${key}`;
}

/** Todo lo que falta para poder finalizar la atención, en el orden de las pestañas. */
export function atencionPendientesUi(form: AtencionForm, signos: SignosValues, tieneDiagnostico: boolean): Pendiente[] {
  const pendientes: Pendiente[] = [
    ...atencionPendientes(form).map((item) => ({ key: item.field, label: item.label, ...FIELD_LOCATION[item.field] })),
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
  return pendientes.sort((a, b) => TAB_ORDER.indexOf(a.tab) - TAB_ORDER.indexOf(b.tab));
}
