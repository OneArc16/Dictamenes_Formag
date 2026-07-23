import { DocumentMetaCard } from '@/components/clinical-document/DocumentMetaCard';
import { DocenteSummaryCard } from '@/components/clinical-document/DocenteSummaryCard';
import { buildNumeroDictamen } from '../domain/numero-dictamen';
import type { FormularioOrigenDto } from './types';

export function FormularioOrigenLeftPanel({
  formulario,
  savingLabel,
  onDateChange,
}: {
  formulario: FormularioOrigenDto;
  savingLabel: string;
  onDateChange: (date: string) => void;
}) {
  let number = formulario.numeroDictamenOrigen;
  try {
    number = buildNumeroDictamen(
      formulario.fechaDictamenOrigen,
      formulario.docente.documento,
    );
  } catch {
    // El servidor conservará el último número válido.
  }

  return (
    <>
      <DocenteSummaryCard docente={formulario.docente} />
      <DocumentMetaCard
        title="Formulario de Origen"
        number={number}
        status={formulario.estado}
        date={formulario.fechaDictamenOrigen}
        dateLabel="Fecha del dictamen de Origen"
        dateInputId="origin-document-date"
        savingLabel={savingLabel}
        readOnly={formulario.readOnly}
        onDateChange={onDateChange}
      />
    </>
  );
}
