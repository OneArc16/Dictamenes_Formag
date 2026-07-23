import { DictamenReactPdf } from './DictamenReactPdf';

export type DictamenPdfData = Record<string, unknown> & {
  id?: number | string | null;
  numeroDictamen?: string | null;
  fechaDictamen?: string | Date | null;
  procedimientoPcl?: 'A' | 'B';
};

/**
 * Alias de compatibilidad para consumidores del primer prototipo de PDF.
 * La plantilla mantenida es DictamenReactPdf; así evitamos dos árboles de
 * documento divergentes.
 */
export function DictamenPdf({ data }: { data: DictamenPdfData }) {
  return <DictamenReactPdf dictamen={data} />;
}
