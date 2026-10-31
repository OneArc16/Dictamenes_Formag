import type { AtencionForm } from '@/features/atenciones/domain/atencion-form';

export const ATENCION_TABS = [
  { id: 'motivo-consulta', label: 'Motivo de consulta' },
  { id: 'antecedentes', label: 'Antecedentes' },
] as const;

export type AtencionTabId = (typeof ATENCION_TABS)[number]['id'];

/** Pestaña donde se diligencia cada campo, para llevar al médico a lo que falta. */
export const TAB_BY_FIELD: Record<keyof AtencionForm, AtencionTabId> = {
  motivoConsulta: 'motivo-consulta',
  enfermedadActual: 'motivo-consulta',
};

/** Id del control de cada campo, para enfocarlo desde la lista de pendientes. */
export const FIELD_INPUT_ID: Record<keyof AtencionForm, string> = {
  motivoConsulta: 'atencion-motivo-consulta',
  enfermedadActual: 'atencion-enfermedad-actual',
};
