import { ClipboardPenLine, FileHeart } from 'lucide-react';

import { Button } from '@/components/ui/button';

type Props = {
  saving: boolean;
  submitLabel: string;
  showDocumentChoices?: boolean;
  onClear: () => void;
  onCancel: () => void;
  onUpdate: () => void;
};

export function FormActions({
  saving,
  submitLabel,
  showDocumentChoices = false,
  onClear,
  onCancel,
  onUpdate,
}: Props) {
  return (
    <div className="space-y-4 border-t border-slate-200 pt-5">
      {showDocumentChoices ? (
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-slate-900">
            ¿Con cuál documento deseas comenzar?
          </legend>
          <p className="text-xs leading-5 text-slate-600">
            El expediente se abrirá directamente en la opción seleccionada.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="submit"
              name="documentoInicial"
              value="PCL"
              disabled={saving}
              className="min-h-12 rounded-xl bg-blue-600 px-4 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <FileHeart className="h-5 w-5" aria-hidden="true" />
              {saving ? 'Creando expediente…' : 'Iniciar Dictamen PCL'}
            </Button>
            <Button
              type="submit"
              name="documentoInicial"
              value="ORIGEN"
              disabled={saving}
              className="min-h-12 rounded-xl bg-emerald-600 px-4 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <ClipboardPenLine className="h-5 w-5" aria-hidden="true" />
              {saving ? 'Creando expediente…' : 'Iniciar Formulario de Origen'}
            </Button>
          </div>
        </fieldset>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={onClear} className="rounded-lg">
          Limpiar
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg">
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onUpdate}
            disabled={saving}
            className="rounded-lg"
          >
            {saving ? 'Guardando...' : 'Actualizar datos'}
          </Button>
          {!showDocumentChoices ? (
            <Button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {submitLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
