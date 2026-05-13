import { Button } from '@/components/ui/button';

type Props = {
  saving: boolean;
  submitLabel: string;
  onClear: () => void;
  onCancel: () => void;
  onUpdate: () => void;
};

export function FormActions({
  saving,
  submitLabel,
  onClear,
  onCancel,
  onUpdate,
}: Props) {
  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
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
        <Button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
